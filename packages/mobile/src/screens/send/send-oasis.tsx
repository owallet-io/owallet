import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxEvmConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { ScrollView, StyleSheet, View } from "react-native";
import { CurrencySelector, TextInput } from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { metrics, spacing } from "../../themes";
import { SignOasisModal } from "@src/modals/sign/sign-oasis";
import { useSmartNavigation } from "@src/navigation.provider";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { PageHeader } from "@src/components/header/header-new";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { NewAmountInput } from "@src/components/input/amount-input";
import { EthereumEndpoint, toAmount } from "@owallet/common";

const styling = (colors) =>
  StyleSheet.create({
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
      color: colors["neutral-Text-body"],
    },
    containerStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
    },
  });

export const SendOasisScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    modalStore,
    keyRingStore,
    priceStore,
  } = useStore();
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

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  const addressCore = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const balance =
    queries.queryBalances.getQueryBech32Address(addressCore).stakable.balance;

  const maxAmount = balance
    ?.trim(true)
    .shrink(true)
    .maxDecimals(9)
    .hideDenom(true)
    .toString();

  const totalBalance = () => {
    if (!balance) return "0";
    return balance?.trim(true).shrink(true).maxDecimals(6).toString();
  };

  const sendConfigs = useSendTxEvmConfig(
    chainStore,
    chainId,
    //@ts-ignore
    accountInfo.msgOpts.send,
    addressCore,
    queriesStore.get(chainId).queryBalances,
    queriesStore.get(chainId),
    EthereumEndpoint
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

  // const amount = new CoinPretty(
  //   sendConfigs.amountConfig.sendCurrency,
  //   new Int(toAmount(Number(sendConfigs.amountConfig.amount)))
  // );

  return (
    <PageWithBottom
      bottomGroup={
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
            if (receiveAddress && Number(sendConfigs.amountConfig.amount) > 0) {
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
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
            color: colors["neutral-text-action-on-dark-bg"],
          }}
        />
      }
    >
      <PageHeader
        title="Send"
        subtitle={chainStore.current.chainName}
        colors={colors}
      />
      <ScrollView
        style={{ height: metrics.screenHeight / 1.4 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <OWCard type="normal">
            <OWText color={colors["neutral-text-title"]} size={12}>
              Recipient
            </OWText>

            <TextInput
              placeholder="Enter receiving address"
              label=""
              labelStyle={styles.sendlabelInput}
              containerStyle={{
                marginBottom: 12,
              }}
              inputContainerStyle={{
                backgroundColor: colors["neutral-surface-card"],
                borderWidth: 0,
                paddingHorizontal: 0,
              }}
              value={receiveAddress}
              onChange={({ nativeEvent: { text } }) => setReceiveAddress(text)}
              autoCorrect={false}
              autoCapitalize="none"
              autoCompleteType="off"
            />
          </OWCard>
          <OWCard style={{ paddingTop: 22 }} type="normal">
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <OWText
                  style={{ paddingTop: 8, maxWidth: metrics.screenWidth / 2.5 }}
                  size={12}
                >
                  Balance : {totalBalance()}
                </OWText>
                <CurrencySelector
                  chainId={chainStore.current.chainId}
                  type="new"
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
                  maxBalance={maxAmount}
                  manually={true}
                />
              </View>
            </View>
            {/* <View
              style={{
                alignSelf: "flex-end",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <OWIcon name="tdesign_swap" size={16} />
              <OWText style={{ paddingLeft: 4 }} color={colors["neutral-text-body"]} size={14}>
              {priceStore.calculatePrice(amount).toString()}
              </OWText>
            </View> */}
          </OWCard>
        </View>
      </ScrollView>
    </PageWithBottom>
  );
});
