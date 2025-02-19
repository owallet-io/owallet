import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { SignSvmInteractionStore } from "@owallet/stores-core";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { Body2, Body3, H5, Subtitle3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { useInteractionInfo } from "../../../hooks";
import { Buffer } from "buffer/";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ViewDataButton } from "../components/view-data-button";
import { ChainImageFallback } from "../../../components/image";
import { Gutter } from "../../../components/gutter";
import { useUnmount } from "../../../hooks/use-unmount";
import { FeeSummary } from "../components/fee-summary";
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useSenderConfig,
} from "@owallet/hooks";
import { handleExternalInteractionWithNoProceedNext } from "../../../utils";
import {
  _getPriorityFeeSolana,
  deserializeTransaction,
  getSimulationTxSolana,
  MemoryKVStore,
} from "@owallet/common";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { Column, Columns } from "../../../components/column";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../components/button";
import { AddressChip } from "pages/main/components/address-chip";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { encode } from "bs58";
import { AccountInfoBox } from "../components/account-info-box";

export const SvmSigningView: FunctionComponent<{
  interactionData: NonNullable<SignSvmInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    chainStore,
    signSvmInteractionStore,
    queriesStore,
    solanaAccountStore,
    keyRingStore,
  } = useStore();
  const [simulationData, setSimulationData] = useState<{
    status: "SUCCESS" | "ERROR";
    error_details: any;
    result?: any;
  }>();
  const intl = useIntl();

  const [isViewData, setIsViewData] = useState(false);
  const [txStrData, setTxStrData] = useState("");
  const chainId = interactionData.data.chainId;
  const accountInfo = solanaAccountStore.getAccount(chainId);
  const chainInfo = chainStore.getChain(chainId);
  const signer = interactionData.data.signer;

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signSvmInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });
  const senderConfig = useSenderConfig(chainStore, chainId, signer);
  const gasConfig = useGasConfig(chainStore, chainId);
  const theme = useTheme();
  const navigate = useNavigate();
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
  const signingDataText = useMemo(() => {
    switch (interactionData.data.signType) {
      default:
        return interactionData.data.message;
    }
  }, [interactionData.data]);
  const isLoading = !!simulationData === false;
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
                    const keys = instruction.accountKeyIndexes.map((index) => ({
                      pubkey:
                        typeof msgTransfer.staticAccountKeys[index] === "string"
                          ? new PublicKey(msgTransfer.staticAccountKeys[index])
                          : msgTransfer.staticAccountKeys[index],
                      //@ts-ignore
                      isSigner: msgTransfer.isAccountSigner(index), // Check if it's a signer
                      //@ts-ignore
                      isWritable: msgTransfer.isAccountWritable(index), // Check if it's writable
                    }));

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
  const [unmountPromise] = useState(() => {
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    return {
      promise,
      resolver: resolver!,
    };
  });

  useUnmount(() => {
    unmountPromise.resolver();
  });
  const hasError = simulationData?.status === "ERROR";
  const isTxSigning = true;
  console.log(simulationData, "simulationData");
  console.log(
    simulationData?.status === "SUCCESS",
    'simulationData?.status === "SUCCESS"'
  );
  return (
    <HeaderLayout
      title={"Sign Solana"}
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      bottomButtons={[
        {
          left: <CancelIcon />,
          text: intl.formatMessage({ id: "button.reject" }),
          size: "large",
          color: "danger",
          onClick: async () => {
            await signSvmInteractionStore.rejectWithProceedNext(
              interactionData.id,
              async (proceedNext) => {
                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    handleExternalInteractionWithNoProceedNext();
                  } else if (
                    interactionInfo.interaction &&
                    interactionInfo.interactionInternal
                  ) {
                    window.history.length > 1 ? navigate(-1) : navigate("/");
                  } else {
                    navigate("/", { replace: true });
                  }
                }
              }
            );
          },
        },
        {
          text: intl.formatMessage({ id: "button.approve" }),
          color: "primary",
          size: "large",
          left: !isLoading && <ApproveIcon />,
          isLoading,
          onClick: async () => {
            try {
              await signSvmInteractionStore.approveWithProceedNext(
                interactionData.id,
                txStrData || (interactionData.data.message as string),
                undefined,
                async (proceedNext) => {
                  if (!proceedNext) {
                    if (
                      interactionInfo.interaction &&
                      !interactionInfo.interactionInternal
                    ) {
                      handleExternalInteractionWithNoProceedNext();
                    } else if (
                      interactionInfo.interaction &&
                      interactionInfo.interactionInternal
                    ) {
                      window.history.length > 1 ? navigate(-1) : navigate("/");
                    } else {
                      navigate("/", { replace: true });
                    }
                  }
                  if (
                    interactionInfo.interaction &&
                    interactionInfo.interactionInternal
                  ) {
                    await unmountPromise.promise;
                  }
                }
              );
            } catch (e) {
              console.log(e);
            }
          },
        },
      ]}
    >
      <Box
        height="100%"
        padding="0.75rem"
        paddingBottom="0"
        style={{
          overflow: "auto",
        }}
      >
        {isTxSigning ? (
          <Box marginBottom="0.5rem" alignX="center" alignY="center">
            <Box
              padding="0.375rem 0.625rem 0.375rem 0.75rem"
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette.white
                  : ColorPalette["gray-600"]
              }
              borderRadius="20rem"
            >
              <XAxis alignY="center">
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-200"]
                  }
                >
                  <FormattedMessage
                    id="page.sign.ethereum.requested-network"
                    values={{
                      network: chainInfo.chainName,
                    }}
                  />
                </Body3>
                <Gutter direction="horizontal" size="0.5rem" />
                <ChainImageFallback
                  size="1.25rem"
                  chainInfo={chainInfo}
                  alt={chainInfo.chainName}
                />
              </XAxis>
            </Box>
          </Box>
        ) : (
          <Box
            padding="1rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette.white
                : ColorPalette["gray-600"]
            }
            borderRadius="0.375rem"
            style={{
              boxShadow:
                theme.mode === "light"
                  ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                  : "none",
            }}
          >
            <XAxis alignY="center">
              {/* <Image
                alt="sign-custom-image"
                src={require("../../../public/assets/img/sign-adr36.png")}
                style={{ width: "3rem", height: "3rem" }}
              /> */}
              <Gutter size="0.75rem" />
              <YAxis>
                <H5
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-10"]
                  }
                >
                  <FormattedMessage id="Verify ownership to" />
                </H5>
                <Gutter size="2px" />
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  {interactionData?.data.origin || ""}
                </Body3>
              </YAxis>
            </XAxis>
          </Box>
        )}

        <Gutter size="0.75rem" />

        {isTxSigning && (
          <Box marginBottom="0.5rem">
            <Columns sum={1} alignY="center">
              <XAxis alignY="center">
                <H5
                  style={{
                    color:
                      theme.mode === "light"
                        ? ColorPalette["gray-500"]
                        : ColorPalette["gray-50"],
                  }}
                >
                  <FormattedMessage id="page.sign.cosmos.tx.messages" />:
                </H5>
                <Box
                  style={{
                    padding: "0.25rem 0.35rem",
                    borderRadius: "0.35rem",
                    backgroundColor: ColorPalette["purple-700"],
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "0.35rem",
                  }}
                >
                  <H5
                    style={{
                      color: ColorPalette["white"],
                    }}
                  >
                    {1}
                  </H5>
                </Box>
              </XAxis>
              <Column weight={1} />

              <ViewDataButton
                isViewData={isViewData}
                setIsViewData={setIsViewData}
              />
            </Columns>
          </Box>
        )}
        <SimpleBar
          autoHide={false}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: !isViewData ? "0 1 auto" : 1,
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: "0.375rem",
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette.white
                : ColorPalette["gray-600"],
            boxShadow:
              theme.mode === "light"
                ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                : "none",
          }}
        >
          {isTxSigning ? (
            <Box>
              {isViewData ? (
                <Box
                  as={"pre"}
                  padding="1rem"
                  // Remove normalized style of pre tag
                  margin="0"
                  style={{
                    width: "fit-content",
                    color:
                      theme.mode === "light"
                        ? ColorPalette["gray-400"]
                        : ColorPalette["gray-200"],
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {signingDataText}
                </Box>
              ) : (
                <Box padding="1rem">
                  {!simulationData &&
                  interactionData.data.signType === "sign-transaction" ? (
                    <Body2
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-300"]
                          : ColorPalette["gray-100"]
                      }
                    >
                      Simulating...
                    </Body2>
                  ) : null}
                  {hasError ? (
                    <Box width="100%">
                      {/*<Gutter size={16} />*/}
                      <Body2 weight={"600"} color={ColorPalette["red-400"]}>
                        Simulation Failed:
                      </Body2>
                      <Gutter size={"2px"} />
                      <Body2
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-300"]
                            : ColorPalette["gray-100"]
                        }
                      >
                        {simulationData?.error_details?.message || ""}
                      </Body2>
                    </Box>
                  ) : null}

                  {simulationData?.status === "SUCCESS" &&
                    simulationData?.result?.simulation?.account_summary?.account_assets_diff.map(
                      (item, index) => {
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
                        if (valueCheck && valueCheck.lt(new Dec(0))) return;
                        return (
                          <>
                            <Box
                              key={index.toString()}
                              width="100%"
                              alignY={"center"}
                              style={{
                                justifyContent: "space-between",
                                flexDirection: "row",
                              }}
                            >
                              <Body2
                                weight={"600"}
                                color={
                                  item.out
                                    ? theme.mode === "light"
                                      ? ColorPalette["red-400"]
                                      : ColorPalette["red-300"]
                                    : item.in
                                    ? theme.mode === "light"
                                      ? ColorPalette["green-400"]
                                      : ColorPalette["green-300"]
                                    : null
                                }
                              >
                                {item.out ? "Send" : "Receive"}
                              </Body2>

                              <YAxis alignX={"right"}>
                                <Body2
                                  weight={"600"}
                                  color={
                                    item.out
                                      ? theme.mode === "light"
                                        ? ColorPalette["red-400"]
                                        : ColorPalette["red-300"]
                                      : item.in
                                      ? theme.mode === "light"
                                        ? ColorPalette["green-400"]
                                        : ColorPalette["green-300"]
                                      : null
                                  }
                                >
                                  {value || ""}
                                </Body2>
                                <Body2
                                  color={
                                    theme.mode === "light"
                                      ? ColorPalette["gray-300"]
                                      : ColorPalette["gray-100"]
                                  }
                                >
                                  ≈ $
                                  {(
                                    (item.out || item.in).usd_price || 0
                                  ).toFixed(2)}
                                </Body2>
                              </YAxis>
                            </Box>
                            <div
                              style={{
                                backgroundColor: ColorPalette["gray-10"],
                                margin: "7px 0px",
                                height: 1,
                              }}
                            />
                          </>
                        );
                      }
                    )}
                  {/*</Body2>*/}
                </Box>
              )}
            </Box>
          ) : (
            <Box
              as={"pre"}
              padding="1rem"
              // Remove normalized style of pre tag
              margin="0"
              style={{
                width: "fit-content",
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-200"],
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {signingDataText}
            </Box>
          )}
        </SimpleBar>

        <Box height="0" minHeight="0.75rem" />

        {!isViewData ? <div style={{ flex: 1 }} /> : null}
        <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />
        <AccountInfoBox chainId={chainId} />
      </Box>
    </HeaderLayout>
  );
});
