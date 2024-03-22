import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  EmptyAmountError,
  useSendTxConfig,
} from "@owallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint, toAmount } from "@owallet/common";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import {
  AddressInput,
  CurrencySelector,
  MemoInput,
} from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { metrics, spacing } from "../../themes";
import OWText from "@src/components/text/ow-text";
import OWCard from "@src/components/card/ow-card";
import { PageHeader } from "@src/components/header/header-new";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { NewAmountInput } from "@src/components/input/amount-input";
import { PageWithBottom } from "@src/components/page/page-with-bottom";

import { useSmartNavigation } from "@src/navigation.provider";
import { FeeModal } from "@src/modals/fee";
import { CoinPretty, Int } from "@owallet/unit";
import { DownArrowIcon } from "@src/components/icon";

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
    errorBorder: {
      borderWidth: 2,
      borderColor: colors["error-border-default"],
    },
  });

export const NewSendScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    sendStore,
    keyRingStore,
    modalStore,
    priceStore,
  } = useStore();
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
          contractAddress?: string;
          maxBalance?: Number;
        }
      >,
      string
    >
  >();

  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;
  const maxBalance = route?.params?.maxBalance;

  const smartNavigation = useSmartNavigation();

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
    queries.queryBalances,
    EthereumEndpoint
    // chainStore.current.networkType === "evm" &&
    //   queriesStore.get(chainStore.current.chainId).evm.queryEvmBalance,
    // address
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
  }, [
    account.bech32Address,
    sendConfigs.amountConfig.sendCurrency.coinGeckoId,
  ]);

  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => {
          if (cur?.contractAddress?.includes(route?.params?.contractAddress)) {
            return cur?.contractAddress?.includes(
              route?.params?.contractAddress
            );
          }
          //@ts-ignore

          if (
            cur?.contractAddress?.includes(
              route?.params?.contractAddress?.toLowerCase()
            )
          ) {
            return true;
          }
          if (cur?.coinMinimalDenom) {
            return cur?.coinMinimalDenom.includes(
              route?.params?.contractAddress
            );
          }
          //@ts-ignore
          if (cur?.type === "cw20") {
            return cur.coinDenom == route.params.currency;
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
  }, [
    route?.params?.currency,
    sendConfigs.amountConfig,
    route?.params?.contractAddress,
  ]);

  const amount = new CoinPretty(
    sendConfigs.amountConfig.sendCurrency,
    new Int(toAmount(Number(sendConfigs.amountConfig.amount)))
  );

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
  const recipientError = sendConfigs.recipientConfig.getError();
  const isRecipientError: boolean = useMemo(() => {
    if (recipientError) {
      if (recipientError.constructor == EmptyAddressError) return false;
      return true;
    }
  }, [recipientError]);

  const amountError = sendConfigs.amountConfig.getError();
  const isAmountError: boolean = useMemo(() => {
    if (amountError) {
      if (amountError.constructor == EmptyAmountError) return false;
      return true;
    }
  }, [amountError]);
  console.log(sendConfigs.feeConfig.toStdFee(), "to std fee");
  const submitSend = async () => {
    if (account.isReadyToSendMsgs && txStateIsValid) {
      try {
        if (
          sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.startsWith(
            "erc20"
          )
        ) {
          sendStore.updateSendObject({
            type: "erc20",
            from: account.evmosHexAddress,
            contract_addr:
              sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.split(
                ":"
              )[1],
            recipient: sendConfigs.recipientConfig.recipient,
            amount: sendConfigs.amountConfig.amount,
          });
        }
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
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("Send token tx broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                feeType: sendConfigs.feeConfig.feeType,
              });
              smartNavigation.pushSmart("TxPendingResult", {
                txHash: Buffer.from(txHash).toString("hex"),
                data: {
                  memo: sendConfigs.memoConfig.memo,
                  toAddress: sendConfigs.recipientConfig.recipient,
                  amount: sendConfigs.amountConfig.getAmountPrimitive(),
                  fromAddress: address,
                  fee: sendConfigs.feeConfig.toStdFee(),
                  currency: sendConfigs.amountConfig.sendCurrency,
                },
              });
            },
          },
          // In case send erc20 in evm network
          sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.startsWith(
            "erc20"
          )
            ? {
                type: "erc20",
                from: account.evmosHexAddress,
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

        // if (smartNavigation.canGoBack) {
        //   smartNavigation.goBack();
        // } else {
        //   smartNavigation.navigateSmart("Home", {});
        // }
      }
    }
  };
  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType("average");
    }
    return;
  }, [sendConfigs.feeConfig]);

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send"
          disabled={!account.isReadyToSendMsgs || !txStateIsValid}
          loading={account.isSendingMsg === "delegate"}
          onPress={submitSend}
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32,
            },
          ]}
          textStyle={{
            fontSize: 16,
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <OWCard
            type="normal"
            style={isRecipientError ? styles.errorBorder : null}
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
              inputContainerStyle={{
                backgroundColor: colors["neutral-surface-card"],
                borderWidth: 0,
                paddingHorizontal: 0,
              }}
            />
          </OWCard>
          <OWCard
            style={[{ paddingTop: 22 }, isAmountError && styles.errorBorder]}
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
                  Balance : {maxBalance ?? balance.toString()}
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
                  maxBalance={
                    maxBalance ? maxBalance.toString() : balance.split(" ")[0]
                  }
                  manually={!!maxBalance}
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
              <OWText
                color={colors["neutral-text-title"]}
                weight="600"
                size={16}
              >
                Transaction fee
              </OWText>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={_onPressFee}
              >
                <OWText
                  color={colors["primary-text-action"]}
                  weight="600"
                  size={16}
                >
                  {fee.type}: {fee.value}{" "}
                </OWText>
                <DownArrowIcon
                  height={11}
                  color={colors["primary-text-action"]}
                />
              </TouchableOpacity>
            </View>

            <OWText color={colors["neutral-text-title"]}>Memo</OWText>

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
});
