import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { SignTronInteractionStore } from "@owallet/stores-core";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { Body2, Body3, H5 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { useInteractionInfo } from "../../../hooks";
import { OWalletError } from "@owallet/router";
import { ErrModuleLedgerSign } from "../utils/ledger-types";
import { Buffer } from "buffer/";
import { LedgerGuideBox } from "../components/ledger-guide-box";
import { EthSignType } from "@owallet/types";
import { handleEthereumPreSignByLedger } from "../utils/handle-eth-sign";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ViewDataButton } from "../components/view-data-button";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { defaultRegistry } from "../components/eth-tx/registry";
import { ChainImageFallback } from "../../../components/image";
import { Gutter } from "../../../components/gutter";
import { useUnmount } from "../../../hooks/use-unmount";
import { FeeSummary } from "../components/fee-summary";
import { FeeControl } from "../../../components/input/fee-control";
import {
  useAmountConfig,
  useFeeConfig,
  useGasSimulator,
  useGetFeeTron,
  useSenderConfig,
  useSendTronTxConfig,
  useZeroAllowedGasConfig,
} from "@owallet/hooks";
import { handleExternalInteractionWithNoProceedNext } from "../../../utils";
import {
  DEFAULT_FEE_LIMIT_TRON,
  MemoryKVStore,
  toDisplay,
  TronWebProvider,
} from "@owallet/common";
import { Image } from "../../../components/image";
import { Column, Columns } from "../../../components/column";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../components/button";
import { MessageItem } from "../components/message-item";
import { handleTronPreSignByLedger } from "../utils/handle-trx-sign";

