import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig, useSendTxEvmConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint } from "@owallet/common";
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
import { useSmartNavigation } from "../../navigation.provider";
import { Buffer } from "buffer";
import { spacing } from "../../themes";
import { Text } from "@src/components/text";
import { Toggle } from "../../components/toggle";
import { OWBox } from "@src/components/card";
import { OWSubTitleHeader } from "@src/components/header";

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
      backgroundColor: colors["background-box"],
    },
  });

export const SendEvmScreen: FunctionComponent = observer(() => {
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

  const smartNavigation = useSmartNavigation();

  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const sendConfigs = useSendTxEvmConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    address,
    queries.queryBalances,
    queries,
    EthereumEndpoint
    // chainStore.current.networkType === "evm" &&
    //   queriesStore.get(chainStore.current.chainId).evm.queryEvmBalance,

    // address
  );

  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => {
          // if (cur?.contractAddress?.includes(route?.params?.contractAddress)) {
          //   return cur?.contractAddress?.includes(
          //     route?.params?.contractAddress
          //   );
          // }
          if (cur?.coinMinimalDenom.includes(route?.params?.contractAddress)) {
            return cur?.coinMinimalDenom.includes(
              route?.params?.contractAddress
            );
          }
          // if (cur?.type === "erc20") {
          //   return cur.coinDenom == route.params.currency;
          // }
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
  const { gas: gasErc20 } = queriesStore
    .get(chainId)
    .evmContract.queryGas.getGas({
      to: sendConfigs.recipientConfig.recipient,
      from: address,
      contract_address:
        sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.split(":")[1],
      amount: sendConfigs.amountConfig.amount,
    });
  const { gas: gasNative } = queriesStore.get(chainId).evm.queryGas.getGas({
    to: sendConfigs.recipientConfig.recipient,
    from: address,
  });
  const { gasPrice } = queriesStore
    .get(chainId)
    .evm.queryGasPrice.getGasPrice();
  useEffect(() => {
    if (!gasPrice) return;
    sendConfigs.gasConfig.setGasPriceStep(gasPrice);
    if (
      sendConfigs.amountConfig?.sendCurrency?.coinMinimalDenom?.startsWith(
        "erc20"
      )
    ) {
      if (!gasErc20) return;
      sendConfigs.gasConfig.setGas(gasErc20);
      return;
    }
    if (!gasNative) return;

    sendConfigs.gasConfig.setGas(gasNative);
    return () => {};
  }, [gasNative, gasPrice, gasErc20, sendConfigs.amountConfig?.sendCurrency]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    // sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
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
              backgroundColor: colors["background-box"],
            }}
          />
          <AddressInput
            placeholder="Enter receiving address"
            label="Send to"
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors["background-box"],
            }}
          />
          <AmountInput
            placeholder={`ex. 1000 ${chainStore.current.stakeCurrency.coinDenom}`}
            label="Amount"
            allowMax={true}
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors["background-box"],
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
              Custom gas
            </Text>
          </View>

          <FeeButtons
            label="Transaction Fee"
            gasLabel="Gas"
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
            labelStyle={styles.sendlabelInput}
            isGasInputOpen={customFee}
          />

          {/* <MemoInput
            label="Memo (Optional)"
            placeholder="Type your memo here"
            inputContainerStyle={{
              backgroundColor: colors["background-box"],
            }}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          /> */}
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
                    sendConfigs.feeConfig.toStdEvmFee(),
                    {
                      preferNoSetFee: true,
                      preferNoSetMemo: true,
                      networkType: chainStore.current.networkType,
                      chainId: chainStore.current.chainId,
                    },

                    {
                      onFulfill: (tx) => {},
                      onBroadcasted: (txHash) => {
                        analyticsStore.logEvent("Send token tx broadcasted", {
                          chainId: chainStore.current.chainId,
                          chainName: chainStore.current.chainName,
                          feeType: sendConfigs.feeConfig.feeType,
                        });
                        smartNavigation.pushSmart("TxPendingResult", {
                          txHash: Buffer.from(txHash).toString("hex"),
                        });
                      },
                    },
                    // In case send erc20 in evm network
                    sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.startsWith(
                      "erc20"
                    )
                      ? {
                          type: "erc20",
                          from: address,
                          contract_addr:
                            sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.split(
                              ":"
                            )[1],
                          recipient: sendConfigs.recipientConfig.recipient,
                          amount: sendConfigs.amountConfig.amount,
                        }
                      : null
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
                  if (smartNavigation.canGoBack) {
                    smartNavigation.goBack();
                  } else {
                    smartNavigation.navigateSmart("Home", {});
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
