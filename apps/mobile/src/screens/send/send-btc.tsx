import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  useGasSimulator,
  useSendBtcTxConfig,
  useSendMixedIBCTransferConfig,
  useSendOasisTxConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { useStore } from "../../stores";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  AddressInput,
  CurrencySelector,
  MemoInput,
} from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { metrics, spacing } from "../../themes";
import OWText from "@src/components/text/ow-text";
import OWCard from "@src/components/card/ow-card";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { NewAmountInput } from "@src/components/input/amount-input";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { Buffer } from "buffer";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { OWHeaderTitle } from "@components/header";
import { AsyncKVStore } from "@src/common";
import { useIntl } from "react-intl";
import { BACKGROUND_PORT, Message } from "@owallet/router";
import { SendTxAndRecordMsg } from "@owallet/background";
import { RNMessageRequesterInternal } from "@src/router";
import { FeeControl } from "@components/input/fee-control";
import { showToast } from "@utils/helper";
import { DenomHelper } from "@owallet/common";

export const SendBtcScreen: FunctionComponent<{
  chainId: string;
  coinMinimalDenom: string;
  recipientAddress: string;
  setSelectedKey: (key) => void;
}> = observer(
  ({ chainId, coinMinimalDenom, recipientAddress, setSelectedKey }) => {
    const { chainStore, bitcoinAccountStore, queriesStore, appInitStore } =
      useStore();
    const { colors } = useTheme();
    const styles = styling(colors);

    const chainInfo = chainStore.getChain(chainId);

    const navigation = useNavigation();
    useEffect(() => {
      if (appInitStore.getInitApp.isAllNetworks) return;
      navigation.setOptions({
        headerTitle: () => (
          <OWHeaderTitle title={"Send"} subTitle={chainInfo.chainName} />
        ),
      });
    }, [chainId]);

    const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

    const account = bitcoinAccountStore.getAccount(chainId);
    const queryBalances = queriesStore.get(chainId).queryBalances;
    console.log(coinMinimalDenom, "coinMinimalDenom btc");
    const denomHelper = new DenomHelper(coinMinimalDenom);
    const sender =
      denomHelper.type === "legacy"
        ? account.btcLegacyAddress
        : account.bech32Address;
    const balance = queryBalances
      .getQueryBech32Address(sender)
      .getBalance(currency);

    const sendConfigs = useSendBtcTxConfig(
      chainStore,
      queriesStore,
      chainId,
      sender
    );

    sendConfigs.amountConfig.setCurrency(currency);
    useEffect(() => {
      sendConfigs.recipientConfig.setValue(recipientAddress || "");
    }, [recipientAddress, sendConfigs.recipientConfig]);
    const txConfigsValidate = useTxConfigsValidate({
      ...sendConfigs,
    });

    const submitSend = async () => {
      if (!txConfigsValidate.interactionBlocked) {
        // try {
        //   account.setIsSendingTx(true);
        //   const unsignedTx = account.makeSendTokenTx({
        //     currency: sendConfigs.amountConfig.amount[0].currency,
        //     amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
        //     to: sendConfigs.recipientConfig.recipient,
        //   });
        //   await account.sendTx(sender, unsignedTx, {
        //     onBroadcasted: (txHash) => {
        //       account.setIsSendingTx(false);
        //       navigate(SCREENS.TxPendingResult, {
        //         chainId,
        //         txHash,
        //       });
        //     },
        //     onFulfill: (txReceipt) => {
        //       queryBalances
        //         .getQueryBech32Address(account.bech32Address)
        //         .balances.forEach((balance) => {
        //           if (
        //             balance.currency.coinMinimalDenom === coinMinimalDenom ||
        //             sendConfigs.feeConfig.fees.some(
        //               (fee) =>
        //                 fee.currency.coinMinimalDenom ===
        //                 balance.currency.coinMinimalDenom
        //             )
        //           ) {
        //             balance.fetch();
        //           }
        //         });
        //     },
        //   });
        // } catch (e) {
        //   if (e?.message === "Request rejected") {
        //     return;
        //   }
        // }
      }
    };
    const loadingSend = account.isSendingTx;
    return (
      <PageWithBottom
        bottomGroup={
          <OWButton
            label="Send"
            disabled={loadingSend || txConfigsValidate.interactionBlocked}
            loading={loadingSend}
            onPress={submitSend}
            style={[
              styles.bottomBtn,
              {
                width: metrics.screenWidth - 32,
              },
            ]}
            textStyle={styles.txtBtnSend}
          />
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <OWCard
              type="normal"
              style={[
                // isRecipientError ? styles.errorBorder : null,
                {
                  backgroundColor: colors["neutral-surface-card"],
                },
              ]}
            >
              <AddressInput
                colors={colors}
                placeholder="Enter address"
                label="Recipient"
                recipientConfig={sendConfigs.recipientConfig}
                memoConfig={null}
                labelStyle={styles.sendlabelInput}
                containerStyle={{
                  marginBottom: 12,
                }}
                inputContainerStyle={styles.inputContainerAddress}
              />
            </OWCard>
            <OWCard
              style={[
                {
                  paddingTop: 22,
                  backgroundColor: colors["neutral-surface-card"],
                },
                // isAmountError && styles.errorBorder,
              ]}
              type="normal"
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <OWText style={{ paddingTop: 8 }}>
                    Balance:{" "}
                    {(balance?.balance ?? new CoinPretty(currency, "0"))
                      ?.trim(true)
                      ?.maxDecimals(6)
                      ?.hideDenom(true)
                      ?.toString() || "0"}
                  </OWText>
                  <CurrencySelector
                    chainId={chainId}
                    selectedKey={coinMinimalDenom}
                    setSelectedKey={setSelectedKey}
                    label="Select a token"
                    placeHolder="Select Token"
                    amountConfig={sendConfigs.amountConfig}
                    labelStyle={styles.sendlabelInput}
                    containerStyle={styles.containerStyle}
                    selectorContainerStyle={{
                      backgroundColor: colors["neutral-surface-card"],
                    }}
                  />
                </View>
                <View
                  style={{
                    alignItems: "flex-end",
                    flex: 1,
                  }}
                >
                  <NewAmountInput
                    colors={colors}
                    inputContainerStyle={{
                      borderWidth: 0,
                      width: metrics.screenWidth / 2.3,
                    }}
                    amountConfig={sendConfigs.amountConfig}
                    placeholder={"0.0"}
                  />
                </View>
              </View>
              <View style={styles.containerEstimatePrice}>
                <OWIcon name="tdesign_swap" size={16} />
                <OWText
                  style={{ paddingLeft: 4 }}
                  color={colors["neutral-text-body"]}
                >
                  {/*{estimatePrice}*/}
                </OWText>
              </View>
            </OWCard>
            <OWCard
              style={{
                backgroundColor: colors["neutral-surface-card"],
              }}
              type="normal"
            >
              <FeeControl
                senderConfig={sendConfigs.senderConfig}
                feeConfig={sendConfigs.feeConfig}
                gasConfig={null}
                gasSimulator={null}
              />
              <MemoInput
                label="Message"
                placeholder="Required if send to CEX"
                inputContainerStyle={styles.inputContainerMemo}
                memoConfig={sendConfigs.memoConfig}
                labelStyle={styles.sendlabelInput}
              />
            </OWCard>
          </View>
        </ScrollView>
      </PageWithBottom>
    );
  }
);
const styling = (colors) =>
  StyleSheet.create({
    txtBtnSend: {
      fontSize: 16,
      fontWeight: "600",
      color: colors["neutral-text-action-on-dark-bg"],
    },
    inputContainerAddress: {
      backgroundColor: colors["neutral-surface-card"],
      borderWidth: 0,
      paddingHorizontal: 0,
    },
    containerEstimatePrice: {
      alignSelf: "flex-end",
      flexDirection: "row",
      alignItems: "center",
    },
    containerFee: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
      paddingVertical: 16,
      marginBottom: 8,
    },
    sendInputRoot: {
      paddingHorizontal: spacing["20"],
      paddingVertical: spacing["24"],
      backgroundColor: colors["primary"],
      borderRadius: 24,
    },
    sendlabelInput: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    inputContainerMemo: {
      backgroundColor: colors["neutral-surface-card"],
      borderWidth: 0,
      paddingHorizontal: 0,
    },
    containerStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
    },
    errorBorder: {
      borderWidth: 2,
      borderColor: colors["error-border-default"],
    },
  });
