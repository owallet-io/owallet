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
import { Dec, Int } from "@owallet/unit";
import { useIntl } from "react-intl";
const defaultGasPerDelegation = 140000;
const MoreModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(({ close }) => {
  const { colors } = useTheme();
  const { chainStore, accountStore, queriesStore } = useStore();

  const chainId = chainStore.current.chainId;
  const isDydx = chainId?.includes("dydx-mainnet");
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const intl = useIntl();
  const stakingReward = queryReward.stakableReward;
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
  const isDisableCompund =
    isDydx ||
    !account.isReadyToSendMsgs ||
    stakingReward?.toDec().equals(new Dec(0)) ||
    queryReward?.pendingRewardValidatorAddresses.length === 0;
  return (
    <View style={{ padding: 24 }}>
      <TouchableOpacity
        disabled={isDisableCompund}
        onPress={() => {
          _onPressCompound();
          setTimeout(() => {
            close();
          }, 1000);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          opacity: isDisableCompund ? 0.5 : 1,
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
          navigate(SCREENS.BuyFiat);
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
