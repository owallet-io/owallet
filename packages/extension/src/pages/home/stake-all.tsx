import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import styleStake from "./stake.module.scss";
import classnames from "classnames";
import { Dec } from "@owallet/unit";
import { useHistory } from "react-router";
import { FormattedMessage } from "react-intl";
import {
  ChainIdEnum,
  removeDataInParentheses,
  unknownToken,
} from "@owallet/common";
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
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const chainId = chainStore.isAllNetwork
    ? ChainIdEnum.Oraichain
    : chainStore.current.chainId;
  const accountInfo = accountStore.getAccount(chainId);

  const [totalStakingReward, setTotalStakingReward] = useState(`0`);
  const [viewMore, setViewMore] = useState(false);
  const [isClaimLoading, setClaimLoading] = useState(false);
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

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
    setClaimLoading(true);
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
                  setTimeout(() => {
                    state.setIsLoading(false);
                  }, 1000);

                  if (tx.code) {
                    state.setFailedReason(new Error(tx["raw_log"]));
                  }
                },
              }
            );
            state.setIsLoading(false);
            setClaimLoading(false);
          } catch (e) {
            state.setIsLoading(false);
            setClaimLoading(false);
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

  useEffect(() => {
    if (viewTokens.length > 0) {
      let tmpRewards = 0;
      viewTokens.map((token) => {
        tmpRewards += Number(token.price.toDec().toString());
      });
      setTotalStakingReward(tmpRewards.toFixed(4));
    } else {
      setTotalStakingReward(`0`);
    }
  }, [viewTokens]);

  const renderToken = useCallback((token) => {
    if (!token) return;
    const isDisabledCompound = token.chainInfo?.chainId?.includes("dydx");
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            flexDirection: "row",
            alignItems: "center",
            display: "flex",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors["neutral-icon-on-dark"],
              marginRight: 8,
            }}
          >
            <img
              src={
                token?.chainInfo?.stakeCurrency?.coinImageUrl ||
                unknownToken.coinImageUrl
              }
              style={{
                width: 32,
                height: 32,
                borderRadius: 32,
              }}
            />
          </div>
          <div>
            <div style={{ color: colors["success-text-body"], fontSize: 14 }}>
              +{token.price ? token.price?.toString() : "$0"}
            </div>
            <div style={{ color: colors["neutral-text-body"], fontSize: 13 }}>
              {removeDataInParentheses(
                token.token
                  ?.shrink(true)
                  .maxDecimals(6)
                  .trim(true)
                  .upperCase(true)
                  .toString()
              )}
            </div>
          </div>
        </div>
        <div style={{ flexDirection: "row" }}>
          <div
            style={{
              color: colors["neutral-text-heading"],
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => {}}
          ></div>
          <div
            onClick={() => {}}
            style={{
              opacity: isDisabledCompound ? 0.5 : 1,
            }}
          />
        </div>
      </div>
    );
  }, []);

  const claimAllDisabled = (() => {
    if (viewTokens.length === 0) {
      return true;
    }

    for (const viewToken of viewTokens) {
      if (viewToken.token.toDec().gt(new Dec(0))) {
        return false;
      }
    }

    return true;
  })();

  const claimAllIsLoading = (() => {
    for (const chainInfo of chainStore.chainInfosInUI) {
      const state = getClaimAllEachState(chainInfo.chainId);
      if (state.isLoading) {
        return true;
      }
    }
    return false;
  })();

  if (Number(totalStakingReward) <= 0) return;

  return (
    <div className={classnames(styleStake.containerStakeCard)}>
      <div className={classnames(styleStake.containerInner, styleStake.reward)}>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            setViewMore(!viewMore);
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 28,
              marginRight: 4,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors["neutral-surface-action"],
              display: "flex",
            }}
          >
            <img src={require("assets/images/tdesign_trending-up.svg")} />
          </div>
          <div
            style={{
              color: colors["success-text-body"],
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            +
            {totalStakingReward
              ? `${fiatCurrency.symbol}` + totalStakingReward
              : `${fiatCurrency.symbol}0`}
          </div>
          {!viewMore ? (
            <img src={require("assets/images/tdesign_chevron_down.svg")} />
          ) : (
            <img src={require("assets/images/tdesign_chevron_up.svg")} />
          )}
        </div>
        <div style={{ flex: 1 }} />
        <Button
          size="small"
          className={styleStake.button}
          onClick={claimAll}
          disabled={claimAllIsLoading || claimAllDisabled}
          data-loading={claimAllIsLoading}
        >
          <div
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              display: "flex",
              flexDirection: "row",
            }}
          >
            {isClaimLoading || claimAllIsLoading ? (
              <span>
                <i className="fas fa-spinner fa-spin" />
              </span>
            ) : null}
            <div color={colors["neutral-text-action-on-dark-bg"]}>
              {"Claim All"}
            </div>
          </div>
        </Button>
      </div>
      <div style={{ marginTop: 16 }}>
        {viewTokens.map((token, index) => {
          if (!viewMore && index >= 0) return null;
          return renderToken(token);
        })}
      </div>
    </div>
  );
});

const ClaimTokenItem: FunctionComponent<{
  viewToken: StakeViewToken;
  state: ClaimAllEachState;
  _onPressClaim: Function;
  itemsLength: number;
}> = observer(({ viewToken, state, _onPressClaim }) => {
  const { accountStore } = useStore();

  const isLoading =
    accountStore.getAccount(viewToken.chainInfo.chainId).isSendingMsg ===
      "withdrawRewards" || state.isLoading;

  if (!viewToken) return;
  const isDisabledCompound = viewToken.chainInfo?.chainId?.includes("dydx");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          flexDirection: "row",
          alignItems: "center",
          display: "flex",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 32,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors["neutral-icon-on-dark"],
            marginRight: 8,
          }}
        >
          <img
            src={
              viewToken?.chainInfo?.stakeCurrency?.coinImageUrl ||
              unknownToken.coinImageUrl
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: 32,
            }}
          />
        </div>
        <div>
          <div style={{ color: colors["success-text-body"], fontSize: 14 }}>
            +{viewToken.price ? viewToken.price?.toString() : "$0"}
          </div>
          <div style={{ color: colors["neutral-text-body"], fontSize: 13 }}>
            {removeDataInParentheses(
              viewToken.token
                ?.shrink(true)
                .maxDecimals(6)
                .trim(true)
                .upperCase(true)
                .toString()
            )}
          </div>
        </div>
      </div>
      <div style={{ flexDirection: "row" }}>
        <div
          style={{
            color: colors["neutral-text-heading"],
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => {
            _onPressClaim(viewToken.queryRewards, viewToken.chainInfo.chainId);
          }}
        >
          {state.failedReason ? (
            <img src={require("assets/svg/tdesign_chevron_down.svg")} />
          ) : undefined}
          {isLoading ? (
            <span>
              <i className="fas fa-spinner fa-spin" />
            </span>
          ) : (
            "Claim"
          )}
        </div>
        <div
          onClick={() => {}}
          style={{
            opacity: isDisabledCompound ? 0.5 : 1,
          }}
        />
      </div>
    </div>
  );
});
