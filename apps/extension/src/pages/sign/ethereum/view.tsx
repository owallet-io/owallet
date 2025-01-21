import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { SignEthereumInteractionStore } from "@owallet/stores-core";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { Body2, Body3, H5, Subtitle3 } from "../../../components/typography";
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
  useSenderConfig,
  useZeroAllowedGasConfig,
} from "@owallet/hooks";
import { handleExternalInteractionWithNoProceedNext } from "../../../utils";
import { EthTxBase } from "../components/eth-tx/render/tx-base";
import { MemoryKVStore } from "@owallet/common";
import { CoinPretty, Dec, Int } from "@owallet/unit";
import { Image } from "../../../components/image";
import { Column, Columns } from "../../../components/column";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../components/button";
import Web3 from "web3-utils";
import { AddressChip } from "pages/main/components/address-chip";
import Color from "color";
import styled from "styled-components";

const Styles = {
  Container: styled.div<{
    forChange: boolean | undefined;
    isError: boolean;
    disabled?: boolean;
    isNotReady?: boolean;
  }>`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? props.isNotReady
          ? ColorPalette["skeleton-layer-0"]
          : ColorPalette.white
        : ColorPalette["gray-650"]};
    padding ${({ forChange }) =>
      forChange ? "0.5rem 0.25rem 0.35rem 0.75rem" : "0.75rem 0.5rem"};
    border-radius: 1rem;
    
    border: ${({ isError }) =>
      isError
        ? `1.5px solid ${Color(ColorPalette["yellow-400"])
            .alpha(0.5)
            .toString()}`
        : undefined};

    box-shadow: ${(props) =>
      props.theme.mode === "light" && !props.isNotReady
        ? "0px 2px 6px 0px rgba(43, 39, 55, 0.10)"
        : "none"};;
    
  `,
};

