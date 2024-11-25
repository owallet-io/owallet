import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import {
  AddressInput,
  FeeButtons,
  CoinInput,
  MemoInput,
} from "components/form";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";
import style from "../send-cosmos/style.module.scss";

import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";
import queryString from "querystring";
import { useSendTxConfig } from "@owallet/hooks";
import { fitPopupWindow } from "@owallet/popup";
import { EthereumEndpoint, useLanguage } from "@owallet/common";
import { BtcToSats } from "@owallet/bitcoin";
import { Address } from "@owallet/crypto";
import { HeaderNew } from "layouts/footer-layout/components/header";
import { HeaderModal } from "pages/home/components/header-modal";
import { ModalFee } from "pages/modals/modal-fee";
import { ModalChooseTokens } from "pages/modals/modal-choose-tokens";
import colors from "theme/colors";
import useOnClickOutside from "hooks/use-click-outside";
import { Text } from "components/common/text";
import { Card } from "components/common/card";
import { Button } from "components/common/button";
import { toast } from "react-toastify";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";
import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import { CoinPrimitive } from "@owallet/stores";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

export const SendSolanaPage: FunctionComponent<{
  coinMinimalDenom?: string;
}> = observer(({ coinMinimalDenom }) => {
  const {
    chainStore,
    accountStore,
    priceStore,
    queriesStore,
    analyticsStore,
    keyRingStore,
  } = useStore();
  const { chainId, currencies } = chainStore.current;

  const language = useLanguage();
  const [openSetting, setOpenSetting] = useState(false);
  const settingRef = useRef();
  const history = useHistory();
  useOnClickOutside(settingRef, () => {
    setOpenSetting(false);
  });
  const [isShowSelectToken, setSelectToken] = useState(false);

  let search = useLocation().search || coinMinimalDenom || "";
  if (search.startsWith("?")) {
    search = search.slice(1);
  }
  const query = queryString.parse(search) as {
    defaultDenom: string | undefined;
    defaultRecipient: string | undefined;
    defaultAmount: string | undefined;
    defaultMemo: string | undefined;
    detached: string | undefined;
  };
  const inputRef = React.useRef(null);
  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [coinMinimalDenom]);
  const intl = useIntl();

  const accountInfo = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  const address = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    //@ts-ignore
    accountInfo.msgOpts["send"],
    address,
    queries.queryBalances,
    EthereumEndpoint
  );

  useEffect(() => {
    if (query.defaultDenom) {
      const currency = currencies.find(
        (cur) => cur.coinMinimalDenom === query.defaultDenom
      );

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [currencies, query.defaultDenom, sendConfigs.amountConfig]);

  const isDetachedPage = query.detached === "true";

  useEffect(() => {
    if (isDetachedPage) {
      fitPopupWindow();
    }
  }, [isDetachedPage]);

  useEffect(() => {
    if (query.defaultRecipient) {
      sendConfigs.recipientConfig.setRawRecipient(query.defaultRecipient);
    }
    if (query.defaultAmount) {
      sendConfigs.amountConfig.setAmount(query.defaultAmount);
    }
    if (query.defaultMemo) {
      sendConfigs.memoConfig.setMemo(query.defaultMemo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.defaultAmount, query.defaultMemo, query.defaultRecipient]);

  useEffect(() => {
    // @ts-ignore
    const token = history.location.state?.token;
    if (token) {
      const selectedKey = token.token?.currency?.coinMinimalDenom;
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === selectedKey
      );
      sendConfigs.amountConfig.setSendCurrency(currency);
    }
    // @ts-ignore
  }, [history.location.state?.token]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
  useEffect(() => {
    (async () => {
      try {
        if (!txStateIsValid) return;
        const connection = new Connection(chainStore.current.rpc, "confirmed");
        const fromPublicKey = new PublicKey(address);
        const toPublicKey = new PublicKey(
          sendConfigs.recipientConfig.recipient
        );
        const amount = sendConfigs.amountConfig.getAmountPrimitive().amount; //0.001 sol

        let transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: toPublicKey,
            lamports: BigInt(amount),
          })
        );
        if (
          sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.startsWith(
            "spl"
          )
        ) {
          const mintPublicKey = new PublicKey(
            sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.replace(
              "spl:",
              ""
            )
          );
          // Get the associated token accounts for the sender and receiver
          const senderTokenAccount = await getAssociatedTokenAddress(
            mintPublicKey,
            fromPublicKey
          );
          const receiverTokenAccount = await getAssociatedTokenAddress(
            mintPublicKey,
            toPublicKey
          );

          // Create SPL token transfer instruction
          const transferInstruction = createTransferInstruction(
            senderTokenAccount, // Sender's token account
            receiverTokenAccount, // Receiver's token account
            fromPublicKey, // Payer's public key
            BigInt(amount) // Amount to transfer (raw amount, not adjusted for decimals)
          );

          // Create a transaction
          transaction = new Transaction().add(transferInstruction);
        }
        if (sendConfigs.memoConfig.memo) {
          transaction.add(createMemoInstruction(sendConfigs.memoConfig.memo));
        }
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPublicKey;
        const message = transaction.compileMessage();
        const feeInLamports = await connection.getFeeForMessage(message);
        if (feeInLamports === null) {
          throw new Error("Unable to estimate the fee");
        }
        const simulationResult = await connection.simulateTransaction(
          transaction
        );
        if (!simulationResult.value.unitsConsumed)
          throw new Error("Unable to estimate the fee");
        const DefaultUnitLimit = new Dec(200_000);
        const unitsConsumed = new Dec(simulationResult.value.unitsConsumed);
        const units = unitsConsumed.lte(DefaultUnitLimit)
          ? DefaultUnitLimit
          : unitsConsumed.mul(new Dec(1.2)); // Request up to 1,000,000 compute units
        const microLamports = new Dec(50000);
        transaction.add(
          // Request a specific number of compute units
          ComputeBudgetProgram.setComputeUnitLimit({
            units: Number(units.roundUp().toString()),
          }),
          // Attach a priority fee (in lamports)
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: Number(microLamports.roundUp().toString()), // Set priority fee per compute unit in micro-lamports
          })
        );
        const baseFee = new Dec(feeInLamports.value);
        const PriorityFee = units
          .mul(microLamports)
          .quoTruncate(DecUtils.getTenExponentNInPrecisionRange(6));
        const fee = {
          amount: baseFee.add(PriorityFee).roundUp().toString(),
          denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom,
        } as CoinPrimitive;
        sendConfigs.feeConfig.setManualFee(fee);
      } catch (e) {
        console.log(e, "err solana");
      }
    })();
  }, [
    txStateIsValid,
    sendConfigs.recipientConfig.recipient,
    sendConfigs.amountConfig.amount,
    sendConfigs.memoConfig.memo,
    sendConfigs.amountConfig.sendCurrency.coinMinimalDenom,
  ]);
  useEffect(() => {
    sendConfigs.feeConfig.setManualFee(undefined);
    sendConfigs.feeConfig.setFeeType(undefined);
  }, [sendConfigs.amountConfig.sendCurrency.coinMinimalDenom]);
  const fee =
    sendConfigs.feeConfig.fee ||
    new CoinPretty(chainStore.current.stakeCurrency, new Dec(0));
  const renderTransactionFee = () => {
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid" + colors["neutral-border-default"],
            paddingBottom: 14,
          }}
        >
          <div>
            <Text weight="600">Tx Fee</Text>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                cursor: "pointer",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text
                size={15}
                weight="600"
                color={colors["primary-text-action"]}
              >
                {`≈ ${fee?.maxDecimals(6).trim(true).toString()}`}
              </Text>
              <Text size={13} color={colors["neutral-text-body"]}>
                (
                {priceStore
                  .calculatePrice(fee, language.fiatCurrency)
                  ?.toString()}
                )
              </Text>
              {/*<img src={require("assets/icon/tdesign_chevron-down.svg")}/>*/}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          height: "100%",
          width: "100vw",
          overflowX: "auto",
          backgroundColor: colors["neutral-surface-bg"],
        }}
      >
        <ModalChooseTokens
          onRequestClose={() => {
            setSelectToken(false);
          }}
          amountConfig={sendConfigs.amountConfig}
          isOpen={isShowSelectToken}
        />
        <ModalFee
          feeConfig={sendConfigs.feeConfig}
          gasConfig={sendConfigs.gasConfig}
          onRequestClose={() => {
            setOpenSetting(false);
          }}
          isOpen={openSetting}
        />

        <HeaderNew
          showNetwork={true}
          isDisableCenterBtn={true}
          isGoBack
          isConnectDapp={false}
        />
        <HeaderModal title={"Send".toUpperCase()} />
        <form
          className={style.formContainer}
          onSubmit={async (e: any) => {
            e.preventDefault();
            if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
              try {
                // (window as any).accountInfo = accountInfo;
                await accountInfo.sendSolanaToken(
                  sendConfigs.amountConfig.getAmountPrimitive().amount,
                  sendConfigs.amountConfig.sendCurrency,
                  sendConfigs.recipientConfig.recipient,
                  sendConfigs.memoConfig.memo,
                  {
                    onBroadcasted: () => {
                      analyticsStore.logEvent("Send token tx broadcasted", {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        feeType: sendConfigs.feeConfig.feeType,
                      });
                    },
                    onFulfill: (tx) => {
                      const url =
                        chainStore?.current?.raw?.txExplorer.txUrl.replace(
                          "{txHash}",
                          tx
                        );
                      toast(
                        tx ? (
                          <div className="alert-inner--text">
                            Transaction successful with tx:{" "}
                            <a target="_blank" href={url} rel="noreferrer">
                              {Address.shortAddress(tx)}
                            </a>
                          </div>
                        ) : (
                          `Transaction failed`
                        ),
                        {
                          type: tx ? "success" : "error",
                        }
                      );
                    },
                  }
                );
                if (!isDetachedPage) {
                  history.replace("/");
                }
              } catch (e: any) {
                if (!isDetachedPage) {
                  history.replace("/");
                }
                toast(`Fail to send token: ${e.message}`, {
                  type: "error",
                });
              } finally {
                // XXX: If the page is in detached state,
                // close the window without waiting for tx to commit. analytics won't work.
                if (isDetachedPage) {
                  window.close();
                }
              }
            }
          }}
        >
          <div
            style={{
              padding: 16,
              paddingTop: 0,
            }}
            className={style.formInnerContainer}
          >
            <div>
              <AddressInput
                inputStyle={{
                  borderWidth: 0,
                  padding: 0,
                  margin: 0,
                }}
                inputRef={inputRef}
                recipientConfig={sendConfigs.recipientConfig}
                memoConfig={sendConfigs.memoConfig}
                label={intl.formatMessage({ id: "send.input.recipient" })}
                placeholder="Enter recipient address"
              />
              <CoinInput
                openSelectToken={() => setSelectToken(true)}
                amountConfig={sendConfigs.amountConfig}
                label={intl.formatMessage({ id: "send.input.amount" })}
                balanceText={intl.formatMessage({
                  id: "send.input-button.balance",
                })}
                placeholder="Enter your amount"
              />
              <Card
                containerStyle={{
                  backgroundColor: colors["neutral-surface-card"],
                  padding: 16,
                  borderRadius: 24,
                }}
              >
                {renderTransactionFee()}
                <MemoInput
                  inputStyle={{
                    borderWidth: 0,
                    padding: 0,
                  }}
                  memoConfig={sendConfigs.memoConfig}
                  label={"Message"}
                  placeholder="Enter your message"
                />
              </Card>

              <div style={{ display: "none" }}>
                <FeeButtons
                  feeConfig={sendConfigs.feeConfig}
                  gasConfig={sendConfigs.gasConfig}
                  priceStore={priceStore}
                  label={intl.formatMessage({ id: "send.input.fee" })}
                  feeSelectLabels={{
                    low: intl.formatMessage({ id: "fee-buttons.select.slow" }),
                    average: intl.formatMessage({
                      id: "fee-buttons.select.average",
                    }),
                    high: intl.formatMessage({ id: "fee-buttons.select.fast" }),
                  }}
                  isGasInput={false}
                  gasLabel={intl.formatMessage({ id: "send.input.gas" })}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "12%",
              backgroundColor: colors["neutral-surface-card"],
              borderTop: "1px solid" + colors["neutral-border-default"],
            }}
          >
            <div
              style={{
                flexDirection: "row",
                display: "flex",
                padding: 16,
                paddingTop: 0,
              }}
            >
              <Button
                type="submit"
                loading={accountInfo.isSendingMsg === "send"}
                data-loading={accountInfo.isSendingMsg === "send"}
                disabled={!accountInfo.isReadyToSendMsgs || !txStateIsValid}
                className={style.sendBtn}
                style={{
                  cursor:
                    accountInfo.isReadyToSendMsgs || !txStateIsValid
                      ? ""
                      : "pointer",
                }}
              >
                <span className={style.sendBtnText}>
                  {intl.formatMessage({
                    id: "send.button.send",
                  })}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
});
