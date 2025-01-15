// import React, { FunctionComponent, useEffect, useState } from "react";
// import { registerModal } from "../base";
// import { CardModal } from "../card";
// import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
// import { ScrollView } from "react-native-gesture-handler";
// import { useStyle } from "../../styles";
// import { useStore } from "../../stores";
// import { Button } from "../../components/button";
// import { colors } from "../../themes";
// import { observer } from "mobx-react-lite";
// import { useUnmount } from "../../hooks";
// import { BottomSheetProps } from "@gorhom/bottom-sheet";
// import { showToast } from "@src/utils/helper";
//
// const keyboardVerticalOffset = Platform.OS === "ios" ? 130 : 0;
//
// export const SignOasisModal: FunctionComponent<{
//   isOpen?: boolean;
//   close: () => void;
//   onSuccess: () => void;
//   bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
//   data: object;
// }> = registerModal(
//   observer(({ data, close, onSuccess }) => {
//     const { signInteractionStore } = useStore();
//
//     useUnmount(() => {
//       signInteractionStore.rejectAll();
//     });
//
//     const [dataSign, setDataSign] = useState(null);
//     const [loading, setLoading] = useState(false);
//
//     useEffect(() => {
//       if (data) {
//         setDataSign(data);
//       }
//     }, [data]);
//
//     const style = useStyle();
//
//     const _onPressReject = () => {
//       try {
//         signInteractionStore.rejectAll();
//         close();
//       } catch (error) {
//         console.error(error);
//       }
//     };
//
//     return (
//       <CardModal>
//         <KeyboardAvoidingView
//           behavior="position"
//           keyboardVerticalOffset={keyboardVerticalOffset}
//         >
//           <View style={style.flatten(["margin-bottom-16"])}>
//             <Text style={style.flatten(["margin-bottom-3"])}>
//               <Text
//                 style={style.flatten(["subtitle3", "color-primary"])}
//               >{`1 `}</Text>
//               <Text
//                 style={style.flatten(["subtitle3", "color-text-black-medium"])}
//               >
//                 Message:
//               </Text>
//             </Text>
//             <View
//               style={style.flatten([
//                 "border-radius-8",
//                 "border-width-1",
//                 "border-color-border-white",
//                 "overflow-hidden",
//               ])}
//             >
//               <ScrollView
//                 style={style.flatten(["max-height-214"])}
//                 persistentScrollbar={true}
//               >
//                 <Text
//                   style={{
//                     color: colors["sub-text"],
//                   }}
//                 >
//                   {JSON.stringify(dataSign, null, 2)}
//                 </Text>
//               </ScrollView>
//             </View>
//           </View>
//
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-evenly",
//             }}
//           >
//             <Button
//               text="Reject"
//               size="large"
//               containerStyle={{
//                 width: "40%",
//               }}
//               style={{
//                 backgroundColor: colors["red-500"],
//               }}
//               textStyle={{
//                 color: colors["white"],
//               }}
//               underlayColor={colors["danger-400"]}
//               loading={signInteractionStore.isLoading || loading}
//               disabled={signInteractionStore.isLoading || loading}
//               onPress={_onPressReject}
//             />
//             <Button
//               text="Approve"
//               size="large"
//               disabled={signInteractionStore.isLoading || loading}
//               containerStyle={{
//                 width: "40%",
//               }}
//               textStyle={{
//                 color: colors["white"],
//               }}
//               style={{
//                 backgroundColor: signInteractionStore.isLoading
//                   ? colors["primary-surface-disable"]
//                   : colors["primary-surface-default"],
//               }}
//               loading={signInteractionStore.isLoading || loading}
//               onPress={async () => {
//                 setLoading(true);
//                 try {
//                   if (dataSign.amount < 0.1) {
//                     showToast({
//                       message: "Minimum amount should be higher than 0.1!",
//                       type: "danger",
//                     });
//                     return;
//                   }
//                   if (
//                     dataSign.maxAmount &&
//                     Number(dataSign.amount) > Number(dataSign.maxAmount)
//                   ) {
//                     showToast({
//                       message: `Too large amount!`,
//                       type: "danger",
//                     });
//                     return;
//                   }
//                   //@ts-ignore
//                   await window.oasis.signOasis(
//                     dataSign.amount,
//                     dataSign.address
//                   );
//                   setLoading(false);
//                   close();
//                   onSuccess();
//                 } catch (error) {
//                   signInteractionStore.rejectAll();
//                   close();
//                   showToast({
//                     message:
//                       error?.message ??
//                       "Something went wrong! Please try again later.",
//                     type: "danger",
//                   });
//                 }
//               }}
//             />
//           </View>
//         </KeyboardAvoidingView>
//       </CardModal>
//     );
//   }),
//   {
//     disableSafeArea: true,
//   }
// );