export const EthereumSigningView: FunctionComponent<{
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    chainStore,
    uiConfigStore,
    signEthereumInteractionStore,
    accountStore,
    ethereumAccountStore,
    queriesStore,
    keyRingStore,
  } = useStore();
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signEthereumInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });

  const { message, signType, signer, chainId } = interactionData.data;

  const account = accountStore.getAccount(chainId);
  const ethereumAccount = ethereumAccountStore.getAccount(chainId);
  const chainInfo = chainStore.getChain(chainId);

  const senderConfig = useSenderConfig(chainStore, chainId, signer);
  const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
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

  const [signingDataBuff, setSigningDataBuff] = useState(Buffer.from(message));
  const isTxSigning = signType === EthSignType.TRANSACTION;

  const gasSimulator = useGasSimulator(
    new MemoryKVStore("gas-simulator.ethereum.sign"),
    chainStore,
    chainInfo.chainId,
    gasConfig,
    feeConfig,
    "evm/native",
    () => {
      if (!isTxSigning) {
        throw new Error(
          "Gas simulator is only working for transaction signing"
        );
      }

      if (chainInfo.evm == null) {
        throw new Error("Gas simulator is only working with EVM info");
      }

      const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));

      return {
        simulate: () =>
          ethereumAccount.simulateGas(account.ethereumHexAddress, {
            to: unsignedTx.to,
            data: unsignedTx.data,
            value: unsignedTx.value,
          }),
      };
    }
  );

  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = (() => {
    if (isTxSigning) {
      const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
        feeConfig.getEIP1559TxFees(
          feeConfig.type === "manual"
            ? uiConfigStore.lastFeeOption || "average"
            : feeConfig.type
        );

      return maxFeePerGas && maxPriorityFeePerGas
        ? {
            maxFeePerGas: `0x${BigInt(
              maxFeePerGas.truncate().toString()
            ).toString(16)}`,
            maxPriorityFeePerGas: `0x${BigInt(
              maxPriorityFeePerGas.truncate().toString()
            ).toString(16)}`,
            gasPrice: undefined,
          }
        : {
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
            gasPrice: `0x${BigInt(
              gasPrice?.truncate().toString() ?? 0
            ).toString(16)}`,
          };
    }

    return {
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
      gasPrice: undefined,
    };
  })();

  useEffect(() => {
    if (isTxSigning) {
      const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));

      const gasLimitFromTx = BigInt(unsignedTx.gasLimit ?? unsignedTx.gas ?? 0);
      if (gasLimitFromTx > 0) {
        gasConfig.setValue(gasLimitFromTx.toString());

        const gasPriceFromTx = BigInt(
          unsignedTx.maxFeePerGas ?? unsignedTx.gasPrice ?? 0
        );
        if (gasPriceFromTx > 0) {
          feeConfig.setFee(
            new CoinPretty(
              chainInfo.currencies[0],
              new Dec(gasConfig.gas).mul(new Dec(gasPriceFromTx))
            )
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isTxSigning && !interactionData.isInternal) {
      const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));

      if (gasConfig.gas > 0) {
        unsignedTx.gasLimit = `0x${gasConfig.gas.toString(16)}`;

        if (!unsignedTx.maxFeePerGas && !unsignedTx.gasPrice) {
          unsignedTx.maxFeePerGas = `0x${new Int(
            feeConfig.getFeePrimitive()[0].amount
          )
            .div(new Int(gasConfig.gas))
            .toBigNumber()
            .toString(16)}`;
        }
      }

      if (
        !unsignedTx.maxPriorityFeePerGas &&
        !unsignedTx.gasPrice &&
        maxPriorityFeePerGas
      ) {
        unsignedTx.maxPriorityFeePerGas =
          unsignedTx.maxPriorityFeePerGas ?? maxPriorityFeePerGas;
      }

      if (
        !unsignedTx.gasPrice &&
        !unsignedTx.maxFeePerGas &&
        !unsignedTx.maxPriorityFeePerGas &&
        gasPrice
      ) {
        unsignedTx.gasPrice = gasPrice;
      }

      if (!unsignedTx.maxPriorityFeePerGas) {
        // set default maxPriorityFeePerGas to 1 gwei to avoid `transaction underpriced: gas tip cap 0` error
        unsignedTx.maxPriorityFeePerGas = Web3.toWei("1", "gwei");
      }

      setSigningDataBuff(Buffer.from(JSON.stringify(unsignedTx), "utf8"));
    }
  }, [
    gasConfig.gas,
    isTxSigning,
    message,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    gasSimulator,
    gasConfig,
    feeConfig,
    interactionData.isInternal,
  ]);

  useEffect(() => {
    (async () => {
      if (isTxSigning && chainInfo.features.includes("op-stack-l1-data-fee")) {
        const { to, gasLimit, value, data, chainId }: UnsignedTransaction =
          JSON.parse(Buffer.from(message).toString("utf8"));

        const l1DataFee = await ethereumAccount.simulateOpStackL1Fee({
          to,
          gasLimit,
          value,
          data,
          chainId,
        });
        feeConfig.setL1DataFee(new Dec(BigInt(l1DataFee)));
      }
    })();
  }, [chainInfo.features, ethereumAccount, feeConfig, isTxSigning, message]);

  useEffect(() => {
    if (isTxSigning) {
      // Refresh EIP-1559 fee every 12 seconds.
      const intervalId = setInterval(() => {
        feeConfig.refreshEIP1559TxFees();
      }, 12000);

      return () => clearInterval(intervalId);
    }
  }, [isTxSigning, feeConfig]);

  const signingDataText = useMemo(() => {
    switch (signType) {
      case EthSignType.MESSAGE:
        // If the message is 32 bytes, it's probably a hash.
        if (signingDataBuff.length === 32) {
          return signingDataBuff.toString("hex");
        } else {
          const text = (() => {
            const string = signingDataBuff.toString("utf8");
            if (string.startsWith("0x")) {
              return Buffer.from(string.slice(2), "hex").toString("utf8");
            }

            return string;
          })();

          // If the text contains RTL mark, escape it.
          return text.replace(/\u202E/giu, "\\u202E");
        }
      case EthSignType.TRANSACTION:
        return JSON.stringify(
          JSON.parse(signingDataBuff.toString("utf8")),
          null,
          2
        );
      case EthSignType.EIP712:
        return JSON.stringify(JSON.parse(signingDataBuff.toString()), null, 2);
      default:
        return signingDataBuff.toString("hex");
    }
  }, [signingDataBuff, signType]);

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

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: `page.sign.ethereum.${signType}.title`,
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
            await signEthereumInteractionStore.rejectWithProceedNext(
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
                signature = await handleEthereumPreSignByLedger(
                  interactionData,
                  Buffer.from(signingDataText),
                  {
                    useWebHID: uiConfigStore.useWebHIDLedger,
                  }
                );
              }

              await signEthereumInteractionStore.approveWithProceedNext(
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
                          <EthTxBase
                            icon={null}
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
              <Styles.Container>
                <FeeControl
                  feeConfig={feeConfig}
                  senderConfig={senderConfig}
                  gasConfig={gasConfig}
                  gasSimulator={gasSimulator}
                  isForEVMTx
                />
              </Styles.Container>
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
