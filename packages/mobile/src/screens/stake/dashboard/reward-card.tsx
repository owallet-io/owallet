import { Dec } from "@owallet/unit";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { OWButton } from "../../../components/button";
import { OWBox } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation.provider";
import { useStore } from "../../../stores";
import { spacing, typography } from "../../../themes";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { showToast } from "@src/utils/helper";
export const MyRewardCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const chainId = chainStore.current.chainId;
  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );

  const pendingStakableReward =
    queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    ).stakableReward;
  const stakingReward = queryReward.stakableReward;
  const apy = queries.cosmos.queryInflation.inflation;

  const smartNavigation = useSmartNavigation();

  const isDisable =
    !account.isReadyToSendMsgs ||
    pendingStakableReward.toDec().equals(new Dec(0)) ||
    queryReward.pendingRewardValidatorAddresses.length === 0;
  const decimalChain = chainStore?.current?.stakeCurrency?.coinDecimals;
  return (
    <OWBox
      style={{
        padding: 0,
        margin: 0,
      }}
    >
      <View>
        <Text
          style={{
            ...styles.textInfo,
            fontWeight: "700",
            color: colors["sub-primary-text"],
          }}
        >
          My Pending Rewards
          <Text
            style={{
              ...typography["h7"],
              color: colors["primary-surface-default"],
            }}
          >
            {`(${apy.maxDecimals(2).trim(true).toString()}% per year)`}
          </Text>
        </Text>

        <View>
          <Text
            style={{
              ...styles.textInfo,
              marginTop: spacing["4"],
              fontWeight: "400",
              fontSize: 20,
              color: colors["sub-primary-text"],
            }}
          >
            {pendingStakableReward.toDec().gt(new Dec(0.001))
              ? pendingStakableReward
                  .shrink(true)
                  .maxDecimals(6)
                  .trim(true)
                  .upperCase(true)
                  .toString()
              : `< 0.001 ${pendingStakableReward.toCoin().denom.toUpperCase()}`}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: spacing["8"],
            }}
          >
            <OWButton
              label="Claim"
              size="small"
              disabled={isDisable}
              colorLoading={colors["primary-surface-default"]}
              loading={account.isSendingMsg === "withdrawRewards"}
              onPress={async () => {
                try {
                  await account.cosmos.sendWithdrawDelegationRewardMsgs(
                    queryReward.getDescendingPendingRewardValidatorAddresses(8),
                    "",
                    {},
                    {},
                    {
                      onFulfill: (tx) => {
                        console.log(
                          tx,
                          "TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!"
                        );
                      },
                      onBroadcasted: (txHash) => {
                        analyticsStore.logEvent("Claim reward tx broadcasted", {
                          chainId: chainStore.current.chainId,
                          chainName: chainStore.current.chainName,
                        });
                        smartNavigation.pushSmart("TxPendingResult", {
                          txHash: Buffer.from(txHash).toString("hex"),
                        });
                      },
                    },
                    stakingReward.currency.coinMinimalDenom
                  );
                } catch (e) {
                  console.log({ errorClaim: e });

                  // if (e?.message === 'Request rejected') {
                  //   return;
                  // }
                  // if (e?.message.includes('Cannot read properties of undefined')) {
                  //   return;
                  // }
                  showToast({
                    message:
                      e?.message ??
                      "Something went wrong! Please try again later.",
                    type: "danger",
                  });

                  return;
                }
              }}
              type="secondary"
              icon={
                <OWIcon
                  name="rewards"
                  size={20}
                  color={
                    isDisable
                      ? colors["white"]
                      : colors["primary-surface-default"]
                  }
                />
              }
              fullWidth={false}
              style={{
                width: 100,
                borderWidth: isDisable ? 0 : 0.5,
              }}
            />
          </View>
        </View>
      </View>
    </OWBox>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    textInfo: {
      ...typography.h6,
      color: colors["text-black-medium"],
    },
    containerBtn: {
      borderWidth: 0,
      backgroundColor: colors["transparent"],
      paddingLeft: 0,
      marginLeft: 0,
      marginTop: 0,
      paddingTop: 0,
    },
    btn: {
      flexDirection: "row",
      paddingHorizontal: 0,
      justifyContent: "flex-start",
      paddingVertical: 0,
    },
  });
