import { CoinPretty, Dec } from "@owallet/unit";
import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { SCREENS } from "@src/common/constants";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { checkRouter } from "@src/router/root";
import { useTheme } from "@src/themes/theme-provider";
import { convertArrToObject, showToast } from "@src/utils/helper";
import { observer } from "mobx-react-lite";
import React, { useRef, useCallback, useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { OWBox } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation.provider";
import { useStore } from "../../../stores";
import { metrics, spacing } from "../../../themes";
import { tracking } from "@src/utils/tracking";
import { ViewToken } from "@owallet/types";
import { action, makeObservable, observable } from "mobx";
import { ChainIdHelper } from "@owallet/cosmos";
import { unknownToken } from "@owallet/common";
import { DefaultGasPriceStep } from "@owallet/hooks";
import { ObservableQueryRewardsInner } from "@owallet/stores";

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

export const StakeCardAll = observer(({}) => {
  const route = useRoute<RouteProp<Record<string, {}>, string>>();
  const smartNavigation = useSmartNavigation();
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    keyRingStore,
    appInitStore,
  } = useStore();

  const navigation = useNavigation();

  const [totalStakingReward, setTotalStakingReward] = useState(`0`);
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  const { colors } = useTheme();
  const chainId = chainStore.current.chainId;
  const styles = styling(colors);
  const account = accountStore.getAccount(chainId);

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

  const claimAll = async () => {
    for (const viewToken of viewTokens) {
      const chainId = viewToken.chainInfo.chainId;
      const account = accountStore.getAccount(chainId);

      if (!account.bech32Address) {
        continue;
      }

      const state = getClaimAllEachState(chainId);

      state.setIsLoading(true);

      viewTokens.map(async (token) => {
        await account.cosmos.sendWithdrawDelegationRewardMsgs(
          token.queryRewards.getDescendingPendingRewardValidatorAddresses(10),
          "",
          {},
          {},
          {
            onBroadcasted: (txHash) => {},
          },
          token.token?.currency.coinMinimalDenom
        );
      });
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

  const _onPressCompound = async (queryReward, chainId) => {
    try {
      const queries = queriesStore.get(chainId);
      const account = accountStore.getAccount(chainId);

      const validatorRewars = [];
      queryReward
        .getDescendingPendingRewardValidatorAddresses(10)
        .map((validatorAddress) => {
          const rewards = queries.cosmos.queryRewards
            .getQueryBech32Address(account.bech32Address)
            .getStakableRewardOf(validatorAddress);
          validatorRewars.push({ validatorAddress, rewards });
        });

      if (queryReward) {
        tracking(`${chainStore.current.chainName} Compound`);
        await account.cosmos.sendWithdrawAndDelegationRewardMsgs(
          queryReward.getDescendingPendingRewardValidatorAddresses(10),
          validatorRewars,
          "",
          {},
          {},
          {
            onBroadcasted: (txHash) => {},
          },
          queryReward.stakableReward.currency.coinMinimalDenom
        );
      } else {
        showToast({
          message: "There is no reward!",
          type: "danger",
        });
      }
    } catch (e) {
      console.error({ errorClaim: e });
      if (!e?.message?.startsWith("Transaction Rejected")) {
        showToast({
          message:
            e?.message ?? "Something went wrong! Please try again later.",
          type: "danger",
        });
        return;
      }
    }
  };

  const _onPressClaim = async (queryReward, chainId) => {
    try {
      const account = accountStore.getAccount(chainId);
      tracking(`${chainStore.current.chainName} Claim`);
      await account.cosmos.sendWithdrawDelegationRewardMsgs(
        queryReward.getDescendingPendingRewardValidatorAddresses(10),
        "",
        {},
        {},
        {
          onBroadcasted: (txHash) => {},
        },
        queryReward.stakableReward.currency.coinMinimalDenom
      );
    } catch (e) {
      console.error({ errorClaim: e });
      if (!e?.message?.startsWith("Transaction Rejected")) {
        showToast({
          message:
            e?.message ?? "Something went wrong! Please try again later.",
          type: "danger",
        });
        return;
      }
    }
  };

  useEffect(() => {
    if (viewTokens.length > 0) {
      let tmpRewards = 0;
      viewTokens.map((token) => {
        tmpRewards += Number(token.price.toDec().toString());
      });
      setTotalStakingReward(tmpRewards.toFixed(4));
    }
  }, [viewTokens]);

  const renderToken = useCallback((token) => {
    if (!token) return;

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
                  token?.chainInfo?.stakeCurrency?.coinImageUrl ||
                  unknownToken.coinImageUrl,
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
              +{token.price ? token.price?.toString() : "$0"}
            </Text>
            <Text style={[styles["amount"]]}>
              {token.token.toDec().gt(new Dec(0.001))
                ? token.token
                    .shrink(true)
                    .maxDecimals(6)
                    .trim(true)
                    .upperCase(true)
                    .toString()
                : `< 0.001 ${token.token.toCoin().denom.toUpperCase()}`}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => {
              _onPressClaim(token.queryRewards, token.chainInfo.chainId);
            }}
          >
            <Text style={styles.outlineButton}>Claim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              _onPressCompound(token.queryRewards, token.chainInfo.chainId);
            }}
          >
            <Text style={styles.outlineButton}>Compound</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, []);

  return (
    <OWBox
      style={{
        marginHorizontal: 16,
        width: metrics.screenWidth - 32,
        marginTop: 8,
        backgroundColor: colors["neutral-surface-card"],
        padding: spacing["16"],
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
              <View style={{ flexDirection: "row" }}>
                <View style={styles["claim-title"]}>
                  <OWIcon
                    name={"trending-outline"}
                    size={14}
                    color={colors["neutral-text-title"]}
                  />
                </View>
                <Text size={16} style={[{ ...styles["text-earn"] }]}>
                  +
                  {totalStakingReward
                    ? `${fiatCurrency.symbol}` + totalStakingReward
                    : `${fiatCurrency.symbol}0`}
                </Text>
              </View>
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
                onPress={() => {
                  claimAll();
                }}
                loading={account.isSendingMsg === "withdrawRewards"}
              />
            </View>
            <View>
              {viewTokens.map((token) => {
                return renderToken(token);
              })}
            </View>
          </View>
        </View>
      </View>
    </OWBox>
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
