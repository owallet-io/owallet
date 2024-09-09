import React, { FunctionComponent } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@src/components/text";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { registerModal } from "@src/modals/base";
import { useTheme } from "@src/themes/theme-provider";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { showToast } from "@src/utils/helper";
import { useStore } from "@src/stores";
import { tracking } from "@src/utils/tracking";

const MoreModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(({ close }) => {
  const { colors } = useTheme();
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const chainId = chainStore.current.chainId;

  const _onPressCompound = async () => {
    const queries = queriesStore.get(chainId);
    const account = accountStore.getAccount(chainId);
    const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    );
    const stakingReward = queryReward.stakableReward;

    try {
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
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("Compound reward tx broadcasted", {
                chainId: chainId,
                chainName: chainStore.current.chainName,
              });
            },
          },
          stakingReward.currency.coinMinimalDenom
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

  return (
    <View style={{ padding: 24 }}>
      <TouchableOpacity
        onPress={() => {
          _onPressCompound();
          setTimeout(() => {
            close();
          }, 1000);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 44,
            backgroundColor: colors["primary-surface-default"],
            marginRight: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <OWIcon
            name={"trending-outline"}
            size={20}
            color={colors["neutral-text-action-on-dark-bg"]}
          />
        </View>
        <View>
          <Text size={16} weight="600">
            Compound All Staking
          </Text>
          <Text size={13} color={colors["neutral-text-body3"]}>
            Claims and reinvests your rewards
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          close();
          navigate(SCREENS.STACK.Others, {
            screen: SCREENS.BuyFiat,
          });
          return;
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 24,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 44,
            backgroundColor: colors["neutral-surface-action"],
            marginRight: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <OWIcon
            name={"tdesigncreditcard"}
            size={20}
            color={colors["neutral-text-action-on-light-bg"]}
          />
        </View>
        <View>
          <Text size={16} weight="600">
            Buy
          </Text>
          <Text size={13} color={colors["neutral-text-body3"]}>
            Exchange cash for crypto
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

export default MoreModal;
