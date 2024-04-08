import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { registerModal } from "../base";

import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";

import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { navigationRef } from "../../router/root";
import { ChainIdEnum, ExtensionKVStore, TRIGGER_TYPE } from "@owallet/common";
import { AsyncKVStore } from "@src/common";
import {
  useAmountConfig,
  useFeeTronConfig,
  useGetFeeTron,
  useRecipientConfig,
} from "@owallet/hooks";
import { CoinPretty, Dec, Int, IntPretty } from "@owallet/unit";
import OWText from "@src/components/text/ow-text";
import { AmountCard, WasmExecutionMsgView } from "@src/modals/sign/components";
import ItemReceivedToken from "@src/screens/transactions/components/item-received-token";
import { Bech32Address } from "@owallet/cosmos";

import OWButtonGroup from "@src/components/button/OWButtonGroup";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";

import FastImage from "react-native-fast-image";
import { useTheme } from "@src/themes/theme-provider";
import { FeeInSign } from "@src/modals/sign/fee";
import ItemDetail from "@src/screens/transactions/components/item-details";

export const SignTronModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
}> = registerModal(
  observer(() => {
    const {
      chainStore,
      keyRingStore,
      signInteractionStore,
      accountStore,
      queriesStore,
      priceStore,
    } = useStore();
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const addressTronBase58 = accountInfo.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses
    );
    const [dataSign, setDataSign] = useState(null);
    const [txInfo, setTxInfo] = useState();
    const { waitingTronData } = signInteractionStore;

    const getDataTx = async () => {
      if (!waitingTronData) return;
      const kvStore = new AsyncKVStore("keyring");
      const triggerTxId = await kvStore.get(
        `${TRIGGER_TYPE}:${waitingTronData.data.txID}`
      );
      console.log(
        "b3: get info trigger by txid: \n",
        triggerTxId,
        `${TRIGGER_TYPE}:${waitingTronData.data.txID}`
      );
      setTxInfo(triggerTxId as any);
      kvStore.set(`${TRIGGER_TYPE}:${waitingTronData.data.txID}`, null);
    };

    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    const style = useStyle();

    const _onPressReject = () => {
      try {
        signInteractionStore.rejectAll();
      } catch (error) {
        console.error(error);
      }
    };
    const queries = queriesStore.get(chainStore.selectedChainId);

    const amountConfig = useAmountConfig(
      chainStore,
      chainStore.selectedChainId,
      accountInfo.evmosHexAddress,
      queries.queryBalances
    );
    const recipientConfig = useRecipientConfig(
      chainStore,
      chainStore.selectedChainId
    );
    const { feeTrx, estimateEnergy, estimateBandwidth, feeLimit } =
      useGetFeeTron(
        addressTronBase58,
        amountConfig,
        recipientConfig,
        queries.tron,
        chainStore.current,
        keyRingStore,
        txInfo
      );
    console.log(estimateBandwidth, "estimateBandwidth");
    const feeConfig = useFeeTronConfig(
      chainStore,
      chainStore.selectedChainId,
      accountInfo.evmosHexAddress,
      queries.queryBalances,
      queries
    );
    useEffect(() => {
      if (feeTrx) {
        feeConfig.setManualFee(feeTrx);
      }
      return () => {
        feeConfig.setManualFee(null);
      };
    }, [feeTrx]);
    useEffect(() => {
      console.log(txInfo, "txInfo");
      if (txInfo && amountConfig) {
        //@ts-ignore
        const tx = txInfo?.parameters.find(
          (item, index) => item.type === "uint256"
        );
        amountConfig.setAmount(tx?.value);
      }
    }, [txInfo, amountConfig]);
    useEffect(() => {
      if (dataSign) return;

      if (waitingTronData) {
        const dataTron = waitingTronData?.data;
        getDataTx();
        setDataSign(dataTron);
        if (dataTron?.recipient) {
          recipientConfig.setRawRecipient(dataTron?.recipient);
        }
        if (dataTron?.amount) {
          amountConfig.setAmount(dataTron?.amount);
        }
        if (dataTron?.currency) {
          amountConfig.setSendCurrency(dataTron?.currency);
        }

        chainStore.selectChain(ChainIdEnum.TRON);
      }
    }, [waitingTronData]);
    const error = feeConfig.getError();
    const txStateIsValid = error == null;
    const feeLimitData = feeLimit?.gt(new Int(0)) ? feeLimit?.toString() : null;
    const _onPressApprove = async () => {
      try {
        //@ts-ignore
        if (txInfo?.functionSelector) {
          await signInteractionStore.approveTronAndWaitEnd({
            ...waitingTronData?.data,
          });
        } else {
          //@ts-ignore
          await signInteractionStore.approveTronAndWaitEnd({
            ...waitingTronData?.data,
            amount: amountConfig?.getAmountPrimitive()?.amount,
            feeLimit: feeLimitData,
          });
        }
      } catch (error) {
        signInteractionStore.rejectAll();
        console.log("error approveTronAndWaitEnd", error);
      }
    };
    const renderAmount = () => {
      if (
        !amountConfig.sendCurrency ||
        !amountConfig.getAmountPrimitive().amount
      )
        return null;
      return new CoinPretty(
        amountConfig.sendCurrency,
        new Dec(amountConfig.getAmountPrimitive().amount)
      )
        ?.maxDecimals(9)
        ?.trim(true)
        ?.toString();
    };
    const checkPrice = () => {
      if (
        !amountConfig.sendCurrency ||
        !amountConfig.getAmountPrimitive().amount
      )
        return;
      const coin = new CoinPretty(
        amountConfig.sendCurrency,
        new Dec(amountConfig.getAmountPrimitive().amount)
      );
      const totalPrice = priceStore.calculatePrice(coin);
      return totalPrice?.toString();
    };
    const checkImageCoin = () => {
      if (!amountConfig.sendCurrency) return;
      if (amountConfig.sendCurrency?.coinImageUrl)
        return (
          <View
            style={{
              alignSelf: "center",
              paddingVertical: 8,
            }}
          >
            <FastImage
              style={{
                height: 30,
                width: 30,
              }}
              source={{
                uri: amountConfig.sendCurrency?.coinImageUrl,
              }}
            />
          </View>
        );
      return null;
    };
    const { colors } = useTheme();
    return (
      <WrapViewModal
        style={{
          backgroundColor: colors["neutral-surface-card"],
        }}
      >
        <View style={{ paddingTop: 16 }}>
          {/*<View>{renderedMsgs}</View>*/}
          <OWText
            size={16}
            weight={"700"}
            style={{
              textAlign: "center",
              paddingBottom: 20,
            }}
          >
            {`Confirmation`.toUpperCase()}
          </OWText>

          {renderAmount() ? (
            <AmountCard
              imageCoin={checkImageCoin()}
              amountStr={renderAmount()}
              totalPrice={checkPrice()}
            />
          ) : (
            dataSign && (
              <ScrollView
                style={{
                  backgroundColor: colors["neutral-surface-bg"],
                  padding: 16,
                  borderRadius: 24,
                  maxHeight: 300,
                }}
              >
                <WasmExecutionMsgView msg={dataSign} />
              </ScrollView>
            )
          )}

          <View
            style={{
              backgroundColor: colors["neutral-surface-card"],
              paddingHorizontal: 16,
              paddingTop: 16,
              borderRadius: 24,
              marginBottom: 24,
              marginTop: 2,
            }}
          >
            {addressTronBase58 && (
              <ItemReceivedToken
                label={"From"}
                valueDisplay={Bech32Address.shortenAddress(
                  addressTronBase58,
                  20
                )}
                value={addressTronBase58}
              />
            )}
            {recipientConfig?.recipient && (
              <ItemReceivedToken
                label={"To"}
                valueDisplay={
                  recipientConfig.recipient &&
                  Bech32Address.shortenAddress(recipientConfig.recipient, 20)
                }
                value={recipientConfig.recipient}
              />
            )}

            {estimateBandwidth?.gt(new Int(0)) && (
              <ItemDetail
                label={"Bandwidth Fee"}
                value={estimateBandwidth?.toString()}
              />
            )}
            {estimateEnergy?.gt(new Int(0)) && (
              <ItemDetail
                label={"Energy Fee"}
                value={new IntPretty(estimateEnergy?.toDec())?.toString()}
              />
            )}
            <FeeInSign
              feeConfig={feeConfig}
              gasConfig={null}
              signOptions={{ preferNoSetFee: true }}
              isInternal={true}
            />
          </View>
        </View>

        <OWButtonGroup
          labelApprove={"Confirm"}
          labelClose={"Cancel"}
          disabledApprove={!txStateIsValid}
          disabledClose={signInteractionStore.isLoading}
          loadingApprove={signInteractionStore.isLoading}
          styleApprove={{
            borderRadius: 99,
            backgroundColor: !txStateIsValid
              ? colors["primary-surface-disable"]
              : colors["primary-surface-default"],
          }}
          onPressClose={_onPressReject}
          onPressApprove={_onPressApprove}
          styleClose={{
            borderRadius: 99,
            backgroundColor: colors["neutral-surface-action3"],
          }}
        />
      </WrapViewModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
