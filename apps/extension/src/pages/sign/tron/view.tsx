import React, { FunctionComponent, useMemo, useState } from "react";
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
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { Gutter } from "../../../components/gutter";
import { useUnmount } from "../../../hooks/use-unmount";

import { useGetFeeTron, useSendTronTxConfig } from "@owallet/hooks";
import { handleExternalInteractionWithNoProceedNext } from "../../../utils";
import {
  DEFAULT_FEE_LIMIT_TRON,
  toDisplay,
  TronWebProvider,
} from "@owallet/common";
import { Image } from "../../../components/image";
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
          {
            useWebHID: uiConfigStore.useWebHIDLedger,
          }
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
            approve();
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
              let transaction;

              if (interactionData.data.keyType === "ledger") {
                const tronWeb = TronWebProvider(chainInfo.rpc);
                setIsLedgerInteracting(true);
                setLedgerInteractingError(undefined);
                if (parsedData?.contractAddress) {
                  transaction = (
                    await tronWeb.transactionBuilder.triggerSmartContract(
                      parsedData?.contractAddress,
                      "transfer(address,uint256)",
                      {
                        callValue: 0,
                        feeLimit:
                          parsedData?.feeLimit ?? DEFAULT_FEE_LIMIT_TRON,
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
                signature = await handleTronPreSignByLedger(
                  interactionData,
                  transaction.raw_data_hex,
                  {
                    useWebHID: uiConfigStore.useWebHIDLedger,
                  }
                );

                transaction.signature = [signature];

                await tronWeb.trx.sendRawTransaction(transaction);
              }

              await signTronInteractionStore.approveWithProceedNext(
                interactionData.id,
                interactionData.data.keyType === "ledger"
                  ? JSON.stringify(transaction)
                  : Buffer.from(signingDataText),
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
        <Gutter size="0.75rem" />
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
          {!isUnknownContractExecution ? (
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
                      const title = "Execute Contract";
                      const icon = (
                        <img
                          style={{ width: 30, height: 30 }}
                          src={chainInfo.chainSymbolImageUrl}
                        />
                      );
                      if (icon !== undefined && title !== undefined) {
                        return (
                          <MessageItem
                            icon={icon}
                            title={title}
                            content={signingDataText}
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
        Fee
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
