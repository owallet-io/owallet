import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AddressInput,
  AmountInput,
  CurrencySelector,
  MemoInput,
} from "@src/components/input";
import { OWButton } from "@src/components/button";
import { BtcToSats, formatBalance } from "@owallet/bitcoin";
import { useSendTxConfig } from "@owallet/hooks";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import { metrics, spacing } from "@src/themes";
import { observer } from "mobx-react-lite";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { showToast } from "@src/utils/helper";
import { RouteProp, useRoute } from "@react-navigation/native";
import { EthereumEndpoint, toAmount } from "@owallet/common";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { PageHeader } from "@src/components/header/header-new";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { NewAmountInput } from "@src/components/input/amount-input";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { DownArrowIcon } from "@src/components/icon";
import { CoinPretty, Int } from "@owallet/unit";
import { FeeModal } from "@src/modals/fee";

export const SendBtcScreen: FunctionComponent = observer(({}) => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    queriesStore,
    priceStore,
    modalStore,
  } = useStore();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();
  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore.current.chainId;
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    address,
    queries.queryBalances,
    EthereumEndpoint,
    queriesStore.get(chainStore.current.chainId).evm.queryEvmBalance,
    address,
    queries.bitcoin.queryBitcoinBalance
  );

  const data =
    queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.response
      ?.data;
  const utxos = data?.utxos;
  const confirmedBalance = data?.balance;
  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError();

  const txStateIsValid = sendConfigError == null;
  const { colors } = useTheme();
  const refreshBalance = async (address) => {
    try {
      await queries.bitcoin.queryBitcoinBalance
        .getQueryBalance(address)
        ?.waitFreshResponse();
    } catch (error) {
      console.log(
        "🚀 ~ file: send-btc.tsx:112 ~ refreshBalance ~ error:",
        error
      );
    }
  };

  useEffect(() => {
    if (address) {
      refreshBalance(address);
      return;
    }

    return () => {};
  }, [address]);

  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

  const [balance, setBalance] = useState("0");
  const [price, setPrice] = useState("0");
  const [fee, setFee] = useState({ type: "", value: "" });

  const fetchBalance = async () => {
    const balanceBtc =
      queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.balance;
    const priceBalance = priceStore.calculatePrice(balanceBtc);
    const amount = formatBalance({
      balance: Number(balanceBtc?.toCoin().amount),
      cryptoUnit: "BTC",
      coin: chainStore.current.chainId,
    });
    setPrice(priceBalance?.toString() || "$0");
    setBalance(amount);
  };

  useEffect(() => {
    fetchBalance();
    const averageFee = sendConfigs.feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice(averageFee);
    setFee({ type: "Avarage", value: averageFeePrice.toString() });
  }, [account.bech32Address, sendConfigs.amountConfig.sendCurrency]);

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

  const onSend = useCallback(async () => {
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
          chainId: chainId,
        },

        {
          onFulfill: async (tx) => {
            console.log("🚀 ~ file: send-btc.tsx:109 ~ onSend ~ tx:", tx);

            if (tx) {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.TxSuccessResult,
                params: {
                  txHash: tx,
                  chainId: chainId,
                },
              });
            }

            return;
          },
          onBroadcasted: async (txHash) => {
            try {
            } catch (error) {
              console.log(
                "🚀 ~ file: send-btc.tsx:149 ~ onBroadcasted: ~ error:",
                error
              );
            }
          },
        },
        {
          confirmedBalance: confirmedBalance,
          utxos: utxos,
          blacklistedUtxos: [],
          amount: BtcToSats(Number(sendConfigs.amountConfig.amount)),
          feeRate: sendConfigs.feeConfig.feeRate[sendConfigs.feeConfig.feeType],
        }
      );
    } catch (error) {
      if (error?.message) {
        showToast({
          message: error?.message,
          type: "danger",
        });
        return;
      }
      showToast({
        type: "danger",
        message: JSON.stringify(error),
      });
      console.log("🚀 ~ file: send-btc.tsx:146 ~ onSend ~ error:", error);
    }
  }, [
    chainStore.current.networkType,
    chainId,
    utxos,
    address,
    confirmedBalance,
  ]);

  const styles = styling(colors);

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send"
          disabled={!account.isReadyToSendMsgs || !txStateIsValid}
          loading={account.isSendingMsg === "delegate"}
          onPress={onSend}
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
      <ScrollView
        style={{ height: metrics.screenHeight / 1.4 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <OWCard type="normal">
            <OWText color={colors["neutral-text-title"]} size={12}>
              Recipient
            </OWText>

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
              inputContainerStyle={{
                backgroundColor: colors["neutral-surface-card"],
                borderWidth: 0,
                paddingHorizontal: 0,
              }}
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
                {price}
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
  //   <PageWithScrollView backgroundColor={colors["background"]}>
  //     <View style={{ marginBottom: 99 }}>
  //       {/* <OWSubTitleHeader title="Send" /> */}
  //       <OWBox>
  //         <CurrencySelector
  //           label="Select a token"
  //           placeHolder="Select Token"
  //           amountConfig={sendConfigs.amountConfig}
  //           labelStyle={styles.sendlabelInput}
  //           containerStyle={styles.containerStyle}
  //           selectorContainerStyle={{
  //             backgroundColor: colors["background-box"]
  //           }}
  //         />
  //         <AddressInput
  //           placeholder="Enter receiving address"
  //           label="Send to"
  //           recipientConfig={sendConfigs.recipientConfig}
  //           memoConfig={sendConfigs.memoConfig}
  //           labelStyle={styles.sendlabelInput}
  //           inputContainerStyle={{
  //             backgroundColor: colors["background-box"]
  //           }}
  //         />
  //         <AmountInput
  //           placeholder="ex. 1000 BTC"
  //           label="Amount"
  //           allowMax={true}
  //           amountConfig={sendConfigs.amountConfig}
  //           labelStyle={styles.sendlabelInput}
  //           inputContainerStyle={{
  //             backgroundColor: colors["background-box"]
  //           }}
  //         />

  //         <MemoInput
  //           label="Message (Optional)"
  //           placeholder="Type your message here"
  //           inputContainerStyle={{
  //             backgroundColor: colors["background-box"]
  //           }}
  //           memoConfig={sendConfigs.memoConfig}
  //           labelStyle={styles.sendlabelInput}
  //         />
  //         {/* <View style={styles.containerToggle}>
  //           <Toggle
  //             on={customFee}
  //             onChange={(value) => {
  //               setCustomFee(value);
  //               if (!value) {
  //                 if (
  //                   sendConfigs.feeConfig.feeCurrency &&
  //                   !sendConfigs.feeConfig.fee
  //                 ) {
  //                   sendConfigs.feeConfig.setFeeType('average');
  //                 }
  //               }
  //             }}
  //           />
  //           <Text style={styles.txtFee}>Custom Fee</Text>
  //         </View>
  //          */}
  //         <FeeButtons
  //           label="Transaction Fee"
  //           gasLabel="gas"
  //           feeConfig={sendConfigs.feeConfig}
  //           gasConfig={sendConfigs.gasConfig}
  //           labelStyle={styles.sendlabelInput}
  //         />

  //         {/* <TextInput
  //           label="Fee"
  //           inputContainerStyle={{
  //             backgroundColor: colors['background-box']
  //           }}
  //           placeholder="Type your Fee here"
  //           keyboardType={'numeric'}
  //           labelStyle={styles.sendlabelInput}
  //           editable={false}
  //           selectTextOnFocus={false}
  //           value={totalFee.feeDisplay || '0'}
  //         /> */}
  //         <OWButton disabled={!account.isReadyToSendMsgs || !txStateIsValid} label="Send" onPress={onSend} />
  //       </OWBox>
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
