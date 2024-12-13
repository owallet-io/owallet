// import React, { FunctionComponent, useEffect, useState } from "react";
// import { registerModal } from "../base";
// import { CardModal } from "../card";
// import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
// import { ScrollView } from "react-native-gesture-handler";
// import { useStyle } from "../../styles";
// import { useStore } from "../../stores";
// import { Button } from "../../components/button";
// import { colors } from "../../themes";
// import { observer } from "mobx-react-lite";
// import { useUnmount } from "../../hooks";
// import { BottomSheetProps } from "@gorhom/bottom-sheet";
// import { showToast } from "@src/utils/helper";
//
// const keyboardVerticalOffset = Platform.OS === "ios" ? 130 : 0;
//
// export const SignOasisModal: FunctionComponent<{
//   isOpen?: boolean;
//   close: () => void;
//   onSuccess: () => void;
//   bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
//   data: object;
// }> = registerModal(
//   observer(({ data, close, onSuccess }) => {
//     const { signInteractionStore } = useStore();
//
//     useUnmount(() => {
//       signInteractionStore.rejectAll();
//     });
//
//     const [dataSign, setDataSign] = useState(null);
//     const [loading, setLoading] = useState(false);
//
//     useEffect(() => {
//       if (data) {
//         setDataSign(data);
//       }
//     }, [data]);
//
//     const style = useStyle();
//
//     const _onPressReject = () => {
//       try {
//         signInteractionStore.rejectAll();
//         close();
//       } catch (error) {
//         console.error(error);
//       }
//     };
//
//     return (
//       <CardModal>
//         <KeyboardAvoidingView
//           behavior="position"
//           keyboardVerticalOffset={keyboardVerticalOffset}
//         >
//           <View style={style.flatten(["margin-bottom-16"])}>
//             <Text style={style.flatten(["margin-bottom-3"])}>
//               <Text
//                 style={style.flatten(["subtitle3", "color-primary"])}
//               >{`1 `}</Text>
//               <Text
//                 style={style.flatten(["subtitle3", "color-text-black-medium"])}
//               >
//                 Message:
//               </Text>
//             </Text>
//             <View
//               style={style.flatten([
//                 "border-radius-8",
//                 "border-width-1",
//                 "border-color-border-white",
//                 "overflow-hidden",
//               ])}
//             >
//               <ScrollView
//                 style={style.flatten(["max-height-214"])}
//                 persistentScrollbar={true}
//               >
//                 <Text
//                   style={{
//                     color: colors["sub-text"],
//                   }}
//                 >
//                   {JSON.stringify(dataSign, null, 2)}
//                 </Text>
//               </ScrollView>
//             </View>
//           </View>
//
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-evenly",
//             }}
//           >
//             <Button
//               text="Reject"
//               size="large"
//               containerStyle={{
//                 width: "40%",
//               }}
//               style={{
//                 backgroundColor: colors["red-500"],
//               }}
//               textStyle={{
//                 color: colors["white"],
//               }}
//               underlayColor={colors["danger-400"]}
//               loading={signInteractionStore.isLoading || loading}
//               disabled={signInteractionStore.isLoading || loading}
//               onPress={_onPressReject}
//             />
//             <Button
//               text="Approve"
//               size="large"
//               disabled={signInteractionStore.isLoading || loading}
//               containerStyle={{
//                 width: "40%",
//               }}
//               textStyle={{
//                 color: colors["white"],
//               }}
//               style={{
//                 backgroundColor: signInteractionStore.isLoading
//                   ? colors["primary-surface-disable"]
//                   : colors["primary-surface-default"],
//               }}
//               loading={signInteractionStore.isLoading || loading}
//               onPress={async () => {
//                 setLoading(true);
//                 try {
//                   if (dataSign.amount < 0.1) {
//                     showToast({
//                       message: "Minimum amount should be higher than 0.1!",
//                       type: "danger",
//                     });
//                     return;
//                   }
//                   if (
//                     dataSign.maxAmount &&
//                     Number(dataSign.amount) > Number(dataSign.maxAmount)
//                   ) {
//                     showToast({
//                       message: `Too large amount!`,
//                       type: "danger",
//                     });
//                     return;
//                   }
//                   //@ts-ignore
//                   await window.oasis.signOasis(
//                     dataSign.amount,
//                     dataSign.address
//                   );
//                   setLoading(false);
//                   close();
//                   onSuccess();
//                 } catch (error) {
//                   signInteractionStore.rejectAll();
//                   close();
//                   showToast({
//                     message:
//                       error?.message ??
//                       "Something went wrong! Please try again later.",
//                     type: "danger",
//                   });
//                 }
//               }}
//             />
//           </View>
//         </KeyboardAvoidingView>
//       </CardModal>
//     );
//   }),
//   {
//     disableSafeArea: true,
//   }
// );

