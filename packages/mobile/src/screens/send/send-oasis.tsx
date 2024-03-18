import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { PageWithScrollView } from "../../components/page";
import { StyleSheet, View } from "react-native";
import {
  AmountInput,
  CurrencySelector,
  TextInput,
} from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { spacing } from "../../themes";
import { OWBox } from "@src/components/card";
import { OWSubTitleHeader } from "@src/components/header";
import { SignOasisModal } from "@src/modals/sign/sign-oasis";
import { useSmartNavigation } from "@src/navigation.provider";

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

export const SendOasisScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, modalStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [receiveAddress, setReceiveAddress] = useState("");

  const smartNavigation = useSmartNavigation();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          maxAmount?: string;
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
  // const maxAmount = route?.params?.maxAmount;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  const balance = queries.evm.queryEvmBalance.getQueryBalance(
    account.bech32Address
  )?.balance;
  let maxAmount = balance
    ?.trim(true)
    .shrink(true)
    .maxDecimals(9)
    .hideDenom(true)
    .toString();

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    receiveAddress,
    queries.queryBalances,
    chainStore.current.rpc,
    queriesStore.get(chainStore.current.chainId).evm.queryEvmBalance
  );

  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => {
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

  return (
    <PageWithScrollView backgroundColor={colors["background"]}>
      <View style={{ marginBottom: 99 }}>
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
          <TextInput
            placeholder="Enter receiving address"
            label="Send to"
            labelStyle={styles.sendlabelInput}
            value={receiveAddress}
            onChange={({ nativeEvent: { text } }) => setReceiveAddress(text)}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <AmountInput
            placeholder={`ex. 1000 ${chainStore.current.stakeCurrency.coinDenom}`}
            label="Amount"
            allowMax={false}
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors["background-box"],
            }}
          />

          <OWButton
            label="Send"
            loading={account.isSendingMsg === "send"}
            onPress={async () => {
              modalStore.setOptions({
                bottomSheetModalConfig: {
                  enablePanDownToClose: false,
                  enableOverDrag: false,
                },
              });
              if (
                receiveAddress &&
                Number(sendConfigs.amountConfig.amount) > 0
              ) {
                modalStore.setChildren(
                  <SignOasisModal
                    isOpen={true}
                    onSuccess={() => {
                      smartNavigation.replaceSmart("TxSuccessResult", {
                        chainId,
                        txHash: "",
                      });
                    }}
                    data={{
                      amount: sendConfigs.amountConfig.amount,
                      address: receiveAddress,
                      maxAmount,
                    }}
                    close={async () => await modalStore.close()}
                  />
                );
              }
            }}
          />
        </OWBox>
      </View>
    </PageWithScrollView>
  );
});
