import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { PageWithScrollView } from "../../components/page";
import { StyleSheet, View } from "react-native";
import { Dec, DecUtils } from "@owallet/unit";

import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
  TextInput,
} from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";

import { Buffer } from "buffer";
import { spacing } from "../../themes";
import { Text } from "@src/components/text";
import { Toggle } from "../../components/toggle";
import { OWBox } from "@src/components/card";
import { goBack, navigate, NavigationAction } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

const styling = (colors) =>
  StyleSheet.create({
    sendInputRoot: {
      paddingHorizontal: spacing["20"],
      paddingVertical: spacing["24"],
      backgroundColor: colors["primary"],
      borderRadius: 24,
    },
    sendlabelInput: {
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 22,
      color: colors["sub-primary-text"],
      marginBottom: spacing["8"],
    },
    containerStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
    },
  });

export const SendScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    sendStore,
    keyRingStore,
  } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [customFee, setCustomFee] = useState(false);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
          contractAddress?: string;
        }
      >,
      string
    >
  >();

  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    address,
    queries.queryBalances
  );

  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => {
          if (cur?.coinMinimalDenom.includes(route?.params?.contractAddress)) {
            return cur?.coinMinimalDenom.includes(
              route?.params?.contractAddress
            );
          }

          if (cur.coinDenom === route.params.currency) {
            return cur.coinDenom === route.params.currency;
          }
          return cur.coinMinimalDenom == route.params.currency;
        }
      );

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route?.params?.currency, sendConfigs.amountConfig]);

  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError();
  // ?? sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithScrollView backgroundColor={colors["background"]}>
      <View style={{ marginBottom: 99 }}>
        {/* <OWSubTitleHeader title="Send" /> */}
        <OWBox>
          <CurrencySelector
            label="Select a token"
            placeHolder="Select Token"
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
            containerStyle={styles.containerStyle}
            selectorContainerStyle={{
              backgroundColor: colors["neutral-surface-bg2"],
            }}
          />
          <AddressInput
            placeholder="Enter receiving address"
            label="Send to"
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors["neutral-surface-bg2"],
            }}
          />
          <AmountInput
            placeholder={`ex. 1000 ${
              sendConfigs.amountConfig.sendCurrency.coinDenom ??
              chainStore.current.stakeCurrency.coinDenom
            }`}
            label="Amount"
            allowMax={true}
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors["neutral-surface-bg2"],
            }}
          />

          <View
            style={{
              flexDirection: "row",
              paddingBottom: 24,
              alignItems: "center",
            }}
          >
            <Toggle
              on={customFee}
              onChange={(value) => {
                setCustomFee(value);
                if (!value) {
                  if (
                    sendConfigs.feeConfig.feeCurrency &&
                    !sendConfigs.feeConfig.fee
                  ) {
                    sendConfigs.feeConfig.setFeeType("average");
                  }
                }
              }}
            />
            <Text
              style={{
                fontWeight: "700",
                fontSize: 16,
                lineHeight: 34,
                paddingHorizontal: 8,
                color: colors["primary-text"],
              }}
            >
              Custom Fee
            </Text>
          </View>

          {customFee ? (
            <TextInput
              label="Fee"
              inputContainerStyle={{
                backgroundColor: colors["neutral-surface-bg2"],
              }}
              placeholder="Type your Fee here"
              keyboardType={"numeric"}
              labelStyle={styles.sendlabelInput}
              onChangeText={(text) => {
                const fee = new Dec(Number(text.replace(/,/g, "."))).mul(
                  DecUtils.getTenExponentNInPrecisionRange(6)
                );

                sendConfigs.feeConfig.setManualFee({
                  amount: fee.roundUp().toString(),
                  denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom,
                });
              }}
            />
          ) : (
            <FeeButtons
              label="Transaction Fee"
              gasLabel="gas"
              feeConfig={sendConfigs.feeConfig}
              gasConfig={sendConfigs.gasConfig}
              labelStyle={styles.sendlabelInput}
            />
          )}

          <MemoInput
            label="Memo (Optional)"
            placeholder="Type your memo here"
            inputContainerStyle={{
              backgroundColor: colors["neutral-surface-bg2"],
            }}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <OWButton
            label="Send"
            disabled={!account.isReadyToSendMsgs || !txStateIsValid}
            loading={account.isSendingMsg === "send"}
            onPress={async () => {
              if (account.isReadyToSendMsgs && txStateIsValid) {
                try {
                  await account.sendToken(
                    sendConfigs.amountConfig.amount,
                    sendConfigs.amountConfig.sendCurrency,
                    sendConfigs.recipientConfig.recipient,
                    sendConfigs.memoConfig.memo,
                    sendConfigs.feeConfig.toStdFee(),
                    {
                      preferNoSetFee: true,
                      preferNoSetMemo: true,
                      networkType: chainStore.current.networkType,
                      chainId: chainStore.current.chainId,
                    },

                    {
                      onFulfill: (tx) => {},
                      onBroadcasted: async (txHash) => {
                        analyticsStore.logEvent("Send token tx broadcasted", {
                          chainId: chainStore.current.chainId,
                          chainName: chainStore.current.chainName,
                          feeType: sendConfigs.feeConfig.feeType,
                        });
                        navigate(SCREENS.TxPendingResult, {
                          txHash: Buffer.from(txHash).toString("hex"),
                          data: {
                            memo: sendConfigs.memoConfig.memo,
                            toAddress: sendConfigs.recipientConfig.recipient,
                            amount: sendConfigs.amountConfig.amount,
                            fromAddress: address,
                            fee: sendConfigs.feeConfig.toStdFee(),
                            currency: sendConfigs.amountConfig.sendCurrency,
                            type: "send",
                          },
                        });
                        const fee = Number(
                          sendConfigs.feeConfig.fee
                            .trim(true)
                            .hideDenom(true)
                            .toString()
                        );
                      },
                    }
                  );
                } catch (e) {
                  if (e?.message === "Request rejected") {
                    return;
                  }

                  // if (
                  //   e?.message?.includes('Cannot read properties of undefined')
                  // ) {
                  //   return;
                  // }

                  // alert(e.message);
                  if (NavigationAction?.canGoBack()) {
                    goBack();
                  } else {
                    navigate(SCREENS.Home, {});
                  }
                }
              }
            }}
          />
        </OWBox>
      </View>
    </PageWithScrollView>
  );
});
