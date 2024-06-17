import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  InvalidTronAddressError,
  NotLoadedFeeError,
  useGetFeeTron,
  useSendTxConfig,
  useSendTxTronConfig,
} from "@owallet/hooks";
import { useStore } from "../../stores";
import { EthereumEndpoint, toAmount } from "@owallet/common";
import {
  InteractionManager,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import {
  AddressInput,
  CurrencySelector,
  getFeeErrorText,
  MemoInput,
  TextInput,
} from "../../components/input";
import { OWButton } from "../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../navigation.provider";
import { Buffer } from "buffer";
import { metrics, spacing } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import {
  capitalizedText,
  handleSaveHistory,
  HISTORY_STATUS,
} from "@src/utils/helper";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { PageHeader } from "@src/components/header/header-new";
import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { NewAmountInput } from "@src/components/input/amount-input";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { DownArrowIcon } from "@src/components/icon";
import { FeeModal } from "@src/modals/fee";
import { ChainIdEnum } from "@oraichain/oraidex-common";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { Text } from "@src/components/text";

export const SendTronScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    keyRingStore,
    modalStore,
    universalSwapStore,
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

  const { chainId } = chainStore.current;

  const account = accountStore.getAccount(chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const queries = queriesStore.get(chainId);
  const addressToFetch = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const sendConfigs = useSendTxTronConfig(
    chainStore,
    chainId,
    //@ts-ignore
    account.msgOpts.send,
    account.evmosHexAddress,
    queriesStore.get(chainId).queryBalances,
    EthereumEndpoint
  );

  const [balance, setBalance] = useState<CoinPretty>(null);

  // useEffect(() => {
  //   if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
  //     sendConfigs.feeConfig.setFeeType("average");
  //   }
  //   return;
  // }, [sendConfigs.feeConfig]);
  const checkSendMySelft =
    sendConfigs.recipientConfig.recipient?.trim() === address
      ? new InvalidTronAddressError("Cannot transfer TRX to the same account")
      : null;
  const isReadyBalance = queries.queryBalances
    .getQueryBech32Address(addressToFetch)
    .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency).isReady;
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (isReadyBalance) {
        const balance = queries.queryBalances
          .getQueryBech32Address(addressToFetch)
          .getBalanceFromCurrency(sendConfigs.amountConfig.sendCurrency);
        setBalance(balance);
      }
    });
  }, [isReadyBalance, addressToFetch, sendConfigs.amountConfig.sendCurrency]);

  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => {
          if (
            cur?.coinMinimalDenom
              ?.toLowerCase()
              //@ts-ignore
              ?.includes(route?.params?.contractAddress?.toLowerCase())
          )
            return true;
          if (
            cur.coinDenom?.toLowerCase() ===
            route.params.currency?.toLowerCase()
          ) {
            return true;
          }

          if (
            cur?.coinGeckoId
              ?.toLowerCase()
              //@ts-ignore
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

  const amount = new CoinPretty(
    sendConfigs.amountConfig.sendCurrency,
    new Dec(sendConfigs.amountConfig.getAmountPrimitive().amount)
  );
  const { feeTrx } = useGetFeeTron(
    address,
    sendConfigs.amountConfig,
    sendConfigs.recipientConfig,
    queries.tron,
    chainStore.current,
    keyRingStore,
    null
  );
  useEffect(() => {
    sendConfigs.feeConfig.setManualFee(feeTrx);
    return () => {
      sendConfigs.feeConfig.setManualFee(null);
    };
  }, [feeTrx]);
  const sendConfigError =
    checkSendMySelft ??
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
  const error = sendConfigs.feeConfig.getError();
  const errorText: string | undefined = (() => {
    if (error) {
      if (error.constructor === NotLoadedFeeError) {
        return;
      }

      return getFeeErrorText(error);
    }
  })();
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Send"
          size="large"
          loading={account.isSendingMsg === "send"}
          disabled={!account.isReadyToSendMsgs || !txStateIsValid}
          onPress={async () => {
            try {
              await account.sendTronToken(
                sendConfigs.amountConfig.amount,
                sendConfigs.amountConfig.sendCurrency!,
                sendConfigs.recipientConfig.recipient,
                address,
                {
                  onFulfill: async (tx) => {
                    console.log(tx, "txHashtxHash");
                    if (tx?.code === 0) {
                      navigate("Others", {
                        screen: SCREENS.TxSuccessResult,
                        params: {
                          txHash: tx.txid,
                          data: {
                            memo: sendConfigs.memoConfig.memo,
                            toAddress: sendConfigs.recipientConfig.recipient,
                            amount:
                              sendConfigs.amountConfig.getAmountPrimitive(),
                            fromAddress: address,
                            fee: sendConfigs.feeConfig.toStdFee(),
                            currency: sendConfigs.amountConfig.sendCurrency,
                          },
                        },
                      });
                    } else {
                      navigate("Others", {
                        screen: SCREENS.TxFailedResult,
                        params: {
                          txHash: tx.txid,
                          data: {
                            memo: sendConfigs.memoConfig.memo,
                            from: address,
                            to: sendConfigs.recipientConfig.recipient,
                            amount:
                              sendConfigs.amountConfig.getAmountPrimitive(),
                            fee: sendConfigs.feeConfig.toStdFee(),
                            currency: sendConfigs.amountConfig.sendCurrency,
                          },
                        },
                      });
                    }

                    universalSwapStore.updateTokenReload([
                      {
                        ...sendConfigs.amountConfig.sendCurrency,
                        chainId: chainStore.current.chainId,
                        networkType: "evm",
                      },
                    ]);
                  },
                }
              );
            } catch (err) {
              console.log("send tron err", err);
              if (err?.message === "Request rejected") {
                return;
              }
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
          <OWCard style={{ paddingTop: 22 }} type="normal">
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
                style={{ flexDirection: "row", alignItems: "center" }}
                disabled={true}
              >
                <OWText
                  color={colors["primary-text-action"]}
                  weight="600"
                  size={16}
                >
                  {sendConfigs.feeConfig.fee?.trim(true)?.toString()}
                </OWText>
                <OWText color={colors["neutral-text-body"]}>
                  {"~"}
                  {priceStore
                    .calculatePrice(sendConfigs.feeConfig.fee)
                    ?.toString()}{" "}
                </OWText>
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
            {errorText && (
              <View>
                <OWText color={colors["error-text-body"]}>{errorText}</OWText>
              </View>
            )}
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
  });
