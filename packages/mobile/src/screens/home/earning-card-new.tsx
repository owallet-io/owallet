import { Dec } from "@owallet/unit";
import { StackActions, useNavigation } from "@react-navigation/native";
import { SCREENS } from "@src/common/constants";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import {
  handleSaveHistory,
  HISTORY_STATUS,
  showToast,
} from "@src/utils/helper";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { OWBox } from "../../components/card";
import { useSmartNavigation } from "../../navigation.provider";
import { useStore } from "../../stores";
import { metrics } from "../../themes";

export const EarningCardNew: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({}) => {
  const smartNavigation = useSmartNavigation();
  const { chainStore, accountStore, queriesStore, priceStore, analyticsStore } =
    useStore();
  const navigation = useNavigation();

  const { colors } = useTheme();
  const chainId = chainStore.current.chainId;
  const styles = styling(colors);
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );

  const stakingReward = queryReward.stakableReward;
  const totalStakingReward = priceStore.calculatePrice(stakingReward);

  const _onPressClaim = async () => {
    try {
      await account.cosmos.sendWithdrawDelegationRewardMsgs(
        queryReward.getDescendingPendingRewardValidatorAddresses(8),
        "",
        {},
        {},
        {
          onBroadcasted: (txHash) => {
            analyticsStore.logEvent("Claim reward tx broadcasted", {
              chainId: chainId,
              chainName: chainStore.current.chainName,
            });
            smartNavigation.pushSmart("TxPendingResult", {
              txHash: Buffer.from(txHash).toString("hex"),
            });
            const historyInfos = {
              fromAddress: account.bech32Address,
              toAddress: account.bech32Address,
              hash: Buffer.from(txHash).toString("hex"),
              memo: "",
              fromAmount: totalStakingReward,
              toAmount: totalStakingReward,
              value: totalStakingReward,
              fee: "0",
              type: HISTORY_STATUS.CLAIM,
              fromToken: {
                asset: stakingReward.toCoin().denom.toUpperCase(),
                chainId: chainStore.current.chainId,
              },
              toToken: {
                asset: stakingReward.toCoin().denom.toUpperCase(),
                chainId: chainStore.current.chainId,
              },
              status: "SUCCESS",
            };

            handleSaveHistory(account.bech32Address, historyInfos);
          },
        },
        stakingReward.currency.coinMinimalDenom
      );
    } catch (e) {
      console.error({ errorClaim: e });
      showToast({
        message: e?.message ?? "Something went wrong! Please try again later.",
        type: "danger",
      });
    }
  };
  return (
    <OWBox
      style={{
        marginHorizontal: 16,
        width: metrics.screenWidth - 32,
        marginTop: 2,
      }}
    >
      <View>
        <View style={styles.cardBody}>
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(
                StackActions.replace("MainTab", { screen: SCREENS.TABS.Invest })
              );
            }}
          >
            <View style={{ flexDirection: "row", paddingBottom: 6 }}>
              <View style={styles["claim-title"]}>
                <OWIcon
                  name={"trending-outline"}
                  size={14}
                  color={colors["neutral-text-title"]}
                />
              </View>
              <Text style={[{ ...styles["text-earn"] }]}>
                Claimable rewards
              </Text>
            </View>

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
                : stakingReward.shrink(true).maxDecimals(6).toString()}
            </Text>
            <Text style={[styles["amount"]]}>
              {stakingReward.toDec().gt(new Dec(0.001))
                ? stakingReward
                    .shrink(true)
                    .maxDecimals(6)
                    .trim(true)
                    .upperCase(true)
                    .toString()
                : `< 0.001 ${stakingReward.toCoin().denom.toUpperCase()}`}
            </Text>
          </TouchableOpacity>
          <OWButton
            style={styles["btn-claim"]}
            textStyle={{
              fontSize: 14,
              fontWeight: "600",
              color: colors["neutral-text-action-on-dark-bg"],
            }}
            label="Claim All"
            onPress={_onPressClaim}
            loading={account.isSendingMsg === "withdrawRewards"}
            disabled={
              !account.isReadyToSendMsgs ||
              stakingReward.toDec().equals(new Dec(0)) ||
              queryReward.pendingRewardValidatorAddresses.length === 0
            }
          />
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
      borderWidth: 0.5,
      marginTop: 16,
      borderRadius: 999,
      width: metrics.screenWidth / 4.5,
      height: 32,
      position: "absolute",
      right: 0,
      bottom: 10,
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
  });
