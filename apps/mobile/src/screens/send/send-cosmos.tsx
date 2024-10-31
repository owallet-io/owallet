import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  useGasSimulator,
  useSendMixedIBCTransferConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { useStore } from "../../stores";
import { DenomHelper, ICNSInfo } from "@owallet/common";
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

export const SendCosmosScreen: FunctionComponent<{
  chainId: string;
  coinMinimalDenom: string;
  recipientAddress: string;
  setSelectedKey: (key) => void;
}> = observer(
  ({ chainId, coinMinimalDenom, recipientAddress, setSelectedKey }) => {
    const { chainStore, accountStore, priceStore, queriesStore, appInitStore } =
      useStore();
    const { colors } = useTheme();
    const styles = styling(colors);

    const chainInfo = chainStore.getChain(chainId);

    const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

    const account = accountStore.getAccount(chainId);
    const queryBalances = queriesStore.get(chainId).queryBalances;
    const sender = account.bech32Address;
    const balance = queryBalances
      .getQueryBech32Address(sender)
      .getBalance(currency);
    const sendConfigs = useSendMixedIBCTransferConfig(
      chainStore,
      queriesStore,
      chainId,
      sender,
      // TODO: 이 값을 config 밑으로 빼자
      300000,
      false,
      {
        allowHexAddressToBech32Address: !chainStore
          .getChain(chainId)
          .chainId.startsWith("injective"),
        allowHexAddressOnly: false,
        icns: ICNSInfo,
        computeTerraClassicTax: true,
      }
    );

    sendConfigs.amountConfig.setCurrency(currency);
    useEffect(() => {
      sendConfigs.recipientConfig.setValue(recipientAddress || "");
    }, [recipientAddress, sendConfigs.recipientConfig]);

    const gasSimulatorKey = useMemo(() => {
      const txType: "evm" | "cosmos" = "cosmos";

      if (sendConfigs.amountConfig.currency) {
        const denomHelper = new DenomHelper(
          sendConfigs.amountConfig.currency.coinMinimalDenom
        );

        if (denomHelper.type !== "native") {
          if (denomHelper.type === "cw20") {
            // Probably, the gas can be different per cw20 according to how the contract implemented.
            return `${txType}/${denomHelper.type}/${denomHelper.contractAddress}`;
          }

          return `${txType}/${denomHelper.type}`;
        }
      }

      return `${txType}/native`;
    }, [sendConfigs.amountConfig.currency]);
    const intl = useIntl();
    const gasSimulator = useGasSimulator(
      new AsyncKVStore("gas-simulator.screen.send/send"),
      chainStore,
      chainId,
      sendConfigs.gasConfig,
      sendConfigs.feeConfig,
      gasSimulatorKey,
      () => {
        if (!sendConfigs.amountConfig.currency) {
          throw new Error(
            intl.formatMessage({ id: "error.send-currency-not-set" })
          );
        }

        // Prefer not to use the gas config or fee config,
        // because gas simulator can change the gas config and fee config from the result of reaction,
        // and it can make repeated reaction.
        if (
          sendConfigs.amountConfig.uiProperties.loadingState ===
            "loading-block" ||
          sendConfigs.amountConfig.uiProperties.error != null ||
          sendConfigs.recipientConfig.uiProperties.loadingState ===
            "loading-block" ||
          sendConfigs.recipientConfig.uiProperties.error != null
        ) {
          throw new Error(
            intl.formatMessage({ id: "error.not-read-simulate-tx" })
          );
        }

        const denomHelper = new DenomHelper(
          sendConfigs.amountConfig.currency.coinMinimalDenom
        );
        // I don't know why, but simulation does not work for secret20
        if (denomHelper.type === "secret20") {
          throw new Error(
            intl.formatMessage({
              id: "error.simulating-secret-wasm-not-supported",
            })
          );
        }
        return account.makeSendTokenTx(
          sendConfigs.amountConfig.amount[0].toDec().toString(),
          sendConfigs.amountConfig.amount[0].currency,
          sendConfigs.recipientConfig.recipient
        );
      }
    );

    useEffect(() => {
      // To simulate secretwasm, we need to include the signature in the tx.
      // With the current structure, this approach is not possible.
      if (
        sendConfigs.amountConfig.currency &&
        new DenomHelper(sendConfigs.amountConfig.currency.coinMinimalDenom)
          .type === "secret20"
      ) {
        gasSimulator.forceDisable(
          new Error(
            intl.formatMessage({
              id: "error.simulating-secret-20-not-supported",
            })
          )
        );
        sendConfigs.gasConfig.setValue(
          // TODO: 이 값을 config 밑으로 빼자
          250000
        );
      } else {
        gasSimulator.forceDisable(false);
        gasSimulator.setEnabled(true);
      }
    }, [
      gasSimulator,
      intl,
      sendConfigs.amountConfig.currency,
      sendConfigs.gasConfig,
    ]);

    const txConfigsValidate = useTxConfigsValidate({
      ...sendConfigs,
      gasSimulator,
    });

    const historyType = "basic-send";

    const submitSend = async () => {
      if (!txConfigsValidate.interactionBlocked) {
        try {
          const tx = accountStore
            .getAccount(chainId)
            .makeSendTokenTx(
              sendConfigs.amountConfig.amount[0].toDec().toString(),
              sendConfigs.amountConfig.amount[0].currency,
              sendConfigs.recipientConfig.recipient
            );
          await tx.send(
            sendConfigs.feeConfig.toStdFee(),
            sendConfigs.memoConfig.memo,
            {
              preferNoSetFee: true,
              preferNoSetMemo: true,
              sendTx: async (chainId, tx, mode) => {
                let msg: Message<Uint8Array> = new SendTxAndRecordMsg(
                  historyType,
                  chainId,
                  sendConfigs.recipientConfig.chainId,
                  tx,
                  mode,
                  false,
                  sendConfigs.senderConfig.sender,
                  sendConfigs.recipientConfig.recipient,
                  sendConfigs.amountConfig.amount.map((amount) => {
                    return {
                      amount: DecUtils.getTenExponentN(
                        amount.currency.coinDecimals
                      )
                        .mul(amount.toDec())
                        .toString(),
                      denom: amount.currency.coinMinimalDenom,
                    };
                  }),
                  sendConfigs.memoConfig.memo
                );

                return await new RNMessageRequesterInternal().sendMessage(
                  BACKGROUND_PORT,
                  msg
                );
              },
            },
            {
              onBroadcasted: async (txHash) => {
                chainStore.enableVaultsWithCosmosAddress(
                  sendConfigs.recipientConfig.chainId,
                  sendConfigs.recipientConfig.recipient
                );
                navigate(SCREENS.TxPendingResult, {
                  chainId,
                  txHash: Buffer.from(txHash).toString("hex"),
                });
              },
              onFulfill: (tx: any) => {
                if (tx.code != null && tx.code !== 0) {
                  console.log(tx);
                  showToast({
                    type: "danger",
                    message: intl.formatMessage({
                      id: "error.transaction-failed",
                    }),
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
          if (e?.message === "Request rejected") {
            return;
          }
        }
      }
    };

    return (
      <PageWithBottom
        bottomGroup={
          <OWButton
            label="Send"
            disabled={txConfigsValidate.interactionBlocked}
            loading={accountStore.getAccount(chainId).isSendingMsg === "send"}
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
              <OWText color={colors["neutral-text-title"]}>Recipient</OWText>

              <AddressInput
                colors={colors}
                placeholder="Enter address"
                label=""
                recipientConfig={sendConfigs.recipientConfig}
                memoConfig={sendConfigs.memoConfig}
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
                  {priceStore
                    .calculatePrice(sendConfigs.amountConfig.amount[0])
                    ?.toString()}
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
                gasConfig={sendConfigs.gasConfig}
                gasSimulator={gasSimulator}
              />
              {/*<View style={styles.containerFee}>*/}
              {/*  <OWText*/}
              {/*    color={colors["neutral-text-title"]}*/}
              {/*    weight="600"*/}
              {/*    size={16}*/}
              {/*  >*/}
              {/*    Transaction fee*/}
              {/*  </OWText>*/}
              {/*  <TouchableOpacity*/}
              {/*    style={{ flexDirection: "row" }}*/}
              {/*    onPress={_onPressFee}*/}
              {/*  >*/}
              {/*    <OWText*/}
              {/*      color={colors["primary-text-action"]}*/}
              {/*      weight="600"*/}
              {/*      size={16}*/}
              {/*    >*/}
              {/*      {capitalizedText(sendConfigs.feeConfig.feeType)}:{" "}*/}
              {/*      {priceStore*/}
              {/*        .calculatePrice(sendConfigs.feeConfig.fee)*/}
              {/*        ?.toString()}{" "}*/}
              {/*    </OWText>*/}
              {/*    <DownArrowIcon*/}
              {/*      height={11}*/}
              {/*      color={colors["primary-text-action"]}*/}
              {/*    />*/}
              {/*  </TouchableOpacity>*/}
              {/*</View>*/}

              <OWText color={colors["neutral-text-title"]}>Memo</OWText>

              <MemoInput
                label=""
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
      color: colors["neutral-text-body"],
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
