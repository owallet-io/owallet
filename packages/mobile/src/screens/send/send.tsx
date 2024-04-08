import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  EmptyAmountError,
  useSendTxConfig,
} from "@owallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint, toAmount } from "@owallet/common";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  InteractionManager,
} from "react-native";
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
import { CoinPretty, Dec, Int } from "@owallet/unit";
import { DownArrowIcon } from "@src/components/icon";
import {
  capitalizedText,
  handleSaveHistory,
  HISTORY_STATUS,
} from "@src/utils/helper";
import { Buffer } from "buffer";
import { ChainIdEnum } from "@oraichain/oraidex-common";

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

export const NewSendScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    keyRingStore,
    modalStore,
    priceStore,
    universalSwapStore,
  } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const [balance, setBalance] = useState<CoinPretty>(null);
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

  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
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
  );

  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => {
          if (
            cur?.coinMinimalDenom
              ?.toLowerCase()
              ?.includes(route?.params?.contractAddress?.toLowerCase())
          )
            return true;
          if (
            cur.coinDenom?.toLowerCase() ===
            route.params.currency?.toLowerCase()
          ) {
            return true;
          }
          //@ts-ignore
          if (
            cur?.coinGeckoId
              ?.toLowerCase()
              ?.includes(route?.params?.coinGeckoId?.toLowerCase())
          )
            return true;
          return (
            cur.coinMinimalDenom?.toLowerCase() ==
            route.params.currency?.toLowerCase()
          );
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
    new Dec(sendConfigs.amountConfig.getAmountPrimitive().amount)
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
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  const _onPressFee = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(
      <FeeModal vertical={true} sendConfigs={sendConfigs} colors={colors} />
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

  const submitSend = async () => {
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

              const historyInfos = {
                fromAddress: address,
                toAddress: sendConfigs.recipientConfig.recipient,
                hash: Buffer.from(txHash).toString("hex"),
                memo: "",
                fromAmount: sendConfigs.amountConfig.amount,
                toAmount: sendConfigs.amountConfig.amount,
                value: sendConfigs.amountConfig.amount,
                fee: sendConfigs.feeConfig.fee
                  ?.trim(true)
                  ?.hideDenom(true)
                  ?.toString(),
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
              universalSwapStore.updateTokenReload([
                {
                  ...sendConfigs.amountConfig.sendCurrency,
                  chainId: chainStore.current.chainId,
                  networkType: "cosmos",
                },
              ]);
              await handleSaveHistory(accountOrai.bech32Address, historyInfos);
              smartNavigation.pushSmart("TxPendingResult", {
                txHash: Buffer.from(txHash).toString("hex"),
                data: {
                  memo: sendConfigs.memoConfig.memo,
                  from: address,
                  type: "send",
                  to: sendConfigs.recipientConfig.recipient,
                  amount: sendConfigs.amountConfig.getAmountPrimitive(),
                  fee: sendConfigs.feeConfig.toStdFee(),
                  currency: sendConfigs.amountConfig.sendCurrency,
                },
              });
            },
          }
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

  const isReadyBalance = queries.queryBalances
    .getQueryBech32Address(address)
    .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency).isReady;
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (isReadyBalance && sendConfigs.amountConfig.sendCurrency && address) {
        const balance = queries.queryBalances
          .getQueryBech32Address(address)
          .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency);
        setBalance(balance);
      }
    });
  }, [isReadyBalance, address, sendConfigs.amountConfig.sendCurrency]);
  const estimatePrice = priceStore.calculatePrice(amount)?.toString();
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send"
          disabled={!account.isReadyToSendMsgs || !txStateIsValid}
          loading={account.isSendingMsg === "send"}
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
                  Balance :{" "}
                  {balance
                    ?.trim(true)
                    ?.maxDecimals(6)
                    ?.hideDenom(true)
                    ?.toString() || "0"}
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
                {estimatePrice}
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
                  {capitalizedText(sendConfigs.feeConfig.feeType)}:{" "}
                  {priceStore
                    .calculatePrice(sendConfigs.feeConfig.fee)
                    ?.toString()}{" "}
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
