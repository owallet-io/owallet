import { CoinPretty, Dec, Int, PricePretty } from "@owallet/unit";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { showToast } from "@src/utils/helper";
import { observer } from "mobx-react-lite";
import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  FunctionComponent,
} from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { OWBox } from "../../../components/card";
import { useStore } from "../../../stores";
import { metrics, spacing } from "../../../themes";
import { tracking } from "@src/utils/tracking";
import { action, makeObservable, observable } from "mobx";
import { ChainIdHelper } from "@owallet/cosmos";
import {
  DenomDydx,
  removeDataInParentheses,
  unknownToken,
} from "@owallet/common";
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
import { RNMessageRequesterInternal } from "@src/router";
import { BACKGROUND_PORT } from "@owallet/router";
import { AlertIcon } from "@src/components/icon";
import { useIntl } from "react-intl";
import { ViewToken } from "@stores/huge-queries";

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

export const StakeCardAll = observer(({}) => {
  const { chainStore, accountStore, queriesStore, priceStore, keyRingStore } =
    useStore();
  // const style = useStyle();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPressingExpandButton, setIsPressingExpandButton] = useState(false);
  const intl = useIntl();

  const statesRef = useRef(new Map<string, ClaimAllEachState>());
  const getClaimAllEachState = (chainId: string): ClaimAllEachState => {
    const chainIdentifier = chainStore.getChain(chainId).chainIdentifier;
    let state = statesRef.current.get(chainIdentifier);
    if (!state) {
      state = new ClaimAllEachState();
      statesRef.current.set(chainIdentifier, state);
    }

    return state;
  };

  const viewTokens: Omit<ViewToken, "price">[] = (() => {
    const res: Omit<ViewToken, "price">[] = [];
    for (const chainInfo of chainStore.chainInfosInUI) {
      const chainId = chainInfo.chainId;
      const account = accountStore.getAccount(chainId);
      if (
        account.bech32Address === "" ||
        chainInfo.features.includes("not-support-staking")
      ) {
        continue;
      }
      const accountAddress = account.bech32Address;
      const queries = queriesStore.get(chainId);
      const queryRewards =
        queries.cosmos.queryRewards.getQueryBech32Address(accountAddress);

      const targetDenom = (() => {
        if (chainInfo.chainIdentifier === "dydx-mainnet") {
          return "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5";
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
            //@ts-ignore
            res.push({
              token: reward,
              chainInfo,
              isFetching: queryRewards.isFetching,
              error: queryRewards.error,
            });
          }
        }
      }
    }

    return res
      .filter((viewToken) => viewToken.token.toDec().gt(zeroDec))
      .sort((a, b) => {
        const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? zeroDec;
        const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? zeroDec;

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

  const totalPrice = (() => {
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    );
    if (!fiatCurrency) {
      return undefined;
    }

    let res = new PricePretty(fiatCurrency, 0);

    for (const viewToken of viewTokens) {
      const price = priceStore.calculatePrice(viewToken.token);
      if (price) {
        res = res.add(price);
      }
    }

    return res;
  })();

  const isLedger =
    keyRingStore.selectedKeyInfo &&
    keyRingStore.selectedKeyInfo.type === "ledger";

  const isKeystone =
    keyRingStore.selectedKeyInfo &&
    keyRingStore.selectedKeyInfo.type === "keystone";

  const claimAll = () => {
    if (viewTokens.length > 0) {
      setIsExpanded(true);
    }

    if (isLedger || isKeystone) {
      return;
    }

    for (const viewToken of viewTokens) {
      const chainId = viewToken.chainInfo.chainId;
      const account = accountStore.getAccount(chainId);

      if (
        account.bech32Address === "" ||
        viewToken.chainInfo.features.includes("not-support-staking")
      ) {
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
        let feeCurrency = chainInfo.hasFeature("feemarket")
          ? undefined
          : chainInfo.feeCurrencies.find(
              (cur) =>
                cur.coinMinimalDenom ===
                chainInfo.stakeCurrency?.coinMinimalDenom
            );

        if (chainInfo.hasFeature("osmosis-base-fee-beta") && feeCurrency) {
          const queryBaseFee = queriesStore.get(chainInfo.chainId).osmosis
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
                const currency = await chainInfo.findCurrencyAsync(
                  gasPrice.denom
                );
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
            const currency = await chainInfo.findCurrencyAsync(
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
            await priceStore.waitResponse();
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
            const feeCurrencyFetched = await chainInfo.findCurrencyAsync(
              feeCurrency.coinMinimalDenom
            );
            if (!feeCurrencyFetched) {
              state.setFailedReason(
                new Error(
                  intl.formatMessage({
                    id: "error.can-not-find-balance-for-fee-currency",
                  })
                )
              );
              return;
            }
            const balance = queries.queryBalances
              .getQueryBech32Address(account.bech32Address)
              .getBalance(feeCurrencyFetched);

            if (!balance) {
              state.setFailedReason(
                new Error(
                  intl.formatMessage({
                    id: "error.can-not-find-balance-for-fee-currency",
                  })
                )
              );
              return;
            }

            await balance.waitResponse();

            if (
              new Dec(balance.balance.toCoin().amount).lt(new Dec(fee.amount))
            ) {
              state.setFailedReason(
                new Error(
                  intl.formatMessage({
                    id: "error.not-enough-balance-to-pay-fee",
                  })
                )
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
              state.setFailedReason(
                new Error(
                  intl.formatMessage({
                    id: "error.claimable-reward-is-smaller-than-the-required-fee",
                  })
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
                  const requester = new RNMessageRequesterInternal();

                  return await requester.sendMessage(
                    BACKGROUND_PORT,
                    new PrivilegeCosmosSignAminoWithdrawRewardsMsg(
                      chainId,
                      signer,
                      signDoc
                    )
                  );
                },
                sendTx: async (
                  chainId: string,
                  tx: Uint8Array,
                  mode: BroadcastMode
                ): Promise<Uint8Array> => {
                  const requester = new RNMessageRequesterInternal();

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
                state.setFailedReason(
                  new Error(
                    intl.formatMessage({
                      id: "error.outdated-cosmos-sdk",
                    })
                  )
                );
                return;
              }
            }

            state.setFailedReason(e);
            console.log(e);
            return;
          }
        } else {
          state.setFailedReason(
            new Error(
              intl.formatMessage({
                id: "error.can-not-pay-for-fee-by-stake-currency",
              })
            )
          );
          return;
        }
      })();
    }
  };

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

  useEffect(() => {
    if (isExpanded) {
      if (!claimAllIsLoading) {
        // Clear errors when collapsed.
        for (const state of statesRef.current.values()) {
          state.setFailedReason(undefined);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);
  const { colors } = useTheme();
  const styles = styling(colors);

  return (
    <OWBox
      style={{
        marginHorizontal: 16,
        width: metrics.screenWidth - 32,
        marginTop: 2,
        backgroundColor: colors["neutral-surface-card"],
        padding: spacing["16"],
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <View>
        <View style={styles.cardBody}>
          <View>
            <View
              style={{
                flexDirection: "row",
                paddingBottom: 6,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => setIsExpanded((prev) => !prev)}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <View style={styles["claim-title"]}>
                  <OWIcon
                    name={"trending-outline"}
                    size={14}
                    color={colors["neutral-text-title"]}
                  />
                </View>
                <Text size={16} style={[{ ...styles["text-earn"] }]}>
                  {/*+*/}
                  {/*{totalStakingReward*/}
                  {/*  ? `${fiatCurrency.symbol}` + totalStakingReward*/}
                  {/*  : `${fiatCurrency.symbol}0`}*/}
                  {totalPrice ? totalPrice.separator(" ").toString() : "?"}
                </Text>
                {!isExpanded ? (
                  <OWIcon
                    name={"tdesignchevron-down"}
                    size={16}
                    color={colors["neutral-icon-on-light"]}
                  />
                ) : (
                  <OWIcon
                    name={"tdesignchevron-up"}
                    size={16}
                    color={colors["neutral-icon-on-light"]}
                  />
                )}
              </TouchableOpacity>
              <OWButton
                style={[
                  styles["btn-claim"],
                  {
                    backgroundColor: colors["primary-surface-default"],
                  },
                ]}
                textStyle={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors["neutral-text-action-on-dark-bg"],
                }}
                label="Claim all"
                disabled={claimAllDisabled}
                loading={claimAllIsLoading}
                onPress={claimAll}
              />
            </View>
            <View>
              {viewTokens.map((viewToken, index) => {
                if (!isExpanded && index >= 0) return null;
                return (
                  <ClaimTokenItem
                    key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                    viewToken={viewToken}
                    state={getClaimAllEachState(viewToken.chainInfo.chainId)}
                    itemsLength={viewTokens.length}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </OWBox>
  );
});

const ClaimTokenItem: FunctionComponent<{
  viewToken: Omit<ViewToken, "price">;
  state: ClaimAllEachState;
  itemsLength: number;
}> = observer(({ viewToken, state }) => {
  const { accountStore, priceStore, queriesStore } = useStore();
  const [isSimulating, setIsSimulating] = useState(false);

  const intl = useIntl();
  const defaultGasPerDelegation = 140000;

  const claim = async () => {
    if (state.failedReason) {
      state.setFailedReason(undefined);
      return;
    }
    const chainId = viewToken.chainInfo.chainId;
    const account = accountStore.getAccount(chainId);

    const queries = queriesStore.get(chainId);
    const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    );

    const validatorAddresses =
      queryRewards.getDescendingPendingRewardValidatorAddresses(8);

    if (validatorAddresses.length === 0) {
      return;
    }

    const tx =
      account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

    let gas = new Int(validatorAddresses.length * defaultGasPerDelegation);

    try {
      setIsSimulating(true);

      const simulated = await tx.simulate();

      // Gas adjustment is 1.5
      // Since there is currently no convenient way to adjust the gas adjustment on the UI,
      // Use high gas adjustment to prevent failure.
      gas = new Dec(simulated.gasUsed * 1.5).truncate();
    } catch (e) {
      console.log(e);
    }

    try {
      await tx.send(
        {
          gas: gas.toString(),
          amount: [],
        },
        "",
        {},
        {
          onBroadcasted: (txHash) => {
            // analyticsStore.logEvent('complete_claim', {
            //   chainId: viewToken.chainInfo.chainId,
            //   chainName: viewToken.chainInfo.chainName,
            // });
            // navigation.navigate('TxPending', {
            //   chainId,
            //   txHash: Buffer.from(txHash).toString('hex'),
            // });
          },
          onFulfill: (tx: any) => {
            if (tx.code != null && tx.code !== 0) {
              console.log(tx.log ?? tx.raw_log);

              showToast({
                type: "danger",
                message: intl.formatMessage({ id: "error.transaction-failed" }),
              });
              return;
            }
            showToast({
              type: "success",
              message: intl.formatMessage({
                id: "notification.transaction-success",
              }),
            });
          },
        }
      );
    } catch (e) {
      if (e?.message === "Request rejected") {
        return;
      }
      showToast({
        type: "danger",
        message: intl.formatMessage({ id: "error.transaction-failed" }),
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const isLoading =
    accountStore.getAccount(viewToken.chainInfo.chainId).isSendingMsg ===
      "withdrawRewards" ||
    state.isLoading ||
    isSimulating;
  const { colors } = useTheme();
  const styles = styling(colors);

  if (!viewToken) return;
  const isDisabledCompound = viewToken.chainInfo?.chainId?.includes("dydx");

  const _onPressCompound = async () => {
    try {
      if (state.failedReason) {
        state.setFailedReason(undefined);
        return;
      }
      const chainId = viewToken.chainInfo.chainId;
      const account = accountStore.getAccount(chainId);

      const queries = queriesStore.get(chainId);
      const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
      );
      const validatorAddresses =
        queryRewards.getDescendingPendingRewardValidatorAddresses(8);

      if (validatorAddresses.length === 0) {
        return;
      }
      const validatorRewards = validatorAddresses.map((validatorAddress) => {
        const rewards = queryRewards.getStakableRewardOf(validatorAddress);
        return { validatorAddress, rewards };
      });
      const tx = account.cosmos.makeWithdrawAndDelegationsRewardTx(
        validatorAddresses,
        validatorRewards
      );

      let gas = new Int(
        validatorAddresses.length * 2 * defaultGasPerDelegation
      );

      try {
        setIsSimulating(true);

        const simulated = await tx.simulate();

        // Gas adjustment is 1.5
        // Since there is currently no convenient way to adjust the gas adjustment on the UI,
        // Use high gas adjustment to prevent failure.
        gas = new Dec(simulated.gasUsed * 1.5).truncate();
      } catch (e) {
        console.log(e);
      }
      await tx.send(
        {
          gas: gas.toString(),
          amount: [],
        },
        "",
        {},
        {
          onBroadcasted: (txHash) => {
            // analyticsStore.logEvent('complete_claim', {
            //   chainId: viewToken.chainInfo.chainId,
            //   chainName: viewToken.chainInfo.chainName,
            // });
            // navigation.navigate('TxPending', {
            //   chainId,
            //   txHash: Buffer.from(txHash).toString('hex'),
            // });
          },
          onFulfill: (tx: any) => {
            if (tx.code != null && tx.code !== 0) {
              console.log(tx.log ?? tx.raw_log);

              showToast({
                type: "danger",
                message: intl.formatMessage({ id: "error.transaction-failed" }),
              });
              return;
            }
            showToast({
              type: "success",
              message: intl.formatMessage({
                id: "notification.transaction-success",
              }),
            });
          },
        }
      );
    } catch (e) {
      console.error({ errorClaim: e });
      if (!e?.message?.startsWith("Transaction Rejected")) {
        showToast({
          message:
            `Failed to Compound: ${e?.message}` ??
            "Something went wrong! Please try again later.",
          type: "danger",
        });
        return;
      }
    }
  };
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
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
          <OWIcon
            type="images"
            source={{
              uri:
                viewToken?.chainInfo?.stakeCurrency?.coinImageUrl ||
                unknownToken.coinImageUrl,
            }}
            style={{
              borderRadius: 999,
            }}
            size={22}
          />
        </View>
        <View>
          <Text
            style={[
              {
                ...styles["text-amount"],
              },
            ]}
          >
            +
            {viewToken.token
              ? priceStore.calculatePrice(viewToken.token).toString()
              : "$0"}
          </Text>
          <Text style={[styles["amount"]]}>
            {removeDataInParentheses(
              viewToken.token
                ?.maxDecimals(6)
                .shrink(true)
                .inequalitySymbol(true)
                // .hideDenom(true)
                ?.toString()
            )}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <OWButton
          type="link"
          label="Claim"
          loading={isLoading}
          onPress={claim}
          icon={
            state.failedReason ? (
              <AlertIcon color={colors["error-text-action"]} size={20} />
            ) : undefined
          }
          textStyle={{
            color: colors["neutral-text-title"],
          }}
          colorLoading={colors["neutral-text-title"]}
          disabled={
            isLoading ||
            accountStore.getAccount(viewToken?.chainInfo.chainId)
              .isSendingMsg === "withdrawRewardsAndDelegation"
          }
          fullWidth={false}
          size={"small"}
        />
        <OWButton
          onPress={_onPressCompound}
          disabled={
            accountStore.getAccount(viewToken?.chainInfo.chainId)
              .isSendingMsg === "withdrawRewardsAndDelegation" ||
            isDisabledCompound
          }
          type="link"
          label="Compound"
          colorLoading={colors["neutral-text-title"]}
          textStyle={{
            color: colors["neutral-text-title"],
          }}
          style={{
            opacity: isDisabledCompound ? 0.5 : 1,
          }}
          loading={
            accountStore.getAccount(viewToken?.chainInfo.chainId)
              .isSendingMsg === "withdrawRewardsAndDelegation"
          }
          size={"small"}
          fullWidth={false}
        />
      </View>
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    cardBody: {},
    "flex-center": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    "text-earn": {
      fontWeight: "600",
      lineHeight: 24,
      color: colors["success-text-body"],
      paddingRight: 2,
    },
    "text-amount": {
      fontWeight: "500",
      fontSize: 14,
      color: colors["success-text-body"],
    },

    amount: {
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 20,
      color: colors["neutral-text-body"],
    },
    "btn-claim": {
      backgroundColor: colors["primary-surface-default"],
      borderRadius: 999,
      width: metrics.screenWidth / 4,
      height: 32,
    },
    "claim-title": {
      width: 24,
      height: 24,
      borderRadius: 24,
      backgroundColor: colors["neutral-surface-action"],
      marginRight: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    getStarted: {
      borderRadius: 999,
      width: metrics.screenWidth / 2.45,
      height: 32,
    },

    btnGroup: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      borderTopColor: colors["neutral-border-default"],
      borderTopWidth: 1,
      paddingTop: 8,
    },
    outlineButton: {
      padding: 8,
      fontWeight: "600",
    },
  });
