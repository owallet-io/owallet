import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import style from "../style.module.scss";
import { observer } from "mobx-react-lite";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../../stores";
import { SvmDataTab } from "./svm-data-tab";
import { SvmDetailsTab } from "./svm-details-tab";
import { encode } from "bs58";
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useInteractionInfo,
  useMemoConfig,
} from "@owallet/hooks";
import { useHistory } from "react-router";
import { ChainIdHelper } from "@owallet/cosmos";
import { DataModal } from "../modals/data-modal";
import useOnClickOutside from "../../../hooks/use-click-outside";
import colors from "../../../theme/colors";
import { Text } from "../../../components/common/text";
import { Address } from "../../../components/address";
import cn from "classnames/bind";
import { CoinPrimitive, WalletStatus } from "@owallet/stores";
import { Button } from "../../../components/common/button";
import withErrorBoundary from "../hoc/withErrorBoundary";
import {
  _getPriorityFeeSolana,
  deserializeTransaction,
  getSimulationTxSolana,
  isVersionedTransaction,
} from "@owallet/common";
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import {
  ComputeBudgetProgram,
  Connection,
  MessageV0,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { SvmDetailsSend } from "pages/sign/sign-svm/svm-detail-send";

const cx = cn.bind(style);

enum Tab {
  Details,
  Data,
}
const SvmDetailsTabWithErrorBoundary = withErrorBoundary(SvmDetailsTab);
const SvmDetailsSendWithErrorBoundary = withErrorBoundary(SvmDetailsSend);

export const SignSvmPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const [tab, setTab] = useState<Tab>(Tab.Details);
  const {
    chainStore,
    keyRingStore,
    signInteractionStore,
    accountStore,
    queriesStore,
    priceStore,
  } = useStore();
  const [txStrData, setTxStrData] = useState();

  const history = useHistory();
  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });
  const [simulationData, setSimulationData] = useState<any>();

  const [dataSetting, setDataSetting] = useState(false);
  const dataRef = useRef();

  useOnClickOutside(dataRef, () => {
    handleCloseDataModal();
  });

  const handleCloseDataModal = () => {
    setDataSetting(false);
    setTab(Tab.Details);
  };
  const data = signInteractionStore.waitingSvmData;
  useEffect(() => {
    return () => {
      signInteractionStore.reject();
    };
  }, []);

  const chainId = data?.data?.chainId || chainStore.current.chainId;
  const accountInfo = accountStore.getAccount(chainId);
  const signer = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const chainInfo = chainStore.getChain(chainId);
  const isNoSetFee = !!accountInfo.isSendingMsg;
  const queries = queriesStore.get(chainId);
  const queryBalances = queries.queryBalances;
  const gasConfig = useGasConfig(chainStore, chainId);
  const amountConfig = useAmountConfig(
    chainStore,
    chainId,
    signer,
    queryBalances,
    queries.bitcoin.queryBitcoinBalance
  );
  const memoConfig = useMemoConfig(chainStore, chainId);
  const feeConfig = useFeeConfig(
    chainStore,
    chainId,
    signer,
    queryBalances,
    amountConfig,
    gasConfig,
    true,
    queries.bitcoin.queryBitcoinBalance,
    memoConfig
  );
  useEffect(() => {
    if (signInteractionStore.waitingSvmData) {
      const data = signInteractionStore.waitingSvmData;
      //@ts-ignore
      const txStr: string = data.data.data?.tx;
      if (txStr) {
        try {
          const connection = new Connection(chainInfo.rpc, "confirmed");
          const transferDecoded = deserializeTransaction(txStr);
          const msgTransfer = transferDecoded.message as MessageV0;
          (async () => {
            const feeInLamports = await connection.getFeeForMessage(
              //@ts-ignore
              msgTransfer
            );
            if (!feeInLamports?.value) return;
            const dynamicMicroLamports = await _getPriorityFeeSolana(
              (data.data.data as any)?.tx
            );
            const simulationResult = await connection.simulateTransaction(
              transferDecoded
            );
            if (typeof simulationResult.value.unitsConsumed !== "number")
              throw new Error("Unable to estimate the fee");
            const DefaultUnitLimit = new Dec(200_000);
            const unitsConsumed = new Dec(simulationResult.value.unitsConsumed);
            const units = unitsConsumed.lte(DefaultUnitLimit)
              ? DefaultUnitLimit
              : unitsConsumed.mul(new Dec(1.2)); // Request up to 1,000,000 compute units
            const microLamports = new Dec(
              dynamicMicroLamports > 0 ? dynamicMicroLamports : 50000
            );
            // const accountKeys = msgTransfer.staticAccountKeys.map((key) => key.toBase58());

            const baseFeeOrigin = new Dec(50000);
            const PriorityFee = units
              .mul(microLamports)
              .quoTruncate(DecUtils.getTenExponentNInPrecisionRange(6));
            const feeEstimate = baseFeeOrigin.add(PriorityFee);
            const baseFee = new Dec(feeInLamports.value || 0);
            if (feeEstimate.gte(baseFee)) {
              // Decode the instructions
              const instructions = msgTransfer.compiledInstructions.map(
                (instruction) => {
                  // console.log(accountKeys[2], "accountKeys[index]");
                  const keys = instruction.accountKeyIndexes.map((index) => ({
                    pubkey: msgTransfer.staticAccountKeys[index],
                    //@ts-ignore
                    isSigner: msgTransfer.isAccountSigner(index), // Check if it's a signer
                    //@ts-ignore
                    isWritable: msgTransfer.isAccountWritable(index), // Check if it's writable
                  }));
                  return new TransactionInstruction({
                    keys,
                    programId:
                      msgTransfer.staticAccountKeys[instruction.programIdIndex],
                    data: Buffer.from(instruction.data),
                  });
                }
              );
              const blockhash = (await connection.getLatestBlockhash())
                .blockhash;
              let transaction: VersionedTransaction | Transaction;
              console.log(
                (transferDecoded as any)?.version,
                "isVersionedTransactionNew(transferDecoded)"
              );
              if ((transferDecoded as any)?.version === "legacy") {
                const legacyTransaction = new Transaction({
                  recentBlockhash: blockhash,
                  feePayer: new PublicKey(accountInfo.base58Address),
                });

                // Add ComputeBudget instructions
                legacyTransaction.add(
                  ComputeBudgetProgram.setComputeUnitLimit({
                    units: Number(units.roundUp().toString()), // Convert units to an integer
                  }),
                  ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: Number(microLamports.roundUp().toString()), // Set priority fee in micro-lamports
                  })
                );

                // Add the extracted instructions
                instructions.forEach((instruction) =>
                  legacyTransaction.add(instruction)
                );
                transaction = legacyTransaction;
              } else {
                const messageV0 = new TransactionMessage({
                  recentBlockhash: blockhash,
                  instructions: [
                    ComputeBudgetProgram.setComputeUnitLimit({
                      units: Number(units.roundUp().toString()), // Convert units to an integer
                    }),
                    ComputeBudgetProgram.setComputeUnitPrice({
                      microLamports: Number(microLamports.roundUp().toString()), // Set priority fee per compute unit in micro-lamports
                    }),
                    ...instructions,
                  ],
                  // @ts-ignore
                  payerKey: new PublicKey(accountInfo.base58Address),
                }).compileToV0Message();
                transaction = new VersionedTransaction(messageV0);
              }
              const fee = {
                amount: feeEstimate.roundUp().toString(),
                denom: feeConfig.feeCurrency.coinMinimalDenom,
              } as CoinPrimitive;
              feeConfig.setManualFee(fee);
              setTxStrData(encode(transaction.serialize()));
              const result = await getSimulationTxSolana(
                [encode(transaction.serialize())],
                chainInfo.chainId.replace("solana:", ""),
                accountInfo.base58Address,
                data.data.msgOrigin
              );

              if (!result?.simulation) return;
              setSimulationData(result.simulation);
            } else {
              const fee = {
                amount: baseFee.roundUp().toString(),
                denom: feeConfig.feeCurrency.coinMinimalDenom,
              } as CoinPrimitive;
              feeConfig.setManualFee(fee);
              const result = await getSimulationTxSolana(
                [(data.data.data as any)?.tx],
                chainInfo.chainId.replace("solana:", ""),
                accountInfo.base58Address,
                data.data.msgOrigin
              );
              if (!result?.simulation) return;
              setSimulationData(result.simulation);
            }
          })();
        } catch (e) {
          setTxStrData(undefined);
          console.log(e, "errr deserializeTransaction");
        }
      }

      chainStore.selectChain(data.data.chainId);
    }
  }, [signInteractionStore.waitingSvmData]);
  const isLoaded = useMemo(() => {
    if (data?.data?.chainId) {
      return true;
    } else if (!data?.data?.chainId) {
      return false;
    }

    return (
      ChainIdHelper.parse(chainId).identifier ===
      ChainIdHelper.parse(chainStore.selectedChainId).identifier
    );
  }, [data, chainId, chainStore.selectedChainId]);
  const fee =
    feeConfig.fee ||
    new CoinPretty(chainStore.current.stakeCurrency, new Dec(0));
  const renderTransactionFee = () => {
    if (fee?.toDec().lte(new Dec(0))) return null;
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 14,
          }}
        >
          <div
            style={{
              flexDirection: "column",
              display: "flex",
            }}
          >
            <div>
              <Text weight="600">Fee</Text>
            </div>
            <div></div>
          </div>
          <div
            style={{
              flexDirection: "column",
              display: "flex",
              alignItems: "flex-end",
              width: "65%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                cursor: "pointer",
              }}
            >
              <Text
                size={16}
                weight="600"
                color={colors["primary-text-action"]}
              >
                {`≈ ${fee?.maxDecimals(6)?.trim(true)?.toString()}`}
              </Text>
              {/* <img src={require("assets/icon/tdesign_chevron-down.svg")} /> */}
            </div>
            <Text
              containerStyle={{
                alignSelf: "flex-end",
                display: "flex",
              }}
              color={colors["neutral-text-body"]}
            >
              ≈ {priceStore.calculatePrice(fee)?.toString()}
            </Text>
          </div>
        </div>
      </div>
    );
  };
  const approveIsDisabled = (() => {
    if (!isLoaded) {
      return true;
    }

    // if (!dataSign) {
    //     return true;
    // }
    if (!isNoSetFee) {
      return feeConfig.getError() != null;
    }
    return false;
  })();
  return (
    <div
      style={{
        height: "100%",
        width: "100vw",
        overflowX: "auto",
      }}
    >
      <div
        className={cx("setting", dataSetting ? "activeSetting" : "", "modal")}
        ref={dataRef}
      >
        <DataModal
          onClose={() => {
            handleCloseDataModal();
          }}
          renderData={() => <SvmDataTab data={data?.data.data} />}
        />
      </div>
      {
        /*
                                                 Show the informations of tx when the sign data is delivered.
                                                 If sign data not delivered yet, show the spinner alternatively.
                                                 */
        isLoaded ? (
          <div className={style.container}>
            <div
              style={{
                height: "75%",
                overflowY: "scroll",
                overflowX: "hidden",
                padding: 16,
              }}
            >
              <div
                className={classnames(style.tabs)}
                style={{ display: "flex", paddingBottom: 12 }}
              >
                <div>
                  <Text size={16} weight="700">
                    {"Approve transaction".toUpperCase()}
                  </Text>
                </div>
                <div
                  onClick={() => {
                    setDataSetting(true);
                    setTab(Tab.Data);
                  }}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: colors["neutral-surface-action3"],
                    borderRadius: 999,
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Text weight="600">Raw Data</Text>
                  <img src={require("assets/icon/tdesign_chevron-right.svg")} />
                </div>
              </div>
              <div
                className={classnames(style.tabContainer, {
                  [style.dataTab]: tab === Tab.Data,
                })}
              >
                {simulationData ? (
                  <SvmDetailsTabWithErrorBoundary
                    priceStore={priceStore}
                    feeConfig={feeConfig}
                    gasConfig={null}
                    intl={intl}
                    dataSign={data}
                    isNoSetFee={isNoSetFee}
                    signer={signer}
                    simulation={simulationData}
                  />
                ) : (data.data?.data as any)?.unsignedTx ? (
                  <SvmDetailsSendWithErrorBoundary
                    priceStore={priceStore}
                    feeConfig={feeConfig}
                    gasConfig={null}
                    intl={intl}
                    dataSign={data}
                    isNoSetFee={isNoSetFee}
                    signer={signer}
                  />
                ) : (
                  <>
                    <div
                      style={{
                        overflow: "scroll",
                        backgroundColor: colors["neutral-surface-bg"],
                        borderRadius: 12,
                        padding: 8,
                        width: "90vw",
                      }}
                    >
                      {" "}
                      <SvmDataTab data={data} />
                    </div>

                    {renderTransactionFee()}
                  </>
                )}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                height: "25%",
                backgroundColor: colors["neutral-surface-card"],
                borderTop: "1px solid" + colors["neutral-border-default"],
              }}
            >
              {keyRingStore.keyRingType === "ledger" &&
              signInteractionStore.isLoading ? (
                <Button className={style.button} disabled={true} mode="outline">
                  <FormattedMessage id="sign.button.confirm-ledger" />{" "}
                  <i className="fa fa-spinner fa-spin fa-fw" />
                </Button>
              ) : (
                <div>
                  <div
                    style={{
                      flexDirection: "row",
                      display: "flex",
                      padding: 8,
                      justifyContent: "space-between",
                      backgroundColor: colors["neutral-surface-bg"],
                      margin: 16,
                      marginBottom: 8,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        flexDirection: "row",
                        display: "flex",
                      }}
                    >
                      <img
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 40,
                          marginRight: 8,
                        }}
                        src={require("assets/images/default-avatar.png")}
                      />
                      <div style={{ flexDirection: "column", display: "flex" }}>
                        <Text size={14} weight="600">
                          {accountInfo.name}
                        </Text>
                        <Text color={colors["neutral-text-body"]}>
                          {" "}
                          <Address
                            maxCharacters={18}
                            lineBreakBeforePrefix={false}
                          >
                            {accountInfo.walletStatus === WalletStatus.Loaded &&
                            signer
                              ? signer
                              : "..."}
                          </Address>
                        </Text>
                      </div>
                    </div>
                    {/* <Text color={colors["neutral-text-body"]}>123</Text> */}
                  </div>
                  <div
                    style={{
                      flexDirection: "row",
                      display: "flex",
                      padding: 16,
                      paddingTop: 0,
                    }}
                  >
                    <Button
                      containerStyle={{ marginRight: 8 }}
                      className={classnames(style.button, style.rejectBtn)}
                      color={"reject"}
                      data-loading={signInteractionStore.isLoading}
                      disabled={signInteractionStore.isLoading}
                      onClick={async (e) => {
                        e.preventDefault();

                        await signInteractionStore.reject();
                        if (
                          interactionInfo.interaction &&
                          !interactionInfo.interactionInternal
                        ) {
                          window.close();
                        }
                        history.goBack();
                      }}
                    >
                      {intl.formatMessage({
                        id: "sign.button.reject",
                      })}
                    </Button>
                    <Button
                      className={classnames(style.button, style.approveBtn)}
                      disabled={approveIsDisabled}
                      data-loading={signInteractionStore.isLoading}
                      loading={signInteractionStore.isLoading}
                      onClick={async (e) => {
                        e.preventDefault();

                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        await signInteractionStore.approveSvmAndWaitEnd({
                          ...data.data.data,
                          tx: txStrData || (data.data.data as any)?.tx,
                        });
                        if (
                          interactionInfo.interaction &&
                          !interactionInfo.interactionInternal
                        ) {
                          window.close();
                        }
                        history.goBack();
                      }}
                    >
                      {intl.formatMessage({
                        id: "sign.button.approve",
                      })}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <i className="fas fa-spinner fa-spin fa-2x text-gray" />
          </div>
        )
      }
    </div>
  );
});