import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useStyle } from "../../styles";
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useSenderConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { Column, Columns } from "../../components/column";
import { Text } from "react-native";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { XAxis } from "../../components/axis";
import { CloseIcon } from "../../components/icon";
import {
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { FeeSummary } from "./components/fee-summary";
import { CoinPretty, Dec } from "@owallet/unit";
import { Buffer } from "buffer/";
import { registerModal } from "@src/modals/base";
import { defaultRegistry } from "@src/modals/sign/cosmos/message-registry";
import { OWButton } from "@components/button";
import OWText from "@components/text/ow-text";
import OWIcon from "@components/ow-icon/ow-icon";
import {
  SignOasisInteractionStore,
  SignSvmInteractionStore,
} from "@owallet/stores-core";
import { TransactionType } from "@owallet/types";
import { UnsignedOasisTransaction } from "@owallet/stores-oasis";
import { useTheme } from "@src/themes/theme-provider";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";

export const SignSvmModal = registerModal(
  observer<{
    interactionData: NonNullable<SignSvmInteractionStore["waitingData"]>;
  }>(({ interactionData }) => {
    const { chainStore, signSvmInteractionStore, queriesStore } = useStore();

    const intl = useIntl();
    const style = useStyle();

    const [isViewData, setIsViewData] = useState(true);

    const chainId = interactionData.data.chainId;
    const chainInfo = chainStore.getChain(chainId);
    const signer = interactionData.data.signer;

    const senderConfig = useSenderConfig(chainStore, chainId, signer);
    const gasConfig = useGasConfig(chainStore, chainId);
    const amountConfig = useAmountConfig(
      chainStore,
      queriesStore,
      chainId,
      senderConfig
    );
    const feeConfig = useFeeConfig(
      chainStore,
      queriesStore,
      chainId,
      senderConfig,
      amountConfig,
      gasConfig
    );

    // useEffect(() => {
    //   const data = interactionData.data;
    //   if (data.signType === TransactionType.StakingTransfer) {
    //     // const unsignedTx: UnsignedOasisTransaction = JSON.parse(
    //     //     Buffer.from(interactionData.data.message).toString()
    //     // );
    //     const defaultFeeOasis = 0;
    //     const feeAmount = new Dec(defaultFeeOasis);
    //     const feeCurrency = chainInfo.currencies[0];
    //     const fee = new CoinPretty(feeCurrency, feeAmount);
    //
    //     feeConfig.setFee(fee);
    //   }
    // }, [chainInfo.currencies, feeConfig, interactionData.data]);

    // const isTxSigning =
    //   interactionData.data.signType === TransactionType.StakingTransfer;

    const signingDataText = useMemo(() => {
      switch (interactionData.data.signType) {
        // case EthSignType.MESSAGE:
        //     return Buffer.from(interactionData.data.message).toString("hex");
        // case TransactionType.StakingTransfer:
        //   return JSON.stringify(
        //     JSON.parse(Buffer.from(interactionData.data.message).toString()),
        //     null,
        //     2
        //   );
        // case EthSignType.EIP712:
        //     return JSON.stringify(
        //         JSON.parse(Buffer.from(interactionData.data.message).toString()),
        //         null,
        //         2
        //     );
        default:
          return interactionData.data.message;
      }
    }, [interactionData.data]);
    const approve = async () => {
      try {
        await signSvmInteractionStore.approveWithProceedNext(
          interactionData.id,
          interactionData.data.message as string,
          // TODO: Ledger support
          undefined,
          async () => {
            // noop
          },
          {
            preDelay: 200,
          }
        );
      } catch (e) {
        console.log(e);
      }
    };
    const { colors } = useTheme();
    return (
      <WrapViewModal
        title={intl.formatMessage({
          id: "page.sign.ethereum.tx.title",
        })}
      >
        <Box style={style.flatten(["padding-12", "padding-top-0"])}>
          <Gutter size={24} />

          <Columns sum={1} alignY="center">
            <OWText style={style.flatten(["h5"])}>
              <FormattedMessage id="page.sign.ethereum.tx.summary" />
            </OWText>

            <Column weight={1} />

            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
          </Columns>

          <Gutter size={8} />

          {isViewData ? (
            <Box
              maxHeight={128}
              backgroundColor={colors["neutral-surface-bg"]}
              padding={12}
              borderRadius={6}
            >
              <ScrollView persistentScrollbar={true}>
                <OWText style={style.flatten(["body3"])}>
                  {signingDataText}
                </OWText>
              </ScrollView>
            </Box>
          ) : (
            <Box
              padding={12}
              minHeight={128}
              maxHeight={240}
              backgroundColor={colors["neutral-surface-bg"]}
              borderRadius={6}
            >
              {
                //@ts-ignore
                defaultRegistry.render(
                  interactionData.data.chainId,
                  interactionData.data.message
                  // JSON.parse(
                  //   Buffer.from(interactionData.data.message).toString()
                  // ) as UnsignedOasisTransaction
                ).content
              }
            </Box>
          )}

          {/*<Gutter size={60} />*/}
          {interactionData.isInternal && (
            <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />
          )}

          <Gutter size={12} />

          <XAxis>
            <OWButton
              size="large"
              label={intl.formatMessage({ id: "button.reject" })}
              type="secondary"
              style={{ flex: 1, width: "100%" }}
              onPress={async () => {
                await signSvmInteractionStore.rejectWithProceedNext(
                  interactionData.id,
                  () => {}
                );
              }}
            />

            <Gutter size={16} />

            <OWButton
              type={"primary"}
              size="large"
              // disabled={buttonDisabled}
              label={intl.formatMessage({ id: "button.approve" })}
              style={{ flex: 1, width: "100%" }}
              onPress={approve}
            />
          </XAxis>
        </Box>
      </WrapViewModal>
    );
  })
);

export const ViewDataButton: FunctionComponent<{
  isViewData: boolean;
  setIsViewData: (value: boolean) => void;
}> = ({ isViewData, setIsViewData }) => {
  const style = useStyle();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setIsViewData(!isViewData);
      }}
    >
      <XAxis alignY="center">
        <OWText style={style.flatten(["text-button2"])}>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </OWText>

        <Gutter size={4} />

        {isViewData ? (
          <CloseIcon size={12} color={style.get("color-gray-100").color} />
        ) : (
          // <CodeBracketIcon
          //   size={12}
          //   color={style.get('color-gray-100').color}
          // />
          <OWIcon
            size={12}
            name={"tdesignbrackets"}
            color={style.get("color-gray-100").color}
          />
        )}
      </XAxis>
    </TouchableWithoutFeedback>
  );
};
