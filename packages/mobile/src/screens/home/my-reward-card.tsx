import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../styles";
import { Card, CardHeaderWithButton } from "../../components/card";
import { Dec } from "@owallet/unit";
import { View, ViewStyle } from "react-native";
import { useStore } from "../../stores";
import { useSmartNavigation } from "../../navigation.provider";
import { MoneybagIcon } from "../../components/icon/money-bag";
import { showToast } from "@src/utils/helper";

export const MyRewardCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakingReward = queryReward.stakableReward;

  return (
    <Card style={containerStyle}>
      <CardHeaderWithButton
        title="My rewards"
        paragraph={stakingReward
          .shrink(true)
          .maxDecimals(6)
          .trim(true)
          .upperCase(true)
          .toString()}
        onPress={async () => {
          try {
            await account.cosmos.sendWithdrawDelegationRewardMsgs(
              queryReward.getDescendingPendingRewardValidatorAddresses(8),
              "",
              {},
              {},
              {
                onFulfill: (tx) => {
                  console.log(tx, "TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!");
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
            // if (e?.message === 'Request rejected') {
            //   return;
            // }
            // if (e?.message.includes('Cannot read properties of undefined')) {
            //   return;
            // }
            showToast({
              message:
                e?.message ?? "Something went wrong! Please try again later.",
              type: "danger",
            });

            if (smartNavigation.canGoBack) {
              smartNavigation.goBack();
            } else {
              smartNavigation.navigateSmart("Home", {});
            }
          }
        }}
        icon={
          <View
            style={style.flatten([
              "width-44",
              "height-44",
              "border-radius-64",
              "items-center",
              "justify-center",
              "background-color-border-white",
            ])}
          >
            <MoneybagIcon />
          </View>
          // <RewardIcon size={44} color={style.get("color-secondary").color} />
        }
        buttonText="Claim"
        buttonMode="outline"
        buttonContainerStyle={style.flatten(["min-width-72"])}
        buttonDisabled={
          !account.isReadyToSendMsgs ||
          stakingReward.toDec().equals(new Dec(0)) ||
          queryReward.pendingRewardValidatorAddresses.length === 0
        }
        buttonLoading={account.isSendingMsg === "withdrawRewards"}
      />
    </Card>
  );
});
