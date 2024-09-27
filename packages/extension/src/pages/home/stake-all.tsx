import React, { FunctionComponent, useRef } from "react";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import styleStake from "./stake.module.scss";
import classnames from "classnames";
import { Dec } from "@owallet/unit";
import { useHistory } from "react-router";
import { FormattedMessage } from "react-intl";
import { ChainIdEnum } from "@owallet/common";
import { Button } from "components/common/button";
import { Text } from "components/common/text";
import colors from "theme/colors";
import { toast } from "react-toastify";
import { ChainIdHelper } from "@owallet/cosmos";
import { DenomDydx } from "@owallet/common";
import { ObservableQueryRewardsInner } from "@owallet/stores";
import {
  AminoSignResponse,
  BroadcastMode,
  FeeCurrency,
  StdSignDoc,
} from "@owallet/types";
import { useSendTxConfig } from "@owallet/hooks";
import { DefaultGasPriceStep } from "@owallet/hooks";
import {
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
  SendTxMsg,
} from "@owallet/background";
import { isSimpleFetchError } from "@owallet/simple-fetch";
import { BACKGROUND_PORT } from "@owallet/router";
import { CoinPretty, PricePretty } from "@owallet/unit";
import { ViewToken } from "@owallet/types";
import { action, makeObservable, observable } from "mobx";
import { InExtensionMessageRequester } from "@owallet/router-extension";

interface StakeViewToken extends ViewToken {
  queryRewards: ObservableQueryRewardsInner;
}

class ClaimAllEachState {
  @observable
  isLoading: boolean = false;

  @observable
  failedReason: Error | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  @action
  setIsLoading(value: boolean): void {
    this.isLoading = value;
  }

  @action
  setFailedReason(value: Error | undefined): void {
    this.isLoading = false;
    this.failedReason = value;
  }
}

const zeroDec = new Dec(0);

