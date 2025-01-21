import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { SignBtcInteractionStore } from "@owallet/stores-core";
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
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { Gutter } from "../../../components/gutter";
import accumulative from "coinselect/accumulative";
import {
  useAmountConfig,
  useBtcFeeConfig,
  useMemoConfig,
  useRecipientConfig,
  useSenderConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { ApproveIcon, CancelIcon } from "../../../components/button";
import { MessageItem } from "../components/message-item";
import { useNotification } from "../../../hooks/notification";
import { AddressChip } from "pages/main/components/address-chip";
import { UnsignedBtcTransaction } from "@owallet/types";
import {
  Utxos,
  UtxosWithNonWitness,
  UtxosWithWitness,
} from "@owallet/stores-btc/build/queries/types";
import { simpleFetch } from "@owallet/simple-fetch";
import { compileMemo } from "@owallet/common";
import * as bitcoin from "bitcoinjs-lib";
import { Dec, DecUtils } from "@owallet/unit";
import { getAddressInfo } from "bitcoin-address-validation";
import { PubKeySecp256k1 } from "@owallet/crypto";
import { handleBTCPreSignByLedger } from "../utils/handle-btc-sign";
import { useUnmount } from "hooks/use-unmount";
import { FeeSummary } from "../components/fee-summary";
import { FeeControl } from "components/input/fee-control";
import { handleExternalInteractionWithNoProceedNext } from "src/utils";
import { useNavigate } from "react-router";

export const BTCSigningView: FunctionComponent<{
  interactionData: NonNullable<SignBtcInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    chainStore,
    uiConfigStore,
    signBtcInteractionStore,
    bitcoinAccountStore,
    queriesStore,
    keyRingStore,
  } = useStore();
  const intl = useIntl();
  const theme = useTheme();
  const notification = useNotification();

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signBtcInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });
  const navigate = useNavigate();

  const { chainId } = interactionData.data;
  const [isViewData, setIsViewData] = useState(true);
  const chainInfo = chainStore.getChain(chainId);
  const signer = interactionData.data.signer;
  const utxos = queriesStore
    .get(chainId)
    .bitcoin.queryBtcUtxos.getQueryBtcAddress(signer).utxos;
  const [utxosData, setUtxosData] = useState([]);
  const [utxosWithHex, setUtxosWithHex] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const accountBtc = bitcoinAccountStore.getAccount(chainId);
  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  useEffect(() => {
    if (!utxos || !signer) return;
    (async () => {
      const info = getAddressInfo(signer);
      if (!info.bech32) {
        const utxosNonWitness = await fetchUxtosNonWitness(utxos);
        setUtxosData(utxosNonWitness);
      } else {
        const utxosWitness = getUxtosWitness(utxos);
        setUtxosData(utxosWitness);
      }
      if (interactionData.data.keyType === "ledger") {
        const utxosNonWitness = await fetchUxtosWithHex(utxos);
        setUtxosWithHex(utxosNonWitness);
      }
    })();
  }, [utxos, signer]);
  const getInputsAndOutput = () => {
    const targetOutputs = [];
    if (!utxosData?.length)
      return {
        inputs: [],
        outputs: [],
      };
    const compiledMemo = memoConfig.memo ? compileMemo(memoConfig.memo) : null;
    const amountData = new Dec(amountConfig.amountNotSubFee || 0).mul(
      DecUtils.getTenExponentN(feeConfig.fees?.[0].currency.coinDecimals)
    );
    const feeRate = feeConfig.getGasPriceForFeeCurrency(
      feeConfig.fees?.[0].currency,
      uiConfigStore.lastFeeOption || "average"
    );
    targetOutputs.push({
      address: recipientConfig.recipient,
      value: Number(amountData.roundUp().toString()),
    });
    if (compiledMemo) {
      targetOutputs.push({ script: compiledMemo, value: 0 });
    }
    const { inputs, outputs } = accumulative(
      utxosData,
      targetOutputs,
      Number(feeRate.roundUp().toString())
    );
    setInputs(inputs);
    setOutputs(outputs);
    return { inputs, outputs };
  };
  const fetchUxtosNonWitness = async (
    utxos: Utxos[]
  ): Promise<UtxosWithNonWitness[]> => {
    return Promise.all(
      utxos.map(async (item) => {
        try {
          // Fetch the nonWitnessUtxo data (assuming the response contains the raw transaction hex as a string)
          const res = await simpleFetch<string>(
            chainInfo.rest,
            `/tx/${item.txid}/hex`
          );
          return {
            ...item,
            nonWitnessUtxo: res.data, // Convert the raw hex to Buffer
          };
        } catch (error) {
          console.error(`Error fetching UTXO for txId: ${item.txid}`, error);
          return {
            ...item,
            nonWitnessUtxo: null,
          };
        }
      })
    );
  };
  const fetchUxtosWithHex = async (
    utxos: Utxos[]
  ): Promise<UtxosWithNonWitness[]> => {
    return Promise.all(
      utxos.map(async (item) => {
        try {
          // Fetch the nonWitnessUtxo data (assuming the response contains the raw transaction hex as a string)
          const res = await simpleFetch<string>(
            chainInfo.rest,
            `/tx/${item.txid}/hex`
          );
          return {
            ...item,
            hex: res.data, // Convert the raw hex to Buffer
          };
        } catch (error) {
          console.error(`Error fetching UTXO for txId: ${item.txid}`, error);
          return {
            ...item,
            hex: null,
          };
        }
      })
    );
  };
  const getUxtosWitness = (utxos: Utxos[]): UtxosWithWitness[] => {
    const pubKey = new PubKeySecp256k1(accountBtc.pubKey);
    const p2wpkh = bitcoin.payments.p2wpkh({
      //@ts-ignore
      pubkey: Buffer.from(
        pubKey.toKeyPair().getPublic().encodeCompressed("hex"),
        "hex"
      ),
    });
    return utxos.map((item) => {
      return {
        ...item,
        witnessUtxo: {
          script: p2wpkh.output,
          value: item.value,
        },
      };
    });
  };

  const senderConfig = useSenderConfig(chainStore, chainId, signer);
  const amountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    chainId,
    senderConfig
  );
  const recipientConfig = useRecipientConfig(chainStore, chainId);
  const memoConfig = useMemoConfig(chainStore, chainId);
  const feeConfig = useBtcFeeConfig(
    chainStore,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    recipientConfig,
    memoConfig
  );
  const txConfigsValidate = useTxConfigsValidate({
    senderConfig,
    gasConfig: null,
    amountConfig,
    feeConfig,
    memoConfig,
  });

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
  const buttonDisabled = txConfigsValidate.interactionBlocked;
  const isLoading = isLedgerInteracting;

  useEffect(() => {
    const data = interactionData.data;
    const unsignedTx: UnsignedBtcTransaction = JSON.parse(
      Buffer.from(data.message).toString()
    );
    if (unsignedTx) {
      const { coinMinimalDenom, amount, to } = unsignedTx;
      recipientConfig.setValue(to);
      const currency = chainInfo.forceFindCurrency(coinMinimalDenom);
      amountConfig.setCurrency(currency);
      amountConfig.setValue(amount);
      feeConfig.setFee({
        type: uiConfigStore.lastFeeOption || "average",
        currency: currency,
      });
      if (!utxosData?.length) return;
      getInputsAndOutput();
    }
  }, [chainInfo.currencies, feeConfig, interactionData.data, utxosData]);

  const signingDataText = useMemo(() => {
    return JSON.stringify(
      JSON.parse(Buffer.from(interactionData.data.message).toString()),
      null,
      2
    );
  }, [interactionData.data]);
  const approve = async () => {
    try {
      if (!inputs?.length || !outputs?.length) return;
      let signature;
      if (interactionData.data.keyType === "ledger") {
        if (!utxosWithHex?.length) return;
        setIsLedgerInteracting(true);
        setLedgerInteractingError(undefined);
        const info = getAddressInfo(signer);
        signature = await handleBTCPreSignByLedger(
          interactionData,
          Buffer.from(signingDataText),
          info.bech32 ? "84" : "44",
          utxosWithHex,
          inputs,
          outputs,
          {
            useWebHID: uiConfigStore.useWebHIDLedger,
          }
        );
      }

      await signBtcInteractionStore.approveWithProceedNext(
        interactionData.id,
        Buffer.from(signingDataText),
        inputs,
        outputs,
        // TODO: Ledger support
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
          // noop
          notification.show(
            "success",
            intl.formatMessage({
              id: "notification.transaction-success",
            }),
            ""
          );
        },
        {
          preDelay: 200,
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
      history.back();
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
            await signBtcInteractionStore.rejectWithProceedNext(
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
          disabled: buttonDisabled,
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
                  {(() => {
                    if (interactionData.isInternal) {
                      return (
                        <FeeSummary feeConfig={feeConfig} gasConfig={null} />
                      );
                    }

                    return (
                      <FeeControl
                        feeConfig={feeConfig}
                        senderConfig={senderConfig}
                        gasConfig={null}
                        gasSimulator={null}
                      />
                    );
                  })()}
                </Body2>
                <Body2
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
                ></Body2>
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
