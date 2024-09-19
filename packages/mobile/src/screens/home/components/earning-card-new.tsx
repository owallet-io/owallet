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
import { checkRouter, navigate } from "@src/router/root";
import { useTheme } from "@src/themes/theme-provider";
import { convertArrToObject, showToast } from "@src/utils/helper";
import { observer } from "mobx-react-lite";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { OWBox } from "../../../components/card";

import { useStore } from "../../../stores";
import { metrics, spacing } from "../../../themes";
import { tracking } from "@src/utils/tracking";
import { DenomDydx, removeDataInParentheses } from "@owallet/common";

export const EarningCardNew = observer(({}) => {
  const route = useRoute<RouteProp<Record<string, {}>, string>>();

  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    analyticsStore,
    appInitStore,
  } = useStore();
  if (
    (chainStore.current.networkType !== "cosmos" &&
      !appInitStore.getInitApp.isAllNetworks) ||
    appInitStore.getInitApp.isAllNetworks
  )
    return;
  const navigation = useNavigation();

  const { colors } = useTheme();
  const chainId = chainStore.current.chainId;
  const styles = styling(colors);
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakingRewards = (() => {
    const isDydx = chainId?.includes("dydx");
    const targetDenom = (() => {
      if (isDydx) {
        return DenomDydx;
      }

      return chainStore.current.stakeCurrency?.coinMinimalDenom;
    })();
    if (targetDenom) {
      const currency = chainStore.current.findCurrency(targetDenom);
      if (currency) {
        const reward = queryRewards.rewards.find(
          (r) => r.currency.coinMinimalDenom === targetDenom
        );
        if (!reward) {
          if (isDydx) return new CoinPretty(currency, 0);
          return queryRewards.stakableReward;
        }
        return reward;
      }
    }
  })();

  const totalStakingReward = priceStore.calculatePrice(stakingRewards);
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;
  const totalPrice = priceStore.calculatePrice(delegated);

  const _onPressStake = () => {
    if (checkRouter(route?.name, SCREENS.Invest)) {
      return;
    }
    navigate(SCREENS.TABS.Invest);
  };
  const isDydx = chainId?.includes("dydx-mainnet");
  const _onPressCompound = async () => {
    try {
      const validatorRewars = [];

      const denom = DenomDydx;
      queryRewards
        .getDescendingPendingRewardValidatorAddresses(10)
        .map((validatorAddress) => {
          let rewards: CoinPretty | undefined;
          if (isDydx) {
            rewards = queryRewards
              .getRewardsOf(validatorAddress)
              .find((r) => r.currency.coinMinimalDenom === denom);
          } else {
            rewards = queryRewards.getStakableRewardOf(validatorAddress);
          }
          validatorRewars.push({ validatorAddress, rewards });
        });

      if (queryRewards) {
        tracking(`${chainStore.current.chainName} Compound`);
        await account.cosmos.sendWithdrawAndDelegationRewardMsgs(
          queryRewards.getDescendingPendingRewardValidatorAddresses(10),
          validatorRewars,
          "",
          {},
          {},
          {
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("Compound reward tx broadcasted", {
                chainId: chainId,
                chainName: chainStore.current.chainName,
              });

              const validatorObject = convertArrToObject(
                queryRewards.pendingRewardValidatorAddresses
              );
              navigate(SCREENS.TxPendingResult, {
                txHash: Buffer.from(txHash).toString("hex"),
                title: "Compound",
                data: {
                  ...validatorObject,
                  amount: stakingRewards?.toCoin(),
                  currency: chainStore.current.stakeCurrency,
                  type: "claim",
                },
              });
            },
          },
          isDydx ? denom : queryRewards.stakableReward.currency.coinMinimalDenom
        );
      } else {
        showToast({
          message: "There is no reward!",
          type: "danger",
        });
      }
    } catch (e) {
      console.error({ errorClaim: e });
      if (chainId?.includes("dydx-mainnet")) {
        showToast({
          message: `Compound not supported for DYDX network`,
          type: "danger",
        });
        return;
      }
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

  const _onPressClaim = async () => {
    try {
      tracking(`${chainStore.current.chainName} Claim`);
      await account.cosmos.sendWithdrawDelegationRewardMsgs(
        queryRewards.getDescendingPendingRewardValidatorAddresses(10),
        "",
        {},
        {},
        {
          onBroadcasted: (txHash) => {
            analyticsStore.logEvent("Claim reward tx broadcasted", {
              chainId: chainId,
              chainName: chainStore.current.chainName,
            });

            const validatorObject = convertArrToObject(
              queryRewards.pendingRewardValidatorAddresses
            );
            navigate(SCREENS.TxPendingResult, {
              txHash: Buffer.from(txHash).toString("hex"),
              title: "Withdraw rewards",
              data: {
                ...validatorObject,
                amount: stakingRewards?.toCoin(),
                currency: chainStore.current.stakeCurrency,
                type: "claim",
              },
            });
          },
        },
        stakingRewards.currency.coinMinimalDenom
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
  const isDisableClaim =
    !account.isReadyToSendMsgs ||
    stakingRewards?.toDec().equals(new Dec(0)) ||
    queryRewards.pendingRewardValidatorAddresses.length === 0;
  const isDisableCompund =
    isDydx ||
    !account.isReadyToSendMsgs ||
    stakingRewards?.toDec().equals(new Dec(0)) ||
    queryRewards.pendingRewardValidatorAddresses.length === 0;
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
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
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
              <Text style={[{ ...styles["text-earn"] }]}>Rewards</Text>
            </View>
            <OWButton
              style={[
                styles["btn-claim"],
                {
                  backgroundColor: isDisableCompund
                    ? colors["neutral-surface-disable"]
                    : colors["primary-surface-default"],
                },
              ]}
              fullWidth={false}
              textStyle={{
                fontSize: 15,
                fontWeight: "600",
                color: isDisableCompund
                  ? colors["neutral-text-disable"]
                  : colors["neutral-text-action-on-dark-bg"],
              }}
              icon={
                <OWIcon
                  name={"trending-outline"}
                  size={14}
                  color={
                    isDisableCompund
                      ? colors["neutral-text-disable"]
                      : colors["neutral-text-action-on-dark-bg"]
                  }
                />
              }
              label="Compound"
              onPress={_onPressCompound}
              loading={account.isSendingMsg === "withdrawRewards"}
              disabled={isDisableCompund}
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
              {totalStakingReward
                ? totalStakingReward.toString()
                : stakingRewards.shrink(true).maxDecimals(6).toString()}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles["amount"]]}>
                {stakingRewards
                  ? removeDataInParentheses(
                      stakingRewards
                        .shrink(true)
                        .maxDecimals(6)
                        .trim(true)
                        .upperCase(true)
                        .toString()
                    )
                  : ""}
              </Text>

              <OWButton
                textStyle={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors["neutral-text-action-on-light-bg"],
                }}
                iconRight={
                  <OWIcon
                    color={colors["neutral-text-action-on-light-bg"]}
                    name={"tdesigngift"}
                    size={20}
                  />
                }
                type="link"
                style={styles.getStarted}
                label={"Claim all"}
                fullWidth={false}
                disabled={isDisableClaim}
                onPress={_onPressClaim}
              />
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
      fontSize: 16,
      lineHeight: 24,
      color: colors["neutral-text-title"],
    },
    "text-amount": {
      fontWeight: "500",
      fontSize: 28,
      lineHeight: 34,
      color: colors["success-text-body"],
    },

    amount: {
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      color: colors["neutral-text-title"],
    },
    "btn-claim": {
      backgroundColor: colors["primary-surface-default"],
      borderRadius: 999,
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
      // width: metrics.screenWidth / 2.45,
      // height: 32,
    },

    btnGroup: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      borderTopColor: colors["neutral-border-default"],
      borderTopWidth: 1,
      paddingTop: 8,
    },
  });