export const StakeAll: FunctionComponent = observer(() => {
  const history = useHistory();
  const { chainStore, accountStore, queriesStore, analyticsStore, priceStore } =
    useStore();
  const chainId = chainStore.isAllNetwork
    ? ChainIdEnum.Oraichain
    : chainStore.current.chainId;
  const accountInfo = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const stakableReward = rewards.stakableReward;
  const totalStakingReward = priceStore.calculatePrice(stakableReward);
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const delegated = queryDelegated.total;
  const totalPrice = priceStore.calculatePrice(delegated);
  const isRewardExist = rewards.rewards.length > 0;

  const statesRef = useRef(new Map<string, ClaimAllEachState>());
  const getClaimAllEachState = (chainId: string): ClaimAllEachState => {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    let state = statesRef.current.get(chainIdentifier.identifier);
    if (!state) {
      state = new ClaimAllEachState();
      statesRef.current.set(chainIdentifier.identifier, state);
    }

    return state;
  };

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainStore.current.chainId,
    //@ts-ignore
    accountInfo.msgOpts.compound,
    accountInfo.bech32Address,
    queriesStore.get(chainStore.current.chainId).queryBalances
  );

  const viewTokens: StakeViewToken[] = (() => {
    const res: StakeViewToken[] = [];
    for (const chainInfo of chainStore.chainInfosInUI) {
      const chainId = chainInfo.chainId;
      const accountAddress = accountStore.getAccount(chainId).bech32Address;
      const queries = queriesStore.get(chainId);
      const queryRewards =
        queries.cosmos.queryRewards.getQueryBech32Address(accountAddress);

      const targetDenom = (() => {
        if (chainInfo.chainId?.includes("dydx-mainnet")) {
          return DenomDydx;
        }
        return chainInfo.stakeCurrency?.coinMinimalDenom;
      })();
      if (targetDenom) {
        const currency = chainInfo.findCurrency(targetDenom);
        if (currency) {
          const reward = queryRewards.rewards.find(
            (r) => r.currency.coinMinimalDenom === targetDenom
          );
          if (reward) {
            res.push({
              queryRewards,
              token: reward,
              chainInfo,
              isFetching: queryRewards.isFetching,
              error: queryRewards.error,
              price: priceStore.calculatePrice(reward),
            });
          }
        }
      }
    }

    return res
      .filter((viewToken) => viewToken.token.toDec().gt(zeroDec))
      .sort((a, b) => {
        const aPrice = a.price?.toDec() ?? zeroDec;
        const bPrice = b.price?.toDec() ?? zeroDec;

        if (aPrice.equals(bPrice)) {
          return 0;
        }
        return aPrice.gt(bPrice) ? -1 : 1;
      })
      .sort((a, b) => {
        const aHasError =
          getClaimAllEachState(a.chainInfo.chainId).failedReason != null;
        const bHasError =
          getClaimAllEachState(b.chainInfo.chainId).failedReason != null;

        if (aHasError || bHasError) {
          if (aHasError && bHasError) {
            return 0;
          } else if (aHasError) {
            return 1;
          } else {
            return -1;
          }
        }

        return 0;
      });
  })();

  const claimAll = () => {
    // analyticsStore.logEvent('click_claimAll');

    for (const viewToken of viewTokens) {
      const chainId = viewToken.chainInfo.chainId;
      const account = accountStore.getAccount(chainId);

      if (!account.bech32Address) {
        continue;
      }

      const chainInfo = chainStore.getChain(chainId);
      const queries = queriesStore.get(chainId);
      const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
      );

      const validatorAddresses =
        queryRewards.getDescendingPendingRewardValidatorAddresses(8);

      if (validatorAddresses.length === 0) {
        continue;
      }

      const state = getClaimAllEachState(chainId);

      state.setIsLoading(true);

      const tx =
        account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

      (async () => {
        // feemarket feature가 있는 경우 이후의 로직에서 사용할 수 있는 fee currency를 찾아야하기 때문에 undefined로 시작시킨다.
        let feeCurrency = chainInfo.hasFeature("feemarket")
          ? undefined
          : chainInfo.feeCurrencies.find(
              (cur) =>
                cur.coinMinimalDenom ===
                chainInfo.stakeCurrency?.coinMinimalDenom
            );

        if (chainInfo.hasFeature("osmosis-base-fee-beta") && feeCurrency) {
          const queryBaseFee = queriesStore.get(chainInfo.chainId).cosmos
            .queryBaseFee;
          const queryRemoteBaseFeeStep = queriesStore.simpleQuery.queryGet<{
            low?: number;
            average?: number;
            high?: number;
          }>(
            "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws/osmosis/osmosis-base-fee-beta.json"
          );

          await queryBaseFee.waitFreshResponse();
          await queryRemoteBaseFeeStep.waitFreshResponse();

          const baseFee = queryBaseFee.baseFee;
          const remoteBaseFeeStep = queryRemoteBaseFeeStep.response;
          if (baseFee) {
            const low = remoteBaseFeeStep?.data.low
              ? parseFloat(
                  baseFee.mul(new Dec(remoteBaseFeeStep.data.low)).toString(8)
                )
              : feeCurrency.gasPriceStep?.low ?? DefaultGasPriceStep.low;
            const average = Math.max(
              low,
              remoteBaseFeeStep?.data.average
                ? parseFloat(
                    baseFee
                      .mul(new Dec(remoteBaseFeeStep.data.average))
                      .toString(8)
                  )
                : feeCurrency.gasPriceStep?.average ??
                    DefaultGasPriceStep.average
            );
            const high = Math.max(
              average,
              remoteBaseFeeStep?.data.high
                ? parseFloat(
                    baseFee
                      .mul(new Dec(remoteBaseFeeStep.data.high))
                      .toString(8)
                  )
                : feeCurrency.gasPriceStep?.high ?? DefaultGasPriceStep.high
            );

            feeCurrency = {
              ...feeCurrency,
              gasPriceStep: {
                low,
                average,
                high,
              },
            };
          }
        }

        if (!feeCurrency) {
          let prev:
            | {
                balance: CoinPretty;
                price: PricePretty | undefined;
              }
            | undefined;

          const feeCurrencies = await (async () => {
            if (chainInfo.hasFeature("feemarket")) {
              const queryFeeMarketGasPrices =
                queriesStore.get(chainId).cosmos.queryFeeMarketGasPrices;
              await queryFeeMarketGasPrices.waitFreshResponse();

              const result: FeeCurrency[] = [];

              for (const gasPrice of queryFeeMarketGasPrices.gasPrices) {
                const currency = await chainInfo.findCurrency(gasPrice.denom);
                if (currency) {
                  let multiplication = {
                    low: 1.1,
                    average: 1.2,
                    high: 1.3,
                  };

                  const multificationConfig =
                    queriesStore.simpleQuery.queryGet<{
                      [str: string]:
                        | {
                            low: number;
                            average: number;
                            high: number;
                          }
                        | undefined;
                    }>(
                      "https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws",
                      "/feemarket/info.json"
                    );

                  if (multificationConfig.response) {
                    const _default =
                      multificationConfig.response.data["__default__"];
                    if (
                      _default &&
                      _default.low != null &&
                      typeof _default.low === "number" &&
                      _default.average != null &&
                      typeof _default.average === "number" &&
                      _default.high != null &&
                      typeof _default.high === "number"
                    ) {
                      multiplication = {
                        low: _default.low,
                        average: _default.average,
                        high: _default.high,
                      };
                    }
                    const specific =
                      multificationConfig.response.data[
                        chainInfo.chainIdentifier
                      ];
                    if (
                      specific &&
                      specific.low != null &&
                      typeof specific.low === "number" &&
                      specific.average != null &&
                      typeof specific.average === "number" &&
                      specific.high != null &&
                      typeof specific.high === "number"
                    ) {
                      multiplication = {
                        low: specific.low,
                        average: specific.average,
                        high: specific.high,
                      };
                    }
                  }

                  result.push({
                    ...currency,
                    gasPriceStep: {
                      low: parseFloat(
                        new Dec(multiplication.low)
                          .mul(gasPrice.amount)
                          .toString()
                      ),
                      average: parseFloat(
                        new Dec(multiplication.average)
                          .mul(gasPrice.amount)
                          .toString()
                      ),
                      high: parseFloat(
                        new Dec(multiplication.high)
                          .mul(gasPrice.amount)
                          .toString()
                      ),
                    },
                  });
                }
              }

              return result;
            } else {
              return chainInfo.feeCurrencies;
            }
          })();

          for (const chainFeeCurrency of feeCurrencies) {
            const currency = await chainInfo.findCurrency(
              chainFeeCurrency.coinMinimalDenom
            );
            if (currency) {
              const balance = queries.queryBalances
                .getQueryBech32Address(account.bech32Address)
                .getBalance(currency);
              if (balance && balance.balance.toDec().gt(new Dec(0))) {
                const price = await priceStore.waitCalculatePrice(
                  balance.balance,
                  "usd"
                );

                if (!prev) {
                  feeCurrency = {
                    ...chainFeeCurrency,
                    ...currency,
                  };
                  prev = {
                    balance: balance.balance,
                    price,
                  };
                } else {
                  if (!prev.price) {
                    if (prev.balance.toDec().lt(balance.balance.toDec())) {
                      feeCurrency = {
                        ...chainFeeCurrency,
                        ...currency,
                      };
                      prev = {
                        balance: balance.balance,
                        price,
                      };
                    }
                  } else if (price) {
                    if (prev.price.toDec().lt(price.toDec())) {
                      feeCurrency = {
                        ...chainFeeCurrency,
                        ...currency,
                      };
                      prev = {
                        balance: balance.balance,
                        price,
                      };
                    }
                  }
                }
              }
            }
          }
        }

        if (feeCurrency) {
          try {
            const simulated = await tx.simulate();

            // Gas adjustment is 1.5
            // Since there is currently no convenient way to adjust the gas adjustment on the UI,
            // Use high gas adjustment to prevent failure.
            const gasEstimated = new Dec(simulated.gasUsed * 1.5).truncate();
            let fee = {
              denom: feeCurrency.coinMinimalDenom,
              amount: new Dec(feeCurrency.gasPriceStep?.average ?? 0.025)
                .mul(new Dec(gasEstimated))
                .roundUp()
                .toString(),
            };

            // coingecko로부터 캐시가 있거나 response를 최소한 한번은 받았다는 걸 보장한다.
            await priceStore.waitResponse();
            // USD 기준으로 average fee가 0.2달러를 넘으면 low로 설정해서 보낸다.
            const averageFeePrice = priceStore.calculatePrice(
              new CoinPretty(feeCurrency, fee.amount),
              "usd"
            );
            if (averageFeePrice && averageFeePrice.toDec().gte(new Dec(0.2))) {
              fee = {
                denom: feeCurrency.coinMinimalDenom,
                amount: new Dec(feeCurrency.gasPriceStep?.low ?? 0.025)
                  .mul(new Dec(gasEstimated))
                  .roundUp()
                  .toString(),
              };
              console.log(
                `(${chainId}) Choose low gas price because average fee price is greater or equal than 0.2 USD`
              );
            }

            // Ensure fee currency fetched before querying balance
            const feeCurrencyFetched = await chainInfo.findCurrency(
              feeCurrency.coinMinimalDenom
            );
            if (!feeCurrencyFetched) {
              state.setFailedReason(
                new Error("error.can-not-find-balance-for-fee-currency")
              );
              return;
            }
            const balance = queries.queryBalances
              .getQueryBech32Address(account.bech32Address)
              .getBalance(feeCurrencyFetched);

            if (!balance) {
              state.setFailedReason(
                new Error("error.can-not-find-balance-for-fee-currency")
              );
              return;
            }

            await balance.waitResponse();

            if (
              new Dec(balance.balance.toCoin().amount).lt(new Dec(fee.amount))
            ) {
              state.setFailedReason(
                new Error("error.not-enough-balance-to-pay-fee")
              );
              return;
            }

            if (
              (viewToken.token.toCoin().denom === fee.denom &&
                new Dec(viewToken.token.toCoin().amount).lte(
                  new Dec(fee.amount)
                )) ||
              (await (async () => {
                if (viewToken.token.toCoin().denom !== fee.denom) {
                  if (
                    viewToken.token.currency.coinGeckoId &&
                    feeCurrencyFetched.coinGeckoId
                  ) {
                    const rewardPrice = await priceStore.waitCalculatePrice(
                      viewToken.token,
                      "usd"
                    );
                    const feePrice = await priceStore.waitCalculatePrice(
                      new CoinPretty(feeCurrencyFetched, fee.amount),
                      "usd"
                    );
                    if (
                      rewardPrice &&
                      rewardPrice.toDec().gt(new Dec(0)) &&
                      feePrice &&
                      feePrice.toDec().gt(new Dec(0))
                    ) {
                      if (
                        rewardPrice
                          .toDec()
                          .mul(new Dec(1.2))
                          .lte(feePrice.toDec())
                      ) {
                        return true;
                      }
                    }
                  }
                }

                return false;
              })())
            ) {
              console.log(
                `(${chainId}) Skip claim rewards. Fee: ${fee.amount}${
                  fee.denom
                } is greater than stakable reward: ${
                  viewToken.token.toCoin().amount
                }${viewToken.token.toCoin().denom}`
              );
              state.setFailedReason(
                new Error(
                  "error.claimable-reward-is-smaller-than-the-required-fee"
                )
              );
              return;
            }

            await tx.send(
              {
                gas: gasEstimated.toString(),
                amount: [fee],
              },
              "",
              {
                signAmino: async (
                  chainId: string,
                  signer: string,
                  signDoc: StdSignDoc
                ): Promise<AminoSignResponse> => {
                  const requester = new InExtensionMessageRequester();

                  return await requester.sendMessage(
                    BACKGROUND_PORT,
                    new PrivilegeCosmosSignAminoWithdrawRewardsMsg(
                      chainId,
                      signer,
                      signDoc,
                      {}
                    )
                  );
                },
                sendTx: async (
                  chainId: string,
                  tx: Uint8Array,
                  mode: BroadcastMode
                ): Promise<Uint8Array> => {
                  const requester = new InExtensionMessageRequester();

                  return await requester.sendMessage(
                    BACKGROUND_PORT,
                    new SendTxMsg(chainId, tx, mode, true)
                  );
                },
              },
              {
                onBroadcasted: () => {
                  // analyticsStore.logEvent('complete_claim', {
                  //   chainId: viewToken.chainInfo.chainId,
                  //   chainName: viewToken.chainInfo.chainName,
                  //   isClaimAll: true,
                  // });
                },
                onFulfill: (tx: any) => {
                  // Tx가 성공한 이후에 rewards가 다시 쿼리되면서 여기서 빠지는게 의도인데...
                  // 쿼리하는 동안 시간차가 있기 때문에 훼이크로 그냥 1초 더 기다린다.
                  setTimeout(() => {
                    state.setIsLoading(false);
                  }, 1000);

                  if (tx.code) {
                    state.setFailedReason(new Error(tx["raw_log"]));
                  }
                },
              }
            );
          } catch (e) {
            if (isSimpleFetchError(e) && e.response) {
              const response = e.response;
              if (
                response.status === 400 &&
                response.data?.message &&
                typeof response.data.message === "string" &&
                response.data.message.includes("invalid empty tx")
              ) {
                state.setFailedReason(new Error("error.outdated-cosmos-sdk"));
                return;
              }
            }

            state.setFailedReason(e);
            console.log(e);
            return;
          }
        } else {
          state.setFailedReason(
            new Error("error.can-not-pay-for-fee-by-stake-currency")
          );
          return;
        }
      })();
    }
  };

  const withdrawAllRewards = async () => {
    if (accountInfo.isReadyToSendMsgs) {
      try {
        // When the user delegated too many validators,
        // it can't be sent to withdraw rewards from all validators due to the block gas limit.
        // So, to prevent this problem, just send the msgs up to 8.
        await accountInfo.cosmos.sendWithdrawDelegationRewardMsgs(
          rewards.getDescendingPendingRewardValidatorAddresses(8),
          "",
          undefined,
          undefined,
          {
            onBroadcasted: () => {
              analyticsStore.logEvent("Claim reward tx broadcasted", {
                chainId: chainId,
                chainName: chainStore.current.chainName,
              });
            },
            onFulfill: (tx) => {
              console.log(tx, "TX INFO ON CLAIM PAGE!!!!!!!!!!!!!!!!!!!!!");
            },
          },
          stakableReward.currency.coinMinimalDenom
        );
        history.push("/");

        toast(`Success`, {
          type: "success",
        });
      } catch (e) {
        history.push("/");
        toast(`Fail to withdraw rewards: ${e.message}`, {
          type: "error",
        });
      }
    }
  };

  return (
    <div className={classnames(styleStake.containerStakeCard)}>
      <div className={classnames(styleStake.containerInner, styleStake.reward)}>
        <div className={styleStake.vertical}>
          <p
            className={classnames(
              "h4",
              "my-0",
              "font-weight-normal",
              styleStake.paragraphSub
            )}
          >
            <Text size={14} weight="600">
              <FormattedMessage id="main.stake.message.pending-staking-reward" />
            </Text>
          </p>
          <Text color={colors["success-text-body"]} weight="500" size={28}>
            +
            {totalStakingReward
              ? totalStakingReward.toString()
              : stakableReward.shrink(true).maxDecimals(6).toString()}
          </Text>
          <Text>
            {stakableReward.toDec().gt(new Dec(0.001))
              ? stakableReward
                  .shrink(true)
                  .maxDecimals(6)
                  .trim(true)
                  .upperCase(true)
                  .toString()
              : `< 0.001 ${stakableReward.toCoin().denom.toUpperCase()}`}
            {rewards.isFetching ? (
              <span>
                <i className="fas fa-spinner fa-spin" />
              </span>
            ) : null}
          </Text>
        </div>
        <div style={{ flex: 1 }} />
        <Button
          size="small"
          className={styleStake.button}
          disabled={!isRewardExist || !accountInfo.isReadyToSendMsgs}
          onClick={withdrawAllRewards}
          data-loading={accountInfo.isSendingMsg === "withdrawRewards"}
        >
          <div style={{ paddingLeft: 12, paddingRight: 12 }}>
            <Text
              size={14}
              weight="500"
              color={colors["neutral-text-action-on-dark-bg"]}
            >
              <FormattedMessage id="main.stake.button.claim-rewards" />
            </Text>
          </div>
        </Button>
      </div>
      <div
        style={{
          backgroundColor: colors["primary-surface-subtle"],
          marginTop: 6,
          borderRadius: 16,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          display: "flex",
        }}
      >
        <Text weight="500" color={colors["neutral-text-action-on-light-bg"]}>
          Staked:{" "}
          {totalPrice
            ? totalPrice.toString()
            : delegated.shrink(true).maxDecimals(6).toString()}
        </Text>
        <Text weight="500" color={colors["neutral-text-action-on-light-bg"]}>
          {delegated
            .shrink(true)
            .maxDecimals(6)
            .trim(true)
            .upperCase(true)
            .toString()}
        </Text>
      </div>
    </div>
  );
});
