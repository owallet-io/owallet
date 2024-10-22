import { CoinPretty, Dec, Int } from "@owallet/unit";
import { SCREENS } from "@src/common/constants";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { goBack, navigate } from "@src/router/root";
import { useTheme } from "@src/themes/theme-provider";
import { convertArrToObject, showToast } from "@src/utils/helper";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { OWBox } from "../../../components/card";
import { useStore } from "../../../stores";
import { metrics, spacing } from "../../../themes";
import { tracking } from "@src/utils/tracking";
import { DenomDydx, removeDataInParentheses } from "@owallet/common";
import { ChainInfo } from "@owallet/types";
import { QueryError } from "@owallet/stores";
import { useRoute } from "@react-navigation/native";
import { useIntl } from "react-intl";
const defaultGasPerDelegation = 140000;
export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

export const EarningCardNew = observer(({}) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    // analyticsStore,
    appInitStore,
  } = useStore();
  // if (
  //   (chainStore.current.networkType !== "cosmos" &&
  //     !appInitStore.getInitApp.isAllNetworks) ||
  //   appInitStore.getInitApp.isAllNetworks
  // )
  //   return;

  const { colors } = useTheme();
  const route = useRoute();
  const initialChainId = route.params["chainId"];
  const chainId = initialChainId || chainStore.current.chainId;
  useEffect(() => {
    if (!initialChainId) goBack();
  }, [initialChainId]);
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

  const isDydx = chainId?.includes("dydx-mainnet");
  const intl = useIntl();
  const _onPressCompound = async () => {
    try {
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
  const _onPressClaim = async () => {
    try {
      const validatorAddresses =
        queryRewards.getDescendingPendingRewardValidatorAddresses(8);

      if (validatorAddresses.length === 0) {
        return;
      }

      const tx =
        account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);
      let gas = new Int(validatorAddresses.length * defaultGasPerDelegation);
      try {
        // setIsSimulating(true);

        const simulated = await tx.simulate();
        console.log(simulated, "simulated");
        // Gas adjustment is 1.5
        // Since there is currently no convenient way to adjust the gas adjustment on the UI,
        // Use high gas adjustment to prevent failure.
        gas = new Dec(simulated.gasUsed * 1.5).truncate();
      } catch (e) {
        console.log(e, "err high gas");
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
            const validatorObject = convertArrToObject(validatorAddresses);
            // tracking(`Claim ${rewards?.currency.coinDenom}`);
            navigate(SCREENS.TxPendingResult, {
              chainId: initialChainId,
              txHash: Buffer.from(txHash).toString("hex"),
              data: {
                ...validatorObject,
                type: "claim",
                // amount: rewards,
                // currency: rewards?.currency,
              },
            });
          },
          onFulfill: (tx: any) => {
            if (tx.code != null && tx.code !== 0) {
              console.log(tx.log ?? tx.raw_log);

              return;
            }
          },
        }
      );
    } catch (e) {
      console.error({ errorClaim: e });
      if (!e?.message?.includes("rejected")) {
        showToast({
          message:
            e?.message ?? "Something went wrong! Please try again later.",
          type: "danger",
        });
        return;
      }
    }
  };

  // const _onPressClaim = async () => {
  //   try {
  //     tracking(`${chainStore.current.chainName} Claim`);
  //     await account.cosmos.sendWithdrawDelegationRewardMsgs(
  //       queryRewards.getDescendingPendingRewardValidatorAddresses(10),
  //       "",
  //       {},
  //       {},
  //       {
  //         onBroadcasted: (txHash) => {
  //           // analyticsStore.logEvent("Claim reward tx broadcasted", {
  //           //   chainId: chainId,
  //           //   chainName: chainStore.current.chainName,
  //           // });
  //
  //           const validatorObject = convertArrToObject(
  //             queryRewards.pendingRewardValidatorAddresses
  //           );
  //           navigate(SCREENS.TxPendingResult, {
  //             txHash: Buffer.from(txHash).toString("hex"),
  //             title: "Withdraw rewards",
  //             data: {
  //               ...validatorObject,
  //               amount: stakingRewards?.toCoin(),
  //               currency: chainStore.current.stakeCurrency,
  //               type: "claim",
  //             },
  //           });
  //         },
  //       },
  //       stakingRewards.currency.coinMinimalDenom
  //     );
  //   } catch (e) {
  //     console.error({ errorClaim: e });
  //     if (!e?.message?.startsWith("Transaction Rejected")) {
  //       showToast({
  //         message:
  //           e?.message ?? "Something went wrong! Please try again later.",
  //         type: "danger",
  //       });
  //       return;
  //     }
  //   }
  // };
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
              loading={account.isSendingMsg === "withdrawRewardsAndDelegation"}
              disabled={
                account.isSendingMsg === "withdrawRewardsAndDelegation" ||
                isDisableCompund
              }
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
                  color: colors["neutral-icon-on-light"],
                }}
                iconRight={
                  <OWIcon
                    color={colors["neutral-icon-on-light"]}
                    name={"tdesigngift"}
                    size={20}
                  />
                }
                type="link"
                style={styles.getStarted}
                label={"Claim all"}
                fullWidth={false}
                disabled={
                  account.isSendingMsg === "withdrawRewards" || isDisableClaim
                }
                onPress={_onPressClaim}
                loading={account.isSendingMsg === "withdrawRewards"}
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
