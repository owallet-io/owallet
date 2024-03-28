import React, { FunctionComponent, useEffect, useState } from "react";
import { registerModal } from "../base";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "@src/components/text";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
} from "@owallet/hooks";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { FeeInSign } from "./fee";
import { renderAminoMessage } from "./amino";
import { renderDirectMessage } from "./direct";
import crashlytics from "@react-native-firebase/crashlytics";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import OWText from "@src/components/text/ow-text";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { useTheme } from "@src/themes/theme-provider";
import OWButtonGroup from "@src/components/button/OWButtonGroup";
import { metrics } from "@src/themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(
  observer(({}) => {
    const { chainStore, accountStore, queriesStore, signInteractionStore } =
      useStore();
    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    const style = useStyle();

    const [signer, setSigner] = useState("");

    const [chainId, setChainId] = useState(chainStore.current.chainId);

    // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
    const gasConfig = useGasConfig(chainStore, chainId, 1);
    const amountConfig = useSignDocAmountConfig(
      chainStore,
      chainId,
      accountStore.getAccount(chainId).msgOpts,
      signer
    );
    const feeConfig = useFeeConfig(
      chainStore,
      chainId,
      signer,
      queriesStore.get(chainId).queryBalances,
      amountConfig,
      gasConfig
    );

    const memoConfig = useMemoConfig(chainStore, chainId);

    const signDocWapper = signInteractionStore.waitingData?.data.signDocWrapper;

    const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
    amountConfig.setSignDocHelper(signDocHelper);

    const [isInternal, setIsInternal] = useState(false);

    useEffect(() => {
      if (signInteractionStore.waitingData) {
        const data = signInteractionStore.waitingData;
        setIsInternal(data.isInternal);
        signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
        setChainId(data.data.signDocWrapper.chainId);
        gasConfig.setGas(data.data.signDocWrapper.gas);
        memoConfig.setMemo(data.data.signDocWrapper.memo);
        if (
          data.data.signOptions.preferNoSetFee &&
          data.data.signDocWrapper.fees[0]
        ) {
          feeConfig.setManualFee(data.data.signDocWrapper.fees[0]);
        } else {
          feeConfig.setFeeType("average");
        }
        setSigner(data.data.signer);
      }

      if (signInteractionStore.waitingEthereumData) {
        const data = signInteractionStore.waitingEthereumData;
      }
    }, [
      feeConfig,
      gasConfig,
      memoConfig,
      signDocHelper,
      signInteractionStore.waitingData,
    ]);

    const mode = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode
      : "none";
    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === "amino"
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];
    const isDisable =
      signDocWapper == null ||
      signDocHelper.signDocWrapper == null ||
      memoConfig.getError() != null ||
      feeConfig.getError() != null;

    const _onPressApprove = async () => {
      crashlytics().log("sign - index - _onPressApprove");
      try {
        if (signDocHelper.signDocWrapper) {
          //
          await signInteractionStore.approveAndWaitEnd(
            signDocHelper.signDocWrapper
          );
        }
      } catch (error) {
        crashlytics().recordError(error);
        console.log(error);
      }
    };

    const _onPressReject = () => {
      try {
        if (signDocHelper.signDocWrapper) {
          //
          signInteractionStore.rejectAll();
        }
      } catch (error) {
        crashlytics().recordError(error);
        console.error(error);
      }
    };

    const renderedMsgs = (() => {
      const account = accountStore.getAccount(chainId);
      const chainInfo = chainStore.getChain(chainId);
      if (mode === "amino") {
        return (msgs as readonly AminoMsg[]).map((msg, i) => {
          const { content, scrollViewHorizontal, title } = renderAminoMessage(
            account.msgOpts,
            msg,
            chainInfo.currencies
          );

          return (
            <View key={i.toString()}>
              {msg.type !== account.msgOpts.withdrawRewards.type && (
                <OWText
                  size={16}
                  weight={"700"}
                  style={{
                    textAlign: "center",
                    paddingVertical: 20,
                  }}
                >
                  {`${title} confirmation`.toUpperCase()}
                </OWText>
              )}
              <View>{content}</View>
            </View>
          );
        });
      } else if (mode === "direct") {
        return (msgs as any[]).map((msg, i) => {
          const { title, content } = renderDirectMessage(
            msg,
            chainInfo.currencies
          );

          return (
            <View key={i.toString()}>
              {msg.type !== account.msgOpts.withdrawRewards.type && (
                <OWText
                  size={16}
                  weight={"700"}
                  style={{
                    textAlign: "center",
                    paddingVertical: 20,
                  }}
                >
                  {`${title} confirmation`.toUpperCase()}
                </OWText>
              )}
              <View>{content}</View>
            </View>
          );
        });
      } else {
        return null;
      }
    })();
    const { colors } = useTheme();
    const { bottom } = useSafeAreaInsets();
    return (
      <WrapViewModal
        disabledScrollView={false}
        buttonBottom={
          <View
            style={{
              paddingBottom: 5 + (bottom || 0),
            }}
          >
            <View
              style={{
                backgroundColor: colors["neutral-surface-card"],
                paddingHorizontal: 16,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                marginBottom: 24,
              }}
            >
              <FeeInSign
                feeConfig={feeConfig}
                gasConfig={gasConfig}
                signOptions={signInteractionStore.waitingData?.data.signOptions}
                isInternal={isInternal}
              />
              {/*<MemoInput label="Memo" memoConfig={memoConfig} />*/}
              {memoConfig.memo && (
                <ItemReceivedToken
                  label={"Memo"}
                  valueDisplay={memoConfig.memo}
                  value={memoConfig.memo}
                  btnCopy={false}
                />
              )}
            </View>
            <OWButtonGroup
              labelApprove={"Confirm"}
              labelClose={"Cancel"}
              disabledApprove={isDisable}
              disabledClose={signInteractionStore.isLoading}
              loadingApprove={signInteractionStore.isLoading}
              styleApprove={{
                borderRadius: 99,
                backgroundColor: colors["primary-surface-default"],
              }}
              onPressClose={_onPressReject}
              onPressApprove={_onPressApprove}
              styleClose={{
                borderRadius: 99,
                backgroundColor: colors["neutral-surface-bg"],
              }}
            />
          </View>
        }
        style={{
          backgroundColor: colors["neutral-surface-card"],
          maxHeight: metrics.screenHeight - 250,
        }}
        containerStyle={{
          paddingBottom: 16,
        }}
      >
        <View
        // style={{
        //   paddingBottom: 20
        // }}
        >
          <View>{renderedMsgs}</View>
        </View>
      </WrapViewModal>
    );
  }),
  {
    disableSafeArea: false,
  }
);