export const TronSigningView: FunctionComponent<{
  interactionData: NonNullable<SignTronInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    chainStore,
    uiConfigStore,
    signTronInteractionStore,
    tronAccountStore,
    queriesStore,
    keyRingStore,
  } = useStore();
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signTronInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });

  const { chainId } = interactionData.data;

  const [loading, setLoading] = useState(false);

  const account = tronAccountStore.getAccount(chainId);
  const addressToFetch = account.ethereumHexAddress;
  const data = JSON.parse(interactionData?.data?.data);

  const parsedData = typeof data === "string" ? JSON.parse(data) : data;
  const chainInfo = chainStore.getChain(chainId);
  const queries = queriesStore.get(chainId);
  const sendConfigs = useSendTronTxConfig(
    chainStore,
    queriesStore,
    chainId,
    addressToFetch,
    1
  );
  const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);

  if (!parsedData.raw_data_hex) {
    const currency = chainInfo.forceFindCurrency(parsedData.coinMinimalDenom);
    sendConfigs.amountConfig.setCurrency(currency);
    sendConfigs.recipientConfig.setValue(parsedData.recipient || "");
    const displayAmount = toDisplay(
      parsedData.amount,
      chainInfo.stakeCurrency.coinDecimals
    );
    sendConfigs.amountConfig.setValue(displayAmount.toString());
  }

  const feeResult = useGetFeeTron(
    account.base58Address,
    sendConfigs.amountConfig,
    sendConfigs.recipientConfig,
    queries.tron,
    chainInfo,
    keyRingStore.selectedKeyInfo.id,
    keyRingStore,
    parsedData.raw_data_hex ? parsedData : null
  );

  const signingDataText = useMemo(() => {
    return JSON.stringify(parsedData);
  }, [parsedData]);

  const [isViewData, setIsViewData] = useState(false);

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

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

  const [isUnknownContractExecution, setIsUnknownContractExecution] =
    useState(false);

  const isLoading = isLedgerInteracting;

  const approve = async () => {
    try {
      let signature = undefined;
      let transaction;
      if (interactionData.data.keyType === "ledger") {
        setLoading(true);
        const tronWeb = TronWebProvider(chainInfo.rpc);

        if (parsedData?.contractAddress) {
          transaction = (
            await tronWeb.transactionBuilder.triggerSmartContract(
              parsedData?.contractAddress,
              "transfer(address,uint256)",
              {
                callValue: 0,
                feeLimit: parsedData?.feeLimit ?? DEFAULT_FEE_LIMIT_TRON,
                userFeePercentage: 100,
                shouldPollResponse: false,
              },
              [
                { type: "address", value: parsedData.recipient },
                { type: "uint256", value: parsedData.amount },
              ],
              parsedData.address
            )
          ).transaction;
        } else {
          transaction = await tronWeb.transactionBuilder.sendTrx(
            parsedData.recipient,
            parsedData.amount,
            parsedData.address
          );
        }

        setIsLedgerInteracting(true);
        setLedgerInteractingError(undefined);

        signature = await handleTronPreSignByLedger(
          interactionData,
          transaction.raw_data_hex,
          ledgerBLE.getTransport
        );

        transaction.signature = [signature];

        await tronWeb.trx.sendRawTransaction(transaction);
        setLoading(false);
      }

      await signTronInteractionStore.approveWithProceedNext(
        interactionData.id,
        interactionData.data.keyType === "ledger"
          ? JSON.stringify(transaction)
          : Buffer.from(
              Buffer.from(JSON.stringify(interactionData.data.data)).toString(
                "hex"
              )
            ),
        signature,
        async () => {
          // noop
          setLoading(false);
        },
        {
          preDelay: 200,
        }
      );
    } catch (e) {
      console.log("error on sign Tron", e);
      setLoading(false);
    }
  };

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: `page.sign.cosmos.tx.title`,
      })}
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
          textOverrideIcon: <CancelIcon color={ColorPalette["gray-200"]} />,
          size: "large",
          color: "secondary",
          style: {
            width: "3.25rem",
          },
          onClick: async () => {
            await signTronInteractionStore.rejectWithProceedNext(
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
              let signature;
              if (interactionData.data.keyType === "ledger") {
                setIsLedgerInteracting(true);
                setLedgerInteractingError(undefined);
              }

              await signTronInteractionStore.approveWithProceedNext(
                interactionData.id,
                Buffer.from(signingDataText),
                signature,
                async (proceedNext) => {
                  if (!proceedNext) {
                    if (
                      interactionInfo.interaction &&
                      !interactionInfo.interactionInternal
                    ) {
                      handleExternalInteractionWithNoProceedNext();
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

              if (e instanceof OWalletError) {
                if (e.module === ErrModuleLedgerSign) {
                  setLedgerInteractingError(e);
                } else {
                  setLedgerInteractingError(undefined);
                }
              } else {
                setLedgerInteractingError(undefined);
              }
            } finally {
              setIsLedgerInteracting(false);
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
              <Image
                alt="sign-custom-image"
                src={require("../../../public/assets/img/sign-adr36.png")}
                style={{ width: "3rem", height: "3rem" }}
              />
              <Gutter size="0.75rem" />
              <YAxis>
                <H5
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-10"]
                  }
                >
                  <FormattedMessage id="Prove account ownership to" />
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
              <XAxis>
                <H5
                  style={{
                    color:
                      theme.mode === "light"
                        ? ColorPalette["gray-500"]
                        : ColorPalette["gray-50"],
                  }}
                >
                  <FormattedMessage
                    id={"page.sign.ethereum.transaction.summary"}
                  />
                </H5>
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
          {isTxSigning && !isUnknownContractExecution ? (
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
                  <Body2
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-100"]
                    }
                  >
                    {(() => {
                      const { icon, title, content } = defaultRegistry.render(
                        interactionData.data.chainId,
                        JSON.parse(
                          Buffer.from(interactionData.data.message).toString()
                        ) as UnsignedTransaction
                      );

                      if (icon !== undefined && title !== undefined) {
                        return (
                          <MessageItem
                            icon={icon}
                            title={title}
                            content={content}
                          />
                        );
                      }

                      setIsUnknownContractExecution(true);
                    })()}
                  </Body2>
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

        {isTxSigning &&
          (() => {
            if (interactionData.isInternal) {
              return (
                <FeeSummary
                  feeConfig={feeConfig}
                  gasConfig={gasConfig}
                  gasSimulator={gasSimulator}
                  isForEVMTx
                />
              );
            }

            return (
              <FeeControl
                feeConfig={feeConfig}
                senderConfig={senderConfig}
                gasConfig={gasConfig}
                gasSimulator={gasSimulator}
                isForEVMTx
              />
            );
          })()}

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isEthereum: true,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
      </Box>
    </HeaderLayout>
  );
});
