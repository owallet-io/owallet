import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  InvalidTronAddressError,
  NotLoadedFeeError,
  useSendTronTxConfig,
  useGetFeeTron,
  useTxConfigsValidate,
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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { Buffer } from "buffer";
import { metrics, spacing } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import { PageWithBottom } from "@src/components/page/page-with-bottom";

import OWCard from "@src/components/card/ow-card";
import OWText from "@src/components/text/ow-text";
import { NewAmountInput } from "@src/components/input/amount-input";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { ChainIdEnum } from "@oraichain/oraidex-common";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { tracking } from "@src/utils/tracking";
import { OWHeaderTitle } from "@components/header";
import { FeeControl } from "@src/components/input/fee-control";

export const SendTronScreen: FunctionComponent<{
  chainId: string;
  coinMinimalDenom: string;
  recipientAddress: string;
  setSelectedKey: (key) => void;
}> = observer(
  ({ chainId, coinMinimalDenom, recipientAddress, setSelectedKey }) => {
    const { chainStore, tronAccountStore, queriesStore, keyRingStore } =
      useStore();
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

    const account = tronAccountStore.getAccount(chainId);
    const queries = queriesStore.get(chainId);
    const addressToFetch = account.ethereumHexAddress;
    const sender = account.base58Address;
    const chainInfo = chainStore.getChain(chainId);
    const currency = chainInfo.forceFindCurrency(coinMinimalDenom);

    const sendConfigs = useSendTronTxConfig(
      chainStore,
      queriesStore,
      chainId,
      addressToFetch,
      1
    );
    sendConfigs.amountConfig.setCurrency(currency);

    tracking(`Send Tron Screen`);
    const queryBalances = queriesStore.get(chainId).queryBalances;

    const balance = queries.queryBalances
      .getQueryEthereumHexAddress(addressToFetch)
      .getBalance(sendConfigs.amountConfig.currency);

    useEffect(() => {
      sendConfigs.recipientConfig.setValue(recipientAddress || "");
    }, [recipientAddress, sendConfigs.recipientConfig]);

    console.log(
      "amountConfig 1123",
      sendConfigs.amountConfig,
      sendConfigs.recipientConfig
    );

    const { feeTrx } = useGetFeeTron(
      sender,
      sendConfigs.amountConfig,
      sendConfigs.recipientConfig,
      queries.tron,
      chainInfo,
      keyRingStore.selectedKeyInfo.id,
      keyRingStore,
      null
    );

    console.log("feeTrx", feeTrx);

    useEffect(() => {
      if (feeTrx) {
        sendConfigs.feeConfig.setManualFee([
          {
            amount: feeTrx.amount,
            currency: chainInfo.forceFindCurrency(feeTrx.denom),
          },
        ]);
      }

      return () => {
        sendConfigs.feeConfig.setManualFee(null);
      };
    }, [feeTrx]);

    const checkSendMySelft =
      sendConfigs.recipientConfig.recipient?.trim() === sender
        ? new InvalidTronAddressError("Cannot transfer TRX to the same account")
        : null;

    const isReadyBalance = queryBalances
      .getQueryBech32Address(addressToFetch)
      .getBalanceFromCurrency(sendConfigs.amountConfig.currency).isReady;

    useEffect(() => {
      if (route?.params?.recipient) {
        sendConfigs.recipientConfig.setValue(route.params.recipient);
      }
    }, [route?.params?.recipient, sendConfigs.recipientConfig]);

    // const amount = new CoinPretty(
    //   sendConfigs.amountConfig.currency,
    //   new Dec(sendConfigs.amountConfig.getAmountPrimitive().amount)
    // );

    // const txConfigsValidate = useTxConfigsValidate({
    //   ...sendConfigs
    // });

    const submitSend = async () => {
      // if (!txConfigsValidate.interactionBlocked) {
      try {
        account.setIsSendingTx(true);
        //@ts-ignore
        const contractAddress =
          sendConfigs.amountConfig.currency?.contractAddress;

        const unsignedTx = account.makeSendTokenTx({
          address: sender,
          currency: sendConfigs.amountConfig.amount[0].currency,
          amount: sendConfigs.amountConfig.amount[0]
            .toDec()
            .mul(
              new Dec(
                10 ** sendConfigs.amountConfig.amount[0].currency.coinDecimals
              )
            )
            .round()
            .toString(),
          recipient: sendConfigs.recipientConfig.recipient,
          contractAddress,
        });

        await account.sendTx(unsignedTx, {
          onBroadcasted: (txHash) => {
            account.setIsSendingTx(false);
            navigate(SCREENS.TxPendingResult, {
              chainId,
              txHash,
            });
          },
          onFulfill: (txReceipt) => {
            console.log("txReceipt", txReceipt);

            queryBalances
              .getQueryEthereumHexAddress(sender)
              .balances.forEach((balance) => {
                if (
                  balance.currency.coinMinimalDenom === coinMinimalDenom ||
                  sendConfigs.feeConfig.fees.some(
                    (fee) =>
                      fee.currency.coinMinimalDenom ===
                      balance.currency.coinMinimalDenom
                  )
                ) {
                  balance.fetch();
                }
              });
          },
        });
      } catch (e) {
        console.log(e, "error on send Tron");
        if (e?.message === "Request rejected") {
          return;
        }
      }
    };

    const navigation = useNavigation();
    useEffect(() => {
      navigation.setOptions({
        headerTitle: () => (
          <OWHeaderTitle
            title={"Send"}
            subTitle={chainStore.current?.chainName}
          />
        ),
      });
    }, [chainStore.current?.chainName]);

    return (
      <PageWithBottom
        bottomGroup={
          <OWButton
            label="Send Tron"
            size="large"
            onPress={() => {
              submitSend();
            }}
            // loading={account.isSendingMsg === 'send'}
            // disabled={!account.isReadyToSendMsgs || !txStateIsValid}

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
        <ScrollView
          style={{ height: metrics.screenHeight / 1.4 }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <OWCard
              style={{
                backgroundColor: colors["neutral-surface-card"],
              }}
              type="normal"
            >
              <OWText color={colors["neutral-text-title"]}>Recipient</OWText>

              <AddressInput
                colors={colors}
                placeholder="Enter address"
                label=""
                recipientConfig={sendConfigs.recipientConfig}
                disableAddressError={true}
                memoConfig={null}
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
              style={{
                paddingTop: 22,
                backgroundColor: colors["neutral-surface-card"],
              }}
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
                    {balance?.balance
                      ?.trim(true)
                      ?.maxDecimals(6)
                      ?.hideDenom(true)
                      ?.toString() || "0"}
                  </OWText>
                  <CurrencySelector
                    chainId={chainId}
                    selectedKey={coinMinimalDenom}
                    setSelectedKey={setSelectedKey}
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
                {/* <OWIcon name="tdesign_swap" size={16} /> */}
                <OWText
                  style={{ paddingLeft: 4 }}
                  color={colors["neutral-text-body"]}
                  size={14}
                >
                  {/* {priceStore.calculatePrice(amount).toString()}0 */}
                </OWText>
              </View>
            </OWCard>
            <OWCard
              style={{
                backgroundColor: colors["neutral-surface-card"],
              }}
              type="normal"
            >
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
                    {/* {sendConfigs.feeConfig.fee?.trim(true)?.toString()} */}
                  </OWText>
                  <OWText color={colors["neutral-text-body"]}>
                    {"~"}
                    {/* {priceStore.calculatePrice(sendConfigs.feeConfig.fee)?.toString()}{' '} */}
                  </OWText>
                </TouchableOpacity>
                {/* <FeeControl
                senderConfig={sendConfigs.senderConfig}
                feeConfig={sendConfigs.feeConfig}
                gasConfig={sendConfigs.gasConfig}
                gasSimulator={null}
              /> */}
              </View>

              {/* <OWText color={colors['neutral-text-title']}>Memo</OWText> */}

              {/* <MemoInput
              label=""
              placeholder="Required if send to CEX"
              inputContainerStyle={{
                backgroundColor: colors['neutral-surface-card'],
                borderWidth: 0,
                paddingHorizontal: 0
              }}
              editable={false}
              memoConfig={sendConfigs.memoConfig}
              labelStyle={styles.sendlabelInput}
            /> */}
              {/* {errorText && (
              <View>
                <OWText color={colors['error-text-body']}>{errorText}</OWText>
              </View>
            )} */}
            </OWCard>
          </View>
        </ScrollView>
      </PageWithBottom>
    );
  }
);

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
