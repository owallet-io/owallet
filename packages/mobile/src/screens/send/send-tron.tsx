import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@owallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint, toAmount } from "@owallet/common";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { CurrencySelector, MemoInput, TextInput } from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../navigation.provider";
import { Buffer } from "buffer";
import { metrics, spacing } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import { handleSaveHistory, HISTORY_STATUS } from "@src/utils/helper";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { PageHeader } from "@src/components/header/header-new";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { NewAmountInput } from "@src/components/input/amount-input";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { DownArrowIcon } from "@src/components/icon";
import { FeeModal } from "@src/modals/fee";

export const SendTronScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    keyRingStore,
    modalStore,
  } = useStore();
  const [receiveAddress, setReceiveAddress] = useState("");
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
          maxBalance?: Number;
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

  const [balance, setBalance] = useState("0");
  const [fee, setFee] = useState({ type: "", value: "" });

  const fetchBalance = async () => {
    const queryBalance = queries.queryBalances
      .getQueryBech32Address(account.bech32Address)
      .balances.find((bal) => {
        return (
          bal.currency.coinMinimalDenom ===
          sendConfigs.amountConfig.sendCurrency.coinMinimalDenom //currency.coinMinimalDenom
        );
      });

    if (queryBalance) {
      queryBalance.fetch();
      setBalance(
        queryBalance.balance
          .shrink(true)
          .maxDecimals(6)
          .trim(true)
          .upperCase(true)
          .toString()
      );
    }
  };

  useEffect(() => {
    fetchBalance();
    const averageFee = sendConfigs.feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice(averageFee);
    setFee({ type: "Avarage", value: averageFeePrice.toString() });
  }, [account.bech32Address, sendConfigs.amountConfig.sendCurrency]);

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

  const amount = new CoinPretty(
    sendConfigs.amountConfig.sendCurrency,
    new Int(toAmount(Number(sendConfigs.amountConfig.amount)))
  );

  const _onPressFee = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      <FeeModal
        vertical={true}
        sendConfigs={sendConfigs}
        colors={colors}
        setFee={setFee}
      />
    );
  };

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send"
          size="large"
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
                  onBroadcasted: async (txHash) => {
                    smartNavigation.pushSmart("TxPendingResult", {
                      txHash: Buffer.from(txHash).toString("hex"),
                    });

                    const historyInfos = {
                      fromAddress: address,
                      toAddress: receiveAddress,
                      hash: Buffer.from(txHash).toString("hex"),
                      memo: "",
                      fromAmount: sendConfigs.amountConfig.amount,
                      toAmount: sendConfigs.amountConfig.amount,
                      value: sendConfigs.amountConfig.amount,
                      fee: sendConfigs.feeConfig.toStdFee(),
                      type: HISTORY_STATUS.SEND,
                      fromToken: {
                        asset: sendConfigs.amountConfig.sendCurrency.coinDenom,
                        chainId: chainStore.current.chainId,
                      },
                      toToken: {
                        asset: sendConfigs.amountConfig.sendCurrency.coinDenom,
                        chainId: chainStore.current.chainId,
                      },
                      status: "SUCCESS",
                    };

                    await handleSaveHistory(address, historyInfos);
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
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
          }}
        />
      }
    >
      <PageHeader
        title="Send"
        subtitle={chainStore.current.chainName}
        colors={colors}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
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
                <OWText style={{ paddingTop: 8 }} size={12}>
                  Balance : {balance}
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
                    width: metrics.screenWidth / 2,
                  }}
                  amountConfig={sendConfigs.amountConfig}
                  placeholder={"0.0"}
                  maxBalance={balance.split(" ")[0]}
                />
              </View>
            </View>
            <View
              style={{
                alignSelf: "flex-end",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <OWIcon name="tdesign_swap" size={16} />
              <OWText
                style={{ paddingLeft: 4 }}
                color={colors["neutral-text-body"]}
                size={14}
              >
                {priceStore.calculatePrice(amount).toString()}
              </OWText>
            </View>
          </OWCard>
          <OWCard type="normal">
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomColor: colors["neutral-border-default"],
                borderBottomWidth: 1,
                paddingVertical: 16,
                marginBottom: 8,
              }}
            >
              <OWText color={colors["neutral-text-title"]} weight="600">
                Transaction fee
              </OWText>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={_onPressFee}
              >
                <OWText color={colors["primary-text-action"]} weight="600">
                  {fee.type}: {fee.value}{" "}
                </OWText>
                <DownArrowIcon
                  height={11}
                  color={colors["primary-text-action"]}
                />
              </TouchableOpacity>
            </View>

            <OWText color={colors["neutral-text-title"]} size={12}>
              Memo
            </OWText>

            <MemoInput
              label=""
              placeholder="Required if send to CEX"
              inputContainerStyle={{
                backgroundColor: colors["neutral-surface-card"],
                borderWidth: 0,
                paddingHorizontal: 0,
              }}
              memoConfig={sendConfigs.memoConfig}
              labelStyle={styles.sendlabelInput}
            />
          </OWCard>
        </View>
      </ScrollView>
    </PageWithBottom>
  );

  // return (
  //   <PageWithScrollView>
  //     <View style={{ marginBottom: 99 }}>
  //       <View style={{ alignItems: "center", marginVertical: spacing["16"] }}></View>
  //       <View style={styles.sendInputRoot}>
  //         <TextInput
  //           label="Token"
  //           labelStyle={styles.sendlabelInput}
  //           value={route?.params?.item?.coinDenom ?? "TRX"}
  //           editable={false}
  //         />
  //         <TextInput
  //           placeholder="Enter receiving address"
  //           label="Send to"
  //           labelStyle={styles.sendlabelInput}
  //           value={receiveAddress}
  //           onChange={({ nativeEvent: { eventCount, target, text } }) => setReceiveAddress(text)}
  //           autoCorrect={false}
  //           autoCapitalize="none"
  //           autoCompleteType="off"
  //         />
  //         <AmountInput
  //           placeholder="ex. 1000 TRX"
  //           label="Amount"
  //           allowMax={chainStore.current.networkType !== "evm" ? true : false}
  //           amountConfig={sendConfigs.amountConfig}
  //           labelStyle={styles.sendlabelInput}
  //         />

  //         {chainStore.current.networkType !== "evm" ? (
  //           <View
  //             style={{
  //               flexDirection: "row",
  //               paddingBottom: 24,
  //               alignItems: "center"
  //             }}
  //           >
  //             <Toggle
  //               on={customFee}
  //               onChange={value => {
  //                 setCustomFee(value);
  //                 if (!value) {
  //                   if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
  //                     sendConfigs.feeConfig.setFeeType("average");
  //                   }
  //                 }
  //               }}
  //             />
  //             <Text
  //               style={{
  //                 fontWeight: "700",
  //                 fontSize: 16,
  //                 lineHeight: 34,
  //                 paddingHorizontal: 8
  //               }}
  //             >
  //               Custom Fee
  //             </Text>
  //           </View>
  //         ) : null}

  //         {customFee && chainStore.current.networkType !== "evm" ? (
  //           <TextInput
  //             label="Fee"
  //             placeholder="Type your Fee here"
  //             keyboardType={"numeric"}
  //             labelStyle={styles.sendlabelInput}
  //             onChangeText={text => {
  //               const fee = new Dec(Number(text.replace(/,/g, "."))).mul(DecUtils.getTenExponentNInPrecisionRange(6));

  //               sendConfigs.feeConfig.setManualFee({
  //                 amount: fee.roundUp().toString(),
  //                 denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom
  //               });
  //             }}
  //           />
  //         ) : chainStore.current.networkType !== "evm" ? (
  //           <FeeButtons
  //             label="Transaction Fee"
  //             gasLabel="gas"
  //             feeConfig={sendConfigs.feeConfig}
  //             gasConfig={sendConfigs.gasConfig}
  //             labelStyle={styles.sendlabelInput}
  //           />
  //         ) : null}

  //         <OWButton
  //           label="Send"
  //           size="large"
  //           style={{
  //             backgroundColor: colors["primary-surface-default"],
  //             borderRadius: 8
  //           }}
  //           loading={account.isSendingMsg === "send"}
  //           onPress={async () => {
  //             let amount;
  //             if (route?.params?.item?.type === "trc20") {
  //               amount = Number((sendConfigs.amountConfig.amount ?? "0").replace(/,/g, "."));
  //             } else {
  //               amount = new Dec(Number((sendConfigs.amountConfig.amount ?? "0").replace(/,/g, "."))).mul(
  //                 DecUtils.getTenExponentNInPrecisionRange(6)
  //               );
  //             }
  //             try {
  //               await account.sendTronToken(
  //                 sendConfigs.amountConfig.amount,
  //                 sendConfigs.amountConfig.sendCurrency!,
  //                 receiveAddress,
  //                 address,
  //                 {
  //                   onBroadcasted: async txHash => {
  //                     smartNavigation.pushSmart("TxPendingResult", {
  //                       txHash: Buffer.from(txHash).toString("hex")
  //                     });

  //                     const historyInfos = {
  //                       fromAddress: address,
  //                       toAddress: receiveAddress,
  //                       hash: Buffer.from(txHash).toString("hex"),
  //                       memo: "",
  //                       fromAmount: sendConfigs.amountConfig.amount,
  //                       toAmount: sendConfigs.amountConfig.amount,
  //                       value: sendConfigs.amountConfig.amount,
  //                       fee: sendConfigs.feeConfig.toStdFee(),
  //                       type: HISTORY_STATUS.SEND,
  //                       fromToken: {
  //                         asset: sendConfigs.amountConfig.sendCurrency.coinDenom,
  //                         chainId: chainStore.current.chainId
  //                       },
  //                       toToken: {
  //                         asset: sendConfigs.amountConfig.sendCurrency.coinDenom,
  //                         chainId: chainStore.current.chainId
  //                       },
  //                       status: "SUCCESS"
  //                     };

  //                     await handleSaveHistory(address, historyInfos);
  //                   }
  //                 },
  //                 route?.params?.item
  //               );
  //             } catch (err) {
  //               console.log("send tron err", err);
  //               smartNavigation.pushSmart("TxFailedResult", {
  //                 chainId: chainStore.current.chainId,
  //                 txHash: ""
  //               });
  //             }
  //           }}
  //         />
  //       </View>
  //     </View>
  //   </PageWithScrollView>
  // );
});

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
      color: colors["neutral-text-body"],
    },
    containerStyle: {
      backgroundColor: colors["background-box"],
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
    },
  });
