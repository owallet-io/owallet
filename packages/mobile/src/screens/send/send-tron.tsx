import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint, getBase58Address } from "@owallet/common";
import { PageWithScrollView } from "../../components/page";
import { StyleSheet, View } from "react-native";
import { Dec, DecUtils } from "@owallet/unit";
import { AmountInput, FeeButtons, TextInput } from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../navigation.provider";
import { Buffer } from "buffer";
import { spacing } from "../../themes";
import { Text } from "@src/components/text";
import { Toggle } from "../../components/toggle";
import { useTheme } from "@src/themes/theme-provider";

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

export const SendTronScreen: FunctionComponent = observer((props) => {
  const {
    chainStore,
    accountStore,
    queriesStore,

    keyRingStore,
  } = useStore();

  const [receiveAddress, setReceiveAddress] = useState("");
  const [customFee, setCustomFee] = useState(false);
  const { colors } = useTheme();
  const styles = styling(colors);
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
          item?: {
            amount: string;
            coinDecimals: number;
            coinDenom: string;
            coinGeckoId: string;
            coinImageUrl: string;
            contractAddress: string;
            tokenName: string;
            type?: string;
          };
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

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint,
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
      setReceiveAddress(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  return (
    <PageWithScrollView>
      <View style={{ marginBottom: 99 }}>
        <View
          style={{ alignItems: "center", marginVertical: spacing["16"] }}
        ></View>
        <View style={styles.sendInputRoot}>
          <TextInput
            label="Token"
            labelStyle={styles.sendlabelInput}
            value={route?.params?.item?.coinDenom ?? "TRX"}
            editable={false}
          />
          <TextInput
            placeholder="Enter receiving address"
            label="Send to"
            labelStyle={styles.sendlabelInput}
            value={receiveAddress}
            onChange={({ nativeEvent: { eventCount, target, text } }) =>
              setReceiveAddress(text)
            }
            autoCorrect={false}
            autoCapitalize="none"
            autoCompleteType="off"
          />
          <AmountInput
            placeholder="ex. 1000 TRX"
            label="Amount"
            allowMax={chainStore.current.networkType !== "evm" ? true : false}
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
          />

          {chainStore.current.networkType !== "evm" ? (
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
                }}
              >
                Custom Fee
              </Text>
            </View>
          ) : null}

          {customFee && chainStore.current.networkType !== "evm" ? (
            <TextInput
              label="Fee"
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
          ) : chainStore.current.networkType !== "evm" ? (
            <FeeButtons
              label="Transaction Fee"
              gasLabel="gas"
              feeConfig={sendConfigs.feeConfig}
              gasConfig={sendConfigs.gasConfig}
              labelStyle={styles.sendlabelInput}
            />
          ) : null}

          <OWButton
            label="Send"
            size="large"
            style={{
              backgroundColor: colors["primary-surface-default"],
              borderRadius: 8,
            }}
            loading={account.isSendingMsg === "send"}
            onPress={async () => {
              let amount;
              if (route?.params?.item?.type === "trc20") {
                amount = Number(
                  (sendConfigs.amountConfig.amount ?? "0").replace(/,/g, ".")
                );
              } else {
                amount = new Dec(
                  Number(
                    (sendConfigs.amountConfig.amount ?? "0").replace(/,/g, ".")
                  )
                ).mul(DecUtils.getTenExponentNInPrecisionRange(6));
              }
              try {
                await account.sendTronToken(
                  sendConfigs.amountConfig.amount,
                  sendConfigs.amountConfig.sendCurrency!,
                  receiveAddress,
                  address,
                  {
                    onBroadcasted: (txHash) => {
                      smartNavigation.pushSmart("TxPendingResult", {
                        txHash: Buffer.from(txHash).toString("hex"),
                      });
                    },
                  },
                  route?.params?.item
                );
              } catch (err) {
                console.log("send tron err", err);
                smartNavigation.pushSmart("TxFailedResult", {
                  chainId: chainStore.current.chainId,
                  txHash: "",
                });
              }
            }}
          />
        </View>
      </View>
    </PageWithScrollView>
  );
});
