import { EthereumEndpoint, toAmount } from "@owallet/common";
import { useDelegateTxConfig } from "@owallet/hooks";
import { BondStatus } from "@owallet/stores";
import { RouteProp, useRoute } from "@react-navigation/native";
import OWCard from "@src/components/card/ow-card";
import { PageHeader } from "@src/components/header/header-new";
import { AlertIcon, DownArrowIcon } from "@src/components/icon";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWText from "@src/components/text/ow-text";
import { ValidatorThumbnail } from "@src/components/thumbnail";
import { useTheme } from "@src/themes/theme-provider";
import {
  capitalizedText,
  handleSaveHistory,
  HISTORY_STATUS,
  showToast,
} from "@src/utils/helper";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  InteractionManager,
} from "react-native";
import { OWButton } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation.provider";
import { useStore } from "../../../stores";
import { metrics, spacing, typography } from "../../../themes";
import { chainIcons } from "@oraichain/oraidex-common";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { NewAmountInput } from "@src/components/input/amount-input";
import { FeeModal } from "@src/modals/fee";
import { CoinPretty, Int } from "@owallet/unit";

export const DelegateScreen: FunctionComponent = observer(() => {
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
    accountStore,
    queriesStore,
    analyticsStore,
    priceStore,
    modalStore,
  } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);

  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    chainStore.current.chainId,
    account.msgOpts["delegate"].gas,
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (sendConfigs.feeConfig.feeCurrency && !sendConfigs.feeConfig.fee) {
      sendConfigs.feeConfig.setFeeType("average");
    }
    return;
  }, [sendConfigs.feeConfig]);

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
    InteractionManager.runAfterInteractions(() => {
      fetchBalance();
    });
  }, [account.bech32Address, sendConfigs.amountConfig.sendCurrency]);

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

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  const validator = bondedValidators.getValidator(validatorAddress);

  const thumbnail = bondedValidators.getValidatorThumbnail(validatorAddress);

  const chainIcon = chainIcons.find(
    (c) => c.chainId === chainStore.current.chainId
  );
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

  // const staked = queries.cosmos.queryDelegations
  //   .getQueryBech32Address(account.bech32Address)
  //   .getDelegationTo(validatorAddress);

  // const _onOpenStakeModal = () => {
  //   modalStore.setOpen();
  //   modalStore.setChildren(
  //     StakeAdvanceModal({
  //       config: sendConfigs
  //     })
  //   );
  // };

  const amount = new CoinPretty(
    sendConfigs.amountConfig.sendCurrency,
    new Int(toAmount(Number(sendConfigs.amountConfig.amount)))
  );

  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Stake"
          disabled={!account.isReadyToSendMsgs || !txStateIsValid}
          loading={account.isSendingMsg === "delegate"}
          onPress={async () => {
            if (account.isReadyToSendMsgs && txStateIsValid) {
              try {
                await account.cosmos.sendDelegateMsg(
                  sendConfigs.amountConfig.amount,
                  sendConfigs.recipientConfig.recipient,
                  sendConfigs.memoConfig.memo,
                  sendConfigs.feeConfig.toStdFee(),
                  {
                    preferNoSetMemo: true,
                    preferNoSetFee: true,
                  },
                  {
                    onBroadcasted: (txHash) => {
                      analyticsStore.logEvent("Delegate tx broadcasted", {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        validatorName: validator?.description.moniker ?? "...",
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
                        type: HISTORY_STATUS.STAKE,
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
          title="Stake"
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
                <ValidatorThumbnail size={20} url={thumbnail} />
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
                  <OWText style={{ paddingTop: 8 }}>Balance : {balance}</OWText>
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: colors["neutral-surface-action3"],
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      maxWidth: metrics.screenWidth / 4.5,
                      marginTop: 12,
                      alignItems: "center",
                    }}
                  >
                    {chainIcon ? (
                      <OWIcon
                        type="images"
                        source={{ uri: chainIcon?.Icon }}
                        size={16}
                      />
                    ) : (
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 33,
                          alignItems: "center",
                          backgroundColor: colors["primary-surface-default"],
                          justifyContent: "center",
                        }}
                      >
                        <OWText
                          weight="400"
                          color={colors["neutral-text-action-on-dark-bg"]}
                        >
                          {chainStore.current.stakeCurrency.coinDenom.charAt(0)}
                        </OWText>
                      </View>
                    )}

                    <OWText style={{ paddingLeft: 4 }} weight="600" size={14}>
                      {chainStore.current.stakeCurrency.coinDenom}
                    </OWText>
                  </View>
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
                      marginBottom: 8,
                    }}
                    amountConfig={sendConfigs.amountConfig}
                    maxBalance={balance.split(" ")[0]}
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
            </OWCard>
          </View>
        ) : null}
      </ScrollView>
    </PageWithBottom>
  );

  // return (
  //   <PageWithScrollView backgroundColor={colors["background"]}>
  //     <OWSubTitleHeader title="Staking" />
  //     <OWBox
  //       style={{
  //         marginBottom: 24
  //       }}
  //     >
  //       <AmountInput label={"Amount"} amountConfig={sendConfigs.amountConfig} />
  //       <MemoInput label={"Memo (Optional)"} memoConfig={sendConfigs.memoConfig} />

  //       {/* Need to some custom fee here */}

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
  //           labelStyle={styles.sendlabelInput}
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

  //       {/* <TouchableOpacity
  //         style={{
  //           flexDirection: 'row',
  //           alignItems: 'center'
  //         }}
  //         onPress={_onOpenStakeModal}
  //       >
  //         <Text
  //           style={{
  //             ...typography.h7,
  //             color: colors['primary-surface-default'],
  //             marginRight: 4
  //           }}
  //         >{`Advance options`}</Text>
  //         <DownArrowIcon color={colors['primary-surface-default']} height={10} />
  //       </TouchableOpacity> */}

  //       <View
  //         style={{
  //           flexDirection: "row",
  //           justifyContent: "space-between",
  //           marginTop: spacing["16"],
  //           paddingTop: spacing["4"]
  //         }}
  //       >
  //         <View>
  //           <Text
  //             style={{
  //               ...styles.textNormal,
  //               marginBottom: spacing["4"],
  //               color: colors["sub-primary-text"]
  //             }}
  //           >{`Gas limit`}</Text>
  //           {/* Gas limit now fixed at 0.00004 ORAI for every transactions */}
  //           <Text
  //             style={{
  //               ...styles.textNormal,
  //               color: colors["sub-primary-text"]
  //             }}
  //           >{`200000`}</Text>
  //         </View>
  //         <View />
  //       </View>
  //       <OWButton
  //         style={{
  //           marginTop: 20
  //         }}
  //         label="Stake"
  //         fullWidth={false}
  //         disabled={!account.isReadyToSendMsgs || !txStateIsValid}
  //         loading={account.isSendingMsg === "delegate"}
  //         onPress={async () => {
  //           if (account.isReadyToSendMsgs && txStateIsValid) {
  //             try {
  //               await account.cosmos.sendDelegateMsg(
  //                 sendConfigs.amountConfig.amount,
  //                 sendConfigs.recipientConfig.recipient,
  //                 sendConfigs.memoConfig.memo,
  //                 sendConfigs.feeConfig.toStdFee(),
  //                 {
  //                   preferNoSetMemo: true,
  //                   preferNoSetFee: true
  //                 },
  //                 {
  //                   onBroadcasted: txHash => {
  //                     analyticsStore.logEvent("Delegate tx broadcasted", {
  //                       chainId: chainStore.current.chainId,
  //                       chainName: chainStore.current.chainName,
  //                       validatorName: validator?.description.moniker ?? "...",
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
  //                       type: HISTORY_STATUS.STAKE,
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
  //               console.log(e);
  //               smartNavigation.navigate("Home", {});
  //             }
  //           }
  //         }}
  //       />
  //     </OWBox>
  //   </PageWithScrollView>
  // );
});

const styling = (colors) =>
  StyleSheet.create({
    page: {
      padding: spacing["page"],
    },
    containerStaking: {
      borderRadius: spacing["24"],
      backgroundColor: colors["primary"],
      marginBottom: spacing["24"],
    },
    containerBtn: {
      backgroundColor: colors["primary-surface-default"],
      marginLeft: spacing["24"],
      marginRight: spacing["24"],
      borderRadius: spacing["8"],
      marginTop: spacing["20"],
      paddingVertical: spacing["16"],
    },
    textBtn: {
      ...typography.h6,
      color: colors["white"],
      fontWeight: "700",
    },
    sendlabelInput: {
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 22,
      color: colors["gray-900"],
      marginBottom: spacing["8"],
    },
    textNormal: {
      ...typography.h7,
      color: colors["gray-600"],
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
