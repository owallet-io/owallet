import { toAmount, ValidatorThumbnails } from "@owallet/common";
import { useUndelegateTxConfig } from "@owallet/hooks";
import { BondStatus } from "@owallet/stores";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import OWCard from "@src/components/card/ow-card";
import { PageHeader } from "@src/components/header/header-new";
import { AlertIcon, DownArrowIcon } from "@src/components/icon";
import { NewAmountInput } from "@src/components/input/amount-input";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import { Text } from "@src/components/text";
import OWText from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import {
  capitalizedText,
  handleSaveHistory,
  HISTORY_STATUS,
  showToast,
} from "@src/utils/helper";
import { Buffer } from "buffer";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { OWButton } from "../../../components/button";
import {
  AmountInput,
  FeeButtons,
  MemoInput,
  TextInput,
} from "../../../components/input";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useSmartNavigation } from "../../../navigation.provider";
import { useStore } from "../../../stores";
import { metrics, spacing } from "../../../themes";
import { chainIcons } from "@oraichain/oraidex-common";
import { FeeModal } from "@src/modals/fee";

export const UndelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;

  const {
    chainStore,
    modalStore,
    accountStore,
    queriesStore,
    analyticsStore,
    priceStore,
  } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const smartNavigation = useSmartNavigation();
  const [customFee, setCustomFee] = useState(false);

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const validator =
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const validatorThumbnail = validator
    ? queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Bonded)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Unbonding)
        .getValidatorThumbnail(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(BondStatus.Unbonded)
        .getValidatorThumbnail(validatorAddress) ||
      ValidatorThumbnails[validatorAddress]
    : undefined;

  const chainIcon = chainIcons.find(
    (c) => c.chainId === chainStore.current.chainId
  );

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts["undelegate"].gas,
    account.bech32Address,
    queries.queryBalances,
    queries.cosmos.queryDelegations,
    validatorAddress
  );
  const amount = new CoinPretty(
    chainStore.current.feeCurrencies[0],
    new Int(toAmount(Number(sendConfigs.amountConfig.amount)))
  );
  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType("average");
    }
    return;
  }, [sendConfigs.feeConfig]);
  const isDisable = !account.isReadyToSendMsgs || !txStateIsValid;
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
          type="danger"
          label="Unstake"
          disabled={isDisable}
          loading={account.isSendingMsg === "undelegate"}
          onPress={async () => {
            if (account.isReadyToSendMsgs && txStateIsValid) {
              try {
                await account.cosmos.sendUndelegateMsg(
                  sendConfigs.amountConfig.amount,
                  sendConfigs.recipientConfig.recipient,
                  sendConfigs.memoConfig.memo,
                  sendConfigs.feeConfig.toStdFee(),
                  {
                    preferNoSetMemo: true,
                    preferNoSetFee: true,
                  },
                  {
                    onFulfill: (tx) => {
                      console.log(
                        tx,
                        "TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!"
                      );
                    },
                    onBroadcasted: (txHash) => {
                      analyticsStore.logEvent("Undelegate tx broadcasted", {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        validatorName: validator?.description.moniker,
                        feeType: sendConfigs.feeConfig.feeType,
                      });
                      smartNavigation.pushSmart("TxPendingResult", {
                        txHash: Buffer.from(txHash).toString("hex"),
                        data: {
                          wallet: account.bech32Address,
                          validator: sendConfigs.recipientConfig.recipient,
                          amount: sendConfigs.amountConfig.getAmountPrimitive(),
                          fee: sendConfigs.feeConfig.toStdFee(),
                          currency: sendConfigs.amountConfig.sendCurrency,
                        },
                      });
                      const historyInfos = {
                        fromAddress: account.bech32Address,
                        toAddress: sendConfigs.recipientConfig.recipient,
                        hash: Buffer.from(txHash).toString("hex"),
                        memo: "",
                        fromAmount: sendConfigs.amountConfig.amount,
                        toAmount: sendConfigs.amountConfig.amount,
                        value: sendConfigs.amountConfig.amount,
                        fee: sendConfigs.feeConfig.toStdFee(),
                        type: HISTORY_STATUS.UNSTAKE,
                        fromToken: {
                          asset:
                            sendConfigs.amountConfig.sendCurrency.coinDenom,
                          chainId: chainStore.current.chainId,
                        },
                        toToken: {
                          asset:
                            sendConfigs.amountConfig.sendCurrency.coinDenom,
                          chainId: chainStore.current.chainId,
                        },
                        status: "SUCCESS",
                      };

                      handleSaveHistory(account.bech32Address, historyInfos);
                    },
                  }
                );
              } catch (e) {
                if (e?.message.toLowerCase().includes("rejected")) {
                  return;
                } else if (
                  e?.message.includes("Cannot read properties of undefined")
                ) {
                  return;
                } else {
                  console.log(e);
                  // smartNavigation.navigate("Home", {});
                  showToast({
                    message: JSON.stringify(e),
                    type: "danger",
                  });
                }
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
          }}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Unstake"
          subtitle={"Oraichain"}
          colors={colors}
          onPress={async () => {}}
        />
        {validator ? (
          <View>
            <OWCard>
              <OWText
                style={{ paddingBottom: 8 }}
                color={colors["neutral-text-title"]}
              >
                Validator
              </OWText>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <ValidatorThumbnail size={20} url={validatorThumbnail} />
                <OWText
                  style={{ paddingLeft: 8 }}
                  color={colors["neutral-text-title"]}
                  weight="500"
                >
                  {validator?.description.moniker}
                </OWText>
              </View>
            </OWCard>
            <OWCard style={{ paddingTop: 22 }} type="normal">
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{}}>
                  <OWText style={{ paddingTop: 8 }}>
                    Staked :{" "}
                    {staked.trim(true).shrink(true).maxDecimals(6).toString()}
                  </OWText>
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: colors["neutral-surface-action3"],
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      maxWidth: metrics.screenWidth / 4.5,
                      marginTop: 12,
                    }}
                  >
                    <OWIcon
                      type="images"
                      source={{ uri: chainIcon?.Icon }}
                      size={16}
                    />
                    <OWText style={{ paddingLeft: 4 }} weight="600" size={14}>
                      ORAI
                    </OWText>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: "flex-end",
                    marginBottom: -12,
                  }}
                >
                  <NewAmountInput
                    colors={colors}
                    inputContainerStyle={{
                      borderWidth: 0,
                      width: metrics.screenWidth / 2,
                      marginBottom: 8,
                    }}
                    amountConfig={sendConfigs.amountConfig}
                    maxBalance={
                      staked
                        .trim(true)
                        .shrink(true)
                        .maxDecimals(6)
                        .toString()
                        .split(" ")[0]
                    }
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
              <View
                style={{
                  flexDirection: "row",
                  borderRadius: 12,
                  backgroundColor: colors["warning-surface-subtle"],
                  padding: 12,
                  marginTop: 8,
                }}
              >
                <AlertIcon color={colors["warning-text-body"]} size={16} />
                <OWText style={{ paddingLeft: 8 }} weight="600" size={14}>
                  {`When you unstake, a 14-day cooldown period is required before your stake \nreturns to your wallet.`}
                </OWText>
              </View>
            </OWCard>
            <OWCard>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderBottomColor: colors["neutral-border-default"],
                  borderBottomWidth: 1,
                  paddingVertical: 16,
                }}
              >
                <OWText color={colors["neutral-text-title"]} weight="600">
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
              {/*<FeeButtons*/}
              {/*  label=""*/}
              {/*  gasLabel="gas"*/}
              {/*  feeConfig={sendConfigs.feeConfig}*/}
              {/*  gasConfig={sendConfigs.gasConfig}*/}
              {/*/>*/}
            </OWCard>
          </View>
        ) : null}
      </ScrollView>
    </PageWithBottom>
  );

  // return (
  //   <PageWithScrollView
  //     // style={}
  //     contentContainerStyle={style.get("flex-grow-1")}
  //     backgroundColor={colors["background"]}
  //   >
  //     <View style={style.flatten(["height-page-pad"])} />
  //     <View
  //       style={{
  //         marginBottom: spacing["12"],
  //         borderRadius: spacing["8"],
  //         backgroundColor: colors["primary"],
  //         marginHorizontal: spacing["page"]
  //       }}
  //     >
  //       <CardBody>
  //         <View style={style.flatten(["flex-row", "items-center"])}>
  //           <ValidatorThumbnail
  //             style={{
  //               marginRight: spacing["8"],
  //               backgroundColor: colors["border"]
  //             }}
  //             size={36}
  //             url={validatorThumbnail}
  //           />
  //           <Text style={[style.flatten(["h6", "color-text-black-high"]), { color: colors["primary-text"] }]}>
  //             {validator ? validator?.description.moniker : "..."}
  //           </Text>
  //         </View>
  //         <CardDivider style={style.flatten(["margin-x-0", "margin-top-8", "margin-bottom-15"])} />
  //         <View style={style.flatten(["flex-row", "items-center"])}>
  //           <Text
  //             style={[style.flatten(["subtitle2", "color-text-black-medium"]), { color: colors["sub-primary-text"] }]}
  //           >
  //             Staked
  //           </Text>
  //           <View style={style.get("flex-1")} />
  //           <Text style={[style.flatten(["body2", "color-text-black-medium"]), { color: colors["sub-primary-text"] }]}>
  //             {staked.trim(true).shrink(true).maxDecimals(6).toString()}
  //           </Text>
  //         </View>
  //       </CardBody>
  //     </View>
  //     {/*
  //       // The recipient validator is selected by the route params, so no need to show the address input.
  //       <AddressInput
  //         label="Recipient"
  //         recipientConfig={sendConfigs.recipientConfig}
  //       />
  //     */}
  //     {/*
  //     Undelegate tx only can be sent with just stake currency. So, it is not needed to show the currency selector because the stake currency is one.
  //     <CurrencySelector
  //       label="Token"
  //       placeHolder="Select Token"
  //       amountConfig={sendConfigs.amountConfig}
  //     />
  //     */}
  //     <OWBox>
  //       <AmountInput label="Amount" amountConfig={sendConfigs.amountConfig} />
  //       <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
  //       <View
  //         style={{
  //           flexDirection: "row",
  //           paddingBottom: 24,
  //           alignItems: "center"
  //         }}
  //       >
  //         <Toggle
  //           on={customFee}
  //           onChange={value => {
  //             setCustomFee(value);
  //             if (!value) {
  //               if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
  //                 sendConfigs.feeConfig.setFeeType("average");
  //               }
  //             }
  //           }}
  //         />
  //         <Text
  //           style={{
  //             fontWeight: "700",
  //             fontSize: 16,
  //             lineHeight: 34,
  //             paddingHorizontal: 8,
  //             color: colors["primary-text"]
  //           }}
  //         >
  //           Custom Fee
  //         </Text>
  //       </View>
  //       {customFee && chainStore.current.networkType !== "evm" ? (
  //         <TextInput
  //           label="Fee"
  //           placeholder="Type your Fee here"
  //           keyboardType={"numeric"}
  //           labelStyle={{
  //             fontSize: 16,
  //             fontWeight: "700",
  //             lineHeight: 22,
  //             color: colors["gray-900"],
  //             marginBottom: spacing["8"]
  //           }}
  //           onChangeText={text => {
  //             const fee = new Dec(Number(text.replace(/,/g, "."))).mul(DecUtils.getTenExponentNInPrecisionRange(6));

  //             sendConfigs.feeConfig.setManualFee({
  //               amount: fee.roundUp().toString(),
  //               denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom
  //             });
  //           }}
  //         />
  //       ) : chainStore.current.networkType !== "evm" ? (
  //         <FeeButtons label="Fee" gasLabel="gas" feeConfig={sendConfigs.feeConfig} gasConfig={sendConfigs.gasConfig} />
  //       ) : null}

  //       <OWButton
  //         label="Unstake"
  // disabled={isDisable}
  // loading={account.isSendingMsg === "undelegate"}
  //         onPress={async () => {
  //           if (account.isReadyToSendMsgs && txStateIsValid) {
  //             try {
  //               await account.cosmos.sendUndelegateMsg(
  //                 sendConfigs.amountConfig.amount,
  //                 sendConfigs.recipientConfig.recipient,
  //                 sendConfigs.memoConfig.memo,
  //                 sendConfigs.feeConfig.toStdFee(),
  //                 {
  //                   preferNoSetMemo: true,
  //                   preferNoSetFee: true
  //                 },
  //                 {
  //                   onFulfill: tx => {
  //                     console.log(tx, "TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!");
  //                   },
  //                   onBroadcasted: txHash => {
  //                     analyticsStore.logEvent("Undelegate tx broadcasted", {
  //                       chainId: chainStore.current.chainId,
  //                       chainName: chainStore.current.chainName,
  //                       validatorName: validator?.description.moniker,
  //                       feeType: sendConfigs.feeConfig.feeType
  //                     });
  //                     smartNavigation.pushSmart("TxPendingResult", {
  //                       txHash: Buffer.from(txHash).toString("hex")
  //                     });
  //                     const historyInfos = {
  //                       fromAddress: account.bech32Address,
  //                       toAddress: sendConfigs.recipientConfig.recipient,
  //                       hash: Buffer.from(txHash).toString("hex"),
  //                       memo: "",
  //                       fromAmount: sendConfigs.amountConfig.amount,
  //                       toAmount: sendConfigs.amountConfig.amount,
  //                       value: sendConfigs.amountConfig.amount,
  //                       fee: sendConfigs.feeConfig.toStdFee(),
  //                       type: HISTORY_STATUS.UNSTAKE,
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

  //                     handleSaveHistory(account.bech32Address, historyInfos);
  //                   }
  //                 }
  //               );
  //             } catch (e) {
  //               if (e?.message === "Request rejected") {
  //                 return;
  //               }
  //               if (e?.message.includes("Cannot read properties of undefined")) {
  //                 return;
  //               }
  //               if (smartNavigation.canGoBack) {
  //                 smartNavigation.goBack();
  //               } else {
  //                 smartNavigation.navigateSmart("Home", {});
  //               }
  //             }
  //           }
  //         }}
  //       />
  //     </OWBox>
  //     <View style={style.flatten(["height-page-pad"])} />
  //   </PageWithScrollView>
  // );
});

const styling = (colors) =>
  StyleSheet.create({
    containerStaking: {
      borderRadius: spacing["24"],
      backgroundColor: colors["primary"],
      marginBottom: spacing["24"],
    },
    listLabel: {
      paddingVertical: 16,
      borderBottomColor: colors["neutral-border-default"],
      borderBottomWidth: 1,
    },
    title: {
      color: colors["neutral-text-body"],
    },
    topSubInfo: {
      backgroundColor: colors["neutral-surface-bg2"],
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 4,
      marginTop: 4,
      marginRight: 8,
      flexDirection: "row",
    },
    bottomBtn: {
      marginTop: 20,
      width: metrics.screenWidth / 2.3,
      borderRadius: 999,
      marginLeft: 12,
    },
    label: {
      fontWeight: "600",
      textAlign: "center",
      marginTop: spacing["6"],
      color: colors["neutral-text-title"],
    },
    percentBtn: {
      backgroundColor: colors["primary-surface-default"],
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 4,
    },
  });
