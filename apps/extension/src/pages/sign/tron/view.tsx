import React, { FunctionComponent, useMemo, useState } from "react";
import { SignTronInteractionStore } from "@owallet/stores-core";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { Body2, Subtitle3 } from "../../../components/typography";
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
import { ApproveIcon, CancelIcon } from "../../../components/button";
import { MessageItem } from "../components/message-item";
import { handleTronPreSignByLedger } from "../utils/handle-trx-sign";
import { useNotification } from "../../../hooks/notification";
import { AddressChip } from "pages/main/components/address-chip";
import { useNavigate } from "react-router";

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
  const notification = useNotification();
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
      notification.show(
        "failed",
        intl.formatMessage({ id: "error.transaction-failed" }),
        ""
      );
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
      history.back();
      setIsLedgerInteracting(false);
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
          left: <CancelIcon />,
          text: intl.formatMessage({ id: "button.reject" }),
          size: "large",
          color: "danger",
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
            approve();
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
                <Box
                  as={"pre"}
                  padding="0.25rem"
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
              padding="0.25rem"
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
        <Box>
          <YAxis alignX="center">
            <Box
              paddingBottom="0.21rem"
              cursor="pointer"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <XAxis alignY="center">
                <Box minWidth="0.875rem" />
                <Body2
                  color={(() => {
                    return theme.mode === "light"
                      ? ColorPalette["purple-400"]
                      : ColorPalette["white"];
                  })()}
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: "0.2rem",
                  }}
                >
                  {
                    <FormattedMessage
                      id="components.input.fee-control.fee"
                      values={{
                        assets: ` ${
                          toDisplay(
                            feeResult?.feeTrx?.amount,
                            chainInfo.stakeCurrency.coinDecimals
                          ) ?? 0
                        } 
                    ${
                      feeResult?.feeTrx?.denom?.toUpperCase() ??
                      chainInfo.feeCurrencies[0].coinDenom
                    }`,
                      }}
                    />
                  }
                </Body2>
                {/* <Body2
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-300"]
                  }
                  style={{
                    textDecoration: "underline",
                    whiteSpace: "pre-wrap",
                    textUnderlineOffset: "0.2rem",
                  }}
                ></Body2> */}
              </XAxis>
            </Box>
          </YAxis>
        </Box>
        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isEthereum: true,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
        <div
          style={{
            borderTop: "1px solid" + ColorPalette["gray-100"],
            marginTop: 8,
          }}
        >
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              padding: 8,
              justifyContent: "space-between",
              backgroundColor: ColorPalette["gray-50"],
              borderRadius: 12,
              marginTop: 8,
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
                <Subtitle3
                  style={{
                    padding: "2px 6px",
                  }}
                  color={ColorPalette["gray-500"]}
                >
                  {keyRingStore.selectedKeyInfo?.name || "OWallet Account"}
                </Subtitle3>
                <AddressChip chainId={chainId} />
              </div>
            </div>
          </div>
        </div>
      </Box>
    </HeaderLayout>
  );
});
