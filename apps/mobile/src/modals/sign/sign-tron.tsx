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
// import {defaultRegistry} from './components/eth-tx/registry';
import { CoinPretty, Dec } from "@owallet/unit";
import { Buffer } from "buffer/";
import { registerModal } from "@src/modals/base";
import { defaultRegistry } from "@src/modals/sign/cosmos/message-registry";
import { OWButton } from "@components/button";
import OWText from "@components/text/ow-text";
import OWIcon from "@components/ow-icon/ow-icon";
import { SignTronInteractionStore } from "@owallet/stores-core";
import { TransactionType } from "@owallet/types";
import { UnsignedOasisTransaction } from "@owallet/stores-oasis";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import { useTheme } from "@src/themes/theme-provider";

export const SignTronModal = registerModal(
  observer<{
    interactionData: NonNullable<SignTronInteractionStore["waitingData"]>;
  }>(({ interactionData }) => {
    const { chainStore, signTronInteractionStore, queriesStore } = useStore();

    const intl = useIntl();
    const style = useStyle();

    const [isViewData, setIsViewData] = useState(false);

    const chainId = interactionData.data.chainId;
    // const chainInfo = chainStore.getChain(chainId);
    // const signer = interactionData.data.signer;

    // const senderConfig = useSenderConfig(chainStore, chainId, signer);
    // const gasConfig = useGasConfig(chainStore, chainId);
    // const amountConfig = useAmountConfig(chainStore, queriesStore, chainId, senderConfig);
    // const feeConfig = useFeeConfig(chainStore, queriesStore, chainId, senderConfig, amountConfig, gasConfig);

    // useEffect(() => {
    //   const data = interactionData.data;
    // }, [chainInfo.currencies, feeConfig, interactionData.data]);

    // const signingDataText = useMemo(() => {
    //   console.log('interactionData.data', interactionData.data);
    // }, [interactionData.data]);

    const approve = async () => {
      try {
        await signTronInteractionStore.approveWithProceedNext(
          interactionData.id,
          Buffer.from(
            Buffer.from(JSON.stringify(interactionData.data.data)).toString(
              "hex"
            )
          ),
          undefined,
          async () => {
            // noop
          },
          {
            preDelay: 200,
          }
        );
      } catch (e) {
        console.log("error on sign Tron", e);
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
                  {"signingDataText"}
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
              <Text>{"sign tron"}</Text>
            </Box>
          )}

          <Gutter size={60} />
          {/* {interactionData.isInternal && <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />} */}

          <Gutter size={12} />

          <XAxis>
            <OWButton
              size="large"
              label={intl.formatMessage({ id: "button.reject" })}
              type="secondary"
              style={{ flex: 1, width: "100%" }}
              onPress={async () => {
                await signTronInteractionStore.rejectWithProceedNext(
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
        <Text style={style.flatten(["text-button2", "color-label-default"])}>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </Text>

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
