import React, { FunctionComponent, useEffect, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
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
import { Button } from "../../components/button";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { FeeInSign } from "./fee";
import { renderAminoMessage } from "./amino";
import { renderDirectMessage } from "./direct";
import crashlytics from "@react-native-firebase/crashlytics";
import { colors } from "../../themes";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import OWText from "@src/components/text/ow-text";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import { MemoInput } from "@src/components/input";
import { Bech32Address } from "@owallet/cosmos";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { useTheme } from "@src/themes/theme-provider";
import { OWButton } from "@src/components/button";
import OWButtonGroup from "@src/components/button/OWButtonGroup";

export const SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(
  observer(({}) => {
    const {
      chainStore,
      accountStore,
      queriesStore,
      signInteractionStore,
      priceStore,
      appInitStore,
    } = useStore();
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
      if (mode === "amino") {
        return (msgs as readonly AminoMsg[]).map((msg, i) => {
          const account = accountStore.getAccount(chainId);
          const walletAddress = account.bech32Address;
          const chainInfo = chainStore.getChain(chainId);
          const { content, scrollViewHorizontal, title } = renderAminoMessage(
            account.msgOpts,
            msg,
            chainInfo.currencies,
            priceStore,
            walletAddress
          );

          return (
            <View key={i.toString()}>
              <OWText
                size={16}
                weight={"700"}
                style={{
                  textAlign: "center",
                  paddingBottom: 20,
                }}
              >
                {`${title} confirmation`.toUpperCase()}
              </OWText>
              {scrollViewHorizontal ? (
                <ScrollView horizontal={true}>
                  <Text style={style.flatten(["body3"])}>{content}</Text>
                </ScrollView>
              ) : (
                <View>{content}</View>
              )}
            </View>
          );
        });
      } else if (mode === "direct") {
        return (msgs as any[]).map((msg, i) => {
          const chainInfo = chainStore.getChain(chainId);
          const { title, content } = renderDirectMessage(
            msg,
            chainInfo.currencies
          );

          return <View key={i.toString()}>{content}</View>;
        });
      } else {
        return null;
      }
    })();
    const { colors } = useTheme();
    return (
      <WrapViewModal
        style={{
          backgroundColor: colors["neutral-surface-bg"],
        }}
      >
        <View>
          <View>{renderedMsgs}</View>

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
            backgroundColor: colors["neutral-surface-action2"],
          }}
        />
      </WrapViewModal>
    );
  }),
  {
    disableSafeArea: false,
  }
);