import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useStyle } from "../../styles";
import {
  InsufficientFeeError,
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useSenderConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { Column, Columns } from "../../components/column";
import { FlatList, Text, View } from "react-native";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { XAxis, YAxis } from "../../components/axis";
import { CloseIcon } from "../../components/icon";
import {
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { FeeSummary } from "./components/fee-summary";
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import { Buffer } from "buffer/";
import { registerModal } from "@src/modals/base";
import { defaultRegistry } from "@src/modals/sign/cosmos/message-registry";
import { OWButton } from "@components/button";
import OWText from "@components/text/ow-text";
import OWIcon from "@components/ow-icon/ow-icon";
import {
  SignOasisInteractionStore,
  SignSvmInteractionStore,
} from "@owallet/stores-core";
import { TransactionType } from "@owallet/types";
import { UnsignedOasisTransaction } from "@owallet/stores-oasis";
import { useTheme } from "@src/themes/theme-provider";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  deserializeTransaction,
  getSimulationTxSolana,
  _getPriorityFeeSolana,
} from "@owallet/common";
import { defaultProtoCodec } from "@owallet/cosmos";
import { MessageItem } from "@src/modals/sign/cosmos/message-item";
import { HighFeeWarning } from "@src/modals/sign/components/high-fee-warning";
import ItemDivided from "@screens/transactions/components/item-divided";
import { GuideBox } from "@components/guide-box";
import { encode } from "bs58";

export const SignSvmModal = registerModal(
  observer<{
    interactionData: NonNullable<SignSvmInteractionStore["waitingData"]>;
  }>(({ interactionData }) => {
    const {
      chainStore,
      signSvmInteractionStore,
      queriesStore,
      solanaAccountStore,
    } = useStore();
    const [simulationData, setSimulationData] = useState();
    const intl = useIntl();
    const style = useStyle();

    const [isViewData, setIsViewData] = useState(false);
    const [txStrData, setTxStrData] = useState("");
    const chainId = interactionData.data.chainId;
    const accountInfo = solanaAccountStore.getAccount(chainId);
    const chainInfo = chainStore.getChain(chainId);
    const signer = interactionData.data.signer;

    const senderConfig = useSenderConfig(chainStore, chainId, signer);
    const gasConfig = useGasConfig(chainStore, chainId);
    const amountConfig = useAmountConfig(
      chainStore,
      queriesStore,
      chainId,
      senderConfig
    );
    const feeConfig = useFeeConfig(
      chainStore,
      queriesStore,
      chainId,
      senderConfig,
      amountConfig,
      gasConfig
    );

    // useEffect(() => {
    //   const data = interactionData.data;
    //   if (data.signType === TransactionType.StakingTransfer) {
    //     // const unsignedTx: UnsignedOasisTransaction = JSON.parse(
    //     //     Buffer.from(interactionData.data.message).toString()
    //     // );
    //     const defaultFeeOasis = 0;
    //     const feeAmount = new Dec(defaultFeeOasis);
    //     const feeCurrency = chainInfo.currencies[0];
    //     const fee = new CoinPretty(feeCurrency, feeAmount);
    //
    //     feeConfig.setFee(fee);
    //   }
    // }, [chainInfo.currencies, feeConfig, interactionData.data]);

    // const isTxSigning =
    //   interactionData.data.signType === TransactionType.StakingTransfer;

    const signingDataText = useMemo(() => {
      switch (interactionData.data.signType) {
        // case EthSignType.MESSAGE:
        //     return Buffer.from(interactionData.data.message).toString("hex");
        // case TransactionType.StakingTransfer:
        //   return JSON.stringify(
        //     JSON.parse(Buffer.from(interactionData.data.message).toString()),
        //     null,
        //     2
        //   );
        // case EthSignType.EIP712:
        //     return JSON.stringify(
        //         JSON.parse(Buffer.from(interactionData.data.message).toString()),
        //         null,
        //         2
        //     );
        default:
          return interactionData.data.message;
      }
    }, [interactionData.data]);
    const approve = async () => {
      try {
        await signSvmInteractionStore.approveWithProceedNext(
          interactionData.id,
          txStrData || (interactionData.data.message as string),
          // TODO: Ledger support
          undefined,
          async () => {
            // noop
          },
          {
            preDelay: 200,
          }
        );
      } catch (e) {
        console.log(e);
      }
    };
    const { colors } = useTheme();
    useEffect(() => {
      if (interactionData.data) {
        const data = interactionData.data;

        if (data?.message) {
          try {
            const connection = new Connection(chainInfo.rpc, "confirmed");
            const transferDecoded = deserializeTransaction(
              data?.message as string
            );
            const msgTransfer = transferDecoded.message as any;
            // (async () => {
            //   try {
            //     const feeInLamports = await connection.getFeeForMessage(
            //       transferInstruction
            //     );
            //     if (!feeInLamports?.value) return;
            //     const baseFee = new Dec(feeInLamports.value || 0);
            //     const fee = [
            //       {
            //         amount: baseFee.roundUp().toString(),
            //         currency: feeConfig.chainInfo.feeCurrencies[0],
            //       },
            //     ];
            //     feeConfig.setManualFee(fee);
            //
            //     const result = await getSimulationTxSolana(
            //       [data.message as string],
            //       chainInfo.chainId.replace("solana:", ""),
            //       data.signer,
            //       data.origin
            //     );
            //     console.log(result, "result");
            //     // if (!result.simulation) return;
            //     if (!result) {
            //       setSimulationData({
            //         status: "ERROR",
            //         error_details: {
            //           message: "Network request failed",
            //         },
            //       });
            //       return;
            //     }
            //     setSimulationData(result);
            //   } catch (e) {
            //     console.log(e, "eeerrr");
            //     setSimulationData({
            //       status: "ERROR",
            //       error_details: {
            //         message: e?.message || JSON.stringify(e),
            //       },
            //     });
            //   }
            // })();
            (async () => {
              try {
                const feeInLamports = await connection.getFeeForMessage(
                  //@ts-ignore
                  msgTransfer
                );
                if (!feeInLamports?.value) return;
                const dynamicMicroLamports = await _getPriorityFeeSolana(
                  // @ts-ignore
                  data?.message
                );
                const simulationResult = await connection.simulateTransaction(
                  transferDecoded
                );
                if (typeof simulationResult.value.unitsConsumed !== "number")
                  throw new Error("Unable to estimate the fee");
                const DefaultUnitLimit = new Dec(200_000);
                const unitsConsumed = new Dec(
                  simulationResult.value.unitsConsumed
                );
                const units = unitsConsumed.lte(DefaultUnitLimit)
                  ? DefaultUnitLimit
                  : unitsConsumed.mul(new Dec(1.2)); // Request up to 1,000,000 compute units
                const microLamports = new Dec(
                  dynamicMicroLamports > 0 ? dynamicMicroLamports : 50000
                );

                const baseFeeOrigin = new Dec(10000);
                const PriorityFee = units
                  .mul(microLamports)
                  .quoTruncate(DecUtils.getTenExponentNInPrecisionRange(6));
                const feeEstimate = baseFeeOrigin.add(PriorityFee);
                const baseFee = new Dec(feeInLamports.value || 0);
                if (baseFee.lt(baseFeeOrigin)) {
                  // Decode the instructions
                  const instructions = msgTransfer.compiledInstructions.map(
                    (instruction) => {
                      // console.log(accountKeys[2], "accountKeys[index]");
                      const keys = instruction.accountKeyIndexes.map(
                        (index) => ({
                          pubkey:
                            typeof msgTransfer.staticAccountKeys[index] ===
                            "string"
                              ? new PublicKey(
                                  msgTransfer.staticAccountKeys[index]
                                )
                              : msgTransfer.staticAccountKeys[index],
                          //@ts-ignore
                          isSigner: msgTransfer.isAccountSigner(index), // Check if it's a signer
                          //@ts-ignore
                          isWritable: msgTransfer.isAccountWritable(index), // Check if it's writable
                        })
                      );

                      return new TransactionInstruction({
                        keys,
                        programId:
                          msgTransfer.staticAccountKeys[
                            instruction.programIdIndex
                          ],
                        // @ts-ignore
                        data: Buffer.from(instruction.data),
                      });
                    }
                  );
                  const blockhash = (await connection.getLatestBlockhash())
                    .blockhash;
                  let transaction: VersionedTransaction | Transaction;
                  const uniqueInstructions = instructions.filter(
                    (instruction) =>
                      !instruction.programId.equals(
                        ComputeBudgetProgram.programId
                      )
                  );
                  if ((transferDecoded as any)?.version === "legacy") {
                    const messageV0 = new TransactionMessage({
                      recentBlockhash: blockhash,
                      instructions: [
                        ...uniqueInstructions,
                        ComputeBudgetProgram.setComputeUnitLimit({
                          units: Number(units.roundUp().toString()), // Convert units to an integer
                        }),
                        ComputeBudgetProgram.setComputeUnitPrice({
                          microLamports: Number(
                            microLamports.roundUp().toString()
                          ), // Set priority fee per compute unit in micro-lamports
                        }),
                      ],
                      // @ts-ignore
                      payerKey: new PublicKey(accountInfo.base58Address),
                    }).compileToLegacyMessage();
                    transaction = new VersionedTransaction(messageV0);
                  } else {
                    const messageV0 = new TransactionMessage({
                      recentBlockhash: blockhash,
                      instructions: [
                        ...uniqueInstructions,
                        ComputeBudgetProgram.setComputeUnitLimit({
                          units: Number(units.roundUp().toString()), // Convert units to an integer
                        }),
                        ComputeBudgetProgram.setComputeUnitPrice({
                          microLamports: Number(
                            microLamports.roundUp().toString()
                          ), // Set priority fee per compute unit in micro-lamports
                        }),
                      ],
                      // @ts-ignore
                      payerKey: new PublicKey(accountInfo.base58Address),
                    }).compileToV0Message();
                    transaction = new VersionedTransaction(messageV0);
                  }
                  const feeInLamportsFinal = await connection.getFeeForMessage(
                    //@ts-ignore
                    transaction?.message
                  );

                  let fee = [
                    {
                      amount: feeEstimate.roundUp().toString(),
                      currency: feeConfig.chainInfo.feeCurrencies[0],
                    },
                  ];
                  if (feeInLamportsFinal.value > 0) {
                    const baseFeeNew = new Dec(feeInLamportsFinal.value || 0);
                    fee = [
                      {
                        amount: baseFeeNew.roundUp().toString(),
                        currency: feeConfig.chainInfo.feeCurrencies[0],
                      },
                    ];
                  }
                  feeConfig.setManualFee(fee);
                  setTxStrData(encode(transaction.serialize()));
                  const result = await getSimulationTxSolana(
                    [encode(transaction.serialize())],
                    chainInfo.chainId.replace("solana:", ""),
                    accountInfo.base58Address,
                    data.origin
                  );

                  if (!result) {
                    setSimulationData({
                      status: "ERROR",
                      error_details: {
                        message: "Network request failed",
                      },
                    });
                    return;
                  }
                  setSimulationData(result);
                } else {
                  console.log(
                    baseFee.roundUp().toString(),
                    "baseFee.roundUp().toString()"
                  );
                  const fee = [
                    {
                      amount: baseFee.roundUp().toString(),
                      currency: feeConfig.chainInfo.feeCurrencies[0],
                    },
                  ];
                  feeConfig.setManualFee(fee);
                  const result = await getSimulationTxSolana(
                    [data.message as string],
                    chainInfo.chainId.replace("solana:", ""),
                    accountInfo.base58Address,
                    data.origin
                  );
                  if (!result) {
                    setSimulationData({
                      status: "ERROR",
                      error_details: {
                        message: "Network request failed",
                      },
                    });
                    return;
                  }
                  setSimulationData(result);
                }
              } catch (e) {
                setTxStrData(undefined);
                setSimulationData({
                  status: "ERROR",
                  error_details: {
                    message: e?.message || JSON.stringify(e),
                  },
                });
              }
            })();
          } catch (e) {
            setSimulationData({
              status: "ERROR",
              error_details: {
                message: e?.message || JSON.stringify(e),
              },
            });
            console.log(e, "errr deserializeTransaction");
          }
        }
      }
    }, [interactionData.data]);
    console.log(simulationData, "simulationData");
    console.log(feeConfig.fees[0]?.toCoin().amount, "feeConfig.fees[0]");
    const hasError = simulationData?.status === "ERROR";
    return (
      <WrapViewModal
        title={intl.formatMessage({
          id: "page.sign.ethereum.tx.title",
        })}
      >
        <Box style={style.flatten(["padding-12", "padding-top-0"])}>
          <Gutter size={24} />

          <Columns sum={1} alignY="center">
            <OWText style={style.flatten(["h5"])}>
              <FormattedMessage id="page.sign.ethereum.tx.summary" />
            </OWText>

            <Column weight={1} />

            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
          </Columns>

          <Gutter size={8} />

          {isViewData ||
          interactionData.data.signType !== "sign-transaction" ? (
            <Box
              maxHeight={128}
              backgroundColor={colors["neutral-surface-bg"]}
              padding={12}
              borderRadius={6}
            >
              <ScrollView persistentScrollbar={true}>
                <OWText style={style.flatten(["body3"])}>
                  {JSON.stringify(signingDataText)}
                </OWText>
              </ScrollView>
            </Box>
          ) : (
            <Box
              padding={12}
              minHeight={128}
              maxHeight={240}
              backgroundColor={colors["neutral-surface-bg"]}
              borderRadius={6}
            >
              <ScrollView persistentScrollbar={true}>
                {!simulationData &&
                interactionData.data.signType === "sign-transaction" ? (
                  <OWText>Simulating...</OWText>
                ) : null}
                {/*{simulationData?.status === "ERROR"?}*/}
                {hasError ? (
                  <Box width="100%">
                    {/*<Gutter size={16} />*/}
                    <OWText weight={"600"} color={colors["error-text-action"]}>
                      Simulation Failed:
                    </OWText>
                    <Gutter size={2} />
                    <OWText color={colors["neutral-text-body"]}>
                      {simulationData?.error_details?.message || ""}
                    </OWText>
                  </Box>
                ) : null}
                {simulationData?.status === "SUCCESS" &&
                  simulationData?.result?.simulation?.account_summary?.account_assets_diff.map(
                    (item) => {
                      const valueCheck = ((): Dec => {
                        if (item.asset_type === "SOL" && item.out) {
                          return new Dec(item.out.raw_value || 0).sub(
                            new Dec(feeConfig.fees[0]?.toCoin()?.amount || 0)
                          );
                        }
                        return new Dec((item.out || item.in).raw_value);
                      })();
                      const value = ((): string => {
                        if (
                          item.asset_type === "SOL" &&
                          item.out &&
                          valueCheck &&
                          valueCheck.gt(new Dec(0))
                        ) {
                          return new CoinPretty(
                            chainInfo.feeCurrencies[0],
                            valueCheck
                          )
                            .trim(true)
                            .toString();
                        }
                        return `${(item.out || item.in).value} ${
                          item.asset.symbol || "SOL"
                        }`;
                      })();
                      if (valueCheck && valueCheck.lte(new Dec(0))) return;
                      return (
                        <>
                          <Box
                            alignY={"center"}
                            style={{
                              justifyContent: "space-between",
                              flexDirection: "row",
                            }}
                          >
                            <OWText
                              weight={"600"}
                              color={
                                item.out
                                  ? colors["error-text-action"]
                                  : item.in
                                  ? colors["success-text-action"]
                                  : null
                              }
                            >
                              {item.out ? "Send" : "Receive"}
                            </OWText>

                            <YAxis alignX={"right"}>
                              <OWText
                                weight={"600"}
                                color={
                                  item.out
                                    ? colors["error-text-action"]
                                    : item.in
                                    ? colors["success-text-action"]
                                    : null
                                }
                              >
                                {value || ""}
                              </OWText>
                              <OWText color={colors["neutral-text-body"]}>
                                ≈ $
                                {((item.out || item.in).usd_price || 0).toFixed(
                                  2
                                )}
                              </OWText>
                            </YAxis>
                          </Box>
                          <ItemDivided />
                        </>
                      );
                    }
                  )}
              </ScrollView>
            </Box>
          )}

          {/*<Gutter size={60} />*/}
          {/*{interactionData.isInternal && (*/}
          <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />
          {/*)}*/}

          <Gutter size={12} />

          <XAxis>
            <OWButton
              size="large"
              label={intl.formatMessage({ id: "button.reject" })}
              type="secondary"
              style={{ flex: 1, width: "100%" }}
              onPress={async () => {
                await signSvmInteractionStore.rejectWithProceedNext(
                  interactionData.id,
                  () => {}
                );
              }}
            />

            <Gutter size={16} />

            <OWButton
              type={"primary"}
              size="large"
              disabled={!!simulationData === false}
              label={intl.formatMessage({ id: "button.approve" })}
              style={{ flex: 1, width: "100%" }}
              onPress={approve}
            />
          </XAxis>
        </Box>
      </WrapViewModal>
    );
  })
);

export const ViewDataButton: FunctionComponent<{
  isViewData: boolean;
  setIsViewData: (value: boolean) => void;
}> = ({ isViewData, setIsViewData }) => {
  const style = useStyle();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setIsViewData(!isViewData);
      }}
    >
      <XAxis alignY="center">
        <OWText style={style.flatten(["text-button2"])}>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </OWText>

        <Gutter size={4} />

        {isViewData ? (
          <CloseIcon size={12} color={style.get("color-gray-100").color} />
        ) : (
          // <CodeBracketIcon
          //   size={12}
          //   color={style.get('color-gray-100').color}
          // />
          <OWIcon
            size={12}
            name={"tdesignbrackets"}
            color={style.get("color-gray-100").color}
          />
        )}
      </XAxis>
    </TouchableWithoutFeedback>
  );
};
const Divider = () => {
  const style = useStyle();
  const { colors } = useTheme();
  return (
    <Box
      height={1}
      marginX={12}
      backgroundColor={colors["neutral-border-default"]}
    />
  );
};
