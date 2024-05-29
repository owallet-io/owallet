import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  EmptyAmountError,
  useSendTxEvmConfig,
} from "@owallet/hooks";
import { useStore } from "../../stores";
import { ChainIdEnum, EthereumEndpoint, toAmount } from "@owallet/common";
import {
  InteractionManager,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { CoinPretty, Dec } from "@owallet/unit";

import {
  AddressInput,
  MemoInput,
  CurrencySelector,
} from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
import { useSmartNavigation } from "../../navigation.provider";
import { Buffer } from "buffer";
import { metrics, spacing } from "../../themes";
import { PageHeader } from "@src/components/header/header-new";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { NewAmountInput } from "@src/components/input/amount-input";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { DownArrowIcon } from "@src/components/icon";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { FeeModal } from "@src/modals/fee";
import {
  capitalizedText,
  handleSaveHistory,
  HISTORY_STATUS,
} from "@src/utils/helper";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";

export const SendEvmScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    universalSwapStore,
    keyRingStore,
    priceStore,
    modalStore,
    appInitStore,
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

  const account = accountStore.getAccount(chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
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
  console.log(gasPrice, chainId, "gasPrice");
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
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
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
  const onSubmit = async () => {
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
            onFulfill: (tx) => {
              console.log(tx, "tx evm");
              if (chainStore.current.chainId === ChainIdEnum.Oasis) {
                navigate("Others", {
                  screen: SCREENS.TxSuccessResult,
                  params: {
                    txHash: tx,
                    data: {
                      memo: sendConfigs.memoConfig.memo,
                      toAddress: sendConfigs.recipientConfig.recipient,
                      amount: sendConfigs.amountConfig.getAmountPrimitive(),
                      fromAddress: address,
                      fee: sendConfigs.feeConfig.toStdFee(),
                      currency: sendConfigs.amountConfig.sendCurrency,
                    },
                  },
                });
              }
            },
            onBroadcasted: async (txHash) => {
              analyticsStore.logEvent("Send token tx broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                feeType: sendConfigs.feeConfig.feeType,
              });
              console.log(txHash, "txHash evm");
              navigate("Others", {
                screen: "TxPendingResult",
                params: {
                  txHash: txHash,
                  data: {
                    memo: sendConfigs.memoConfig.memo,
                    from: address,
                    to: sendConfigs.recipientConfig.recipient,
                    amount: sendConfigs.amountConfig.getAmountPrimitive(),
                    fee: sendConfigs.feeConfig.toStdFee(),
                    currency: sendConfigs.amountConfig.sendCurrency,
                  },
                },
              });
              const fee = sendConfigs.feeConfig.fee
                .trim(true)
                .hideDenom(true)
                .maxDecimals(4)
                .toString();

              const historyInfos = {
                fromAddress: address,
                toAddress: sendConfigs.recipientConfig.recipient,
                hash: txHash,
                memo: "",
                fromAmount: sendConfigs.amountConfig.amount,
                toAmount: sendConfigs.amountConfig.amount,
                value: sendConfigs.amountConfig.amount,
                fee: fee,
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
                  networkType: "evm",
                },
              ]);
              await handleSaveHistory(accountOrai.bech32Address, historyInfos);
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
        console.log(e, "errr");
        if (e?.message === "Request rejected") {
          return;
        }
      }
    }
  };
  const amount = new CoinPretty(
    sendConfigs.amountConfig.sendCurrency,
    new Dec(sendConfigs.amountConfig.getAmountPrimitive().amount)
  );

  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType("average");
    }
    if (appInitStore.getInitApp.feeOption) {
      sendConfigs.feeConfig.setFeeType(appInitStore.getInitApp.feeOption);
    }
    return;
  }, [sendConfigs.feeConfig, appInitStore.getInitApp.feeOption]);

  const isReadyBalance = queries.queryBalances
    .getQueryBech32Address(address)
    .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency).isReady;
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (isReadyBalance) {
        const balance = queries.queryBalances
          .getQueryBech32Address(address)
          .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency);
        setBalance(balance);
      }
    });
  }, [isReadyBalance, address, sendConfigs.amountConfig.sendCurrency]);

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
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send"
          disabled={
            !account.isReadyToSendMsgs ||
            !txStateIsValid ||
            account.isSendingMsg === "send"
          }
          loading={account.isSendingMsg === "send"}
          onPress={onSubmit}
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
              editable={false}
              memoConfig={sendConfigs.memoConfig}
              labelStyle={styles.sendlabelInput}
            />
          </OWCard>
        </View>
      </ScrollView>
    </PageWithBottom>
  );
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
