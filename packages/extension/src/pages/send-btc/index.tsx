import React, { FunctionComponent, useEffect, useState } from "react";
import {
  AddressInput,
  FeeButtons,
  CoinInput,
  MemoInput,
} from "../../components/form";
import { useStore } from "../../stores";

import { observer } from "mobx-react-lite";

import style from "../send/style.module.scss";
import { useNotification } from "../../components/notification";

import { useIntl } from "react-intl";
import { Button } from "reactstrap";

import { useHistory, useLocation } from "react-router";
import queryString from "querystring";

import { useSendTxConfig } from "@owallet/hooks";
import { fitPopupWindow, openPopupWindow, PopupSize } from "@owallet/popup";
import { EthereumEndpoint } from "@owallet/common";
import { BtcToSats } from "@owallet/bitcoin";
import { CoinInputBtc } from "../../components/form/coin-input-btc";
import { Address } from "@owallet/crypto";

export const SendBtcPage: FunctionComponent<{
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
  const { chainId, networkType, currencies, stakeCurrency } =
    chainStore.current;
  const history = useHistory();
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

  const notification = useNotification();

  const accountInfo = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);
  const address = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const data =
    queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.response
      ?.data;
  const utxos = data?.utxos;
  const confirmedBalance = data?.balance;
  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    //@ts-ignore
    accountInfo.msgOpts["send"],
    address,
    queries.queryBalances,
    EthereumEndpoint,
    queries.bitcoin.queryBitcoinBalance
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

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
  const refreshBalance = async (address) => {
    try {
      await queries.bitcoin.queryBitcoinBalance
        .getQueryBalance(address)
        .waitFreshResponse();
    } catch (error) {
      console.log(
        "🚀 ~ file: send-btc.tsx:112 ~ refreshBalance ~ error:",
        error
      );
    }
  };
  useEffect(() => {
    if (accountInfo.bech32Address) {
      refreshBalance(accountInfo.bech32Address);
      return;
    }

    return () => {};
  }, [accountInfo.bech32Address]);

  return (
    <>
      <form
        className={style.formContainer}
        onSubmit={async (e: any) => {
          e.preventDefault();
          if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
            try {
              (window as any).accountInfo = accountInfo;
              await accountInfo.sendToken(
                sendConfigs.amountConfig.amount,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                sendConfigs.amountConfig.sendCurrency,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo,
                sendConfigs.feeConfig.toStdFee(),
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                  networkType: chainStore.current.networkType,
                  chainId: chainStore.current.chainId,
                },
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
                    notification.push({
                      placement: "top-center",
                      type: tx ? "success" : "danger",
                      duration: 5,
                      content: tx ? (
                        <div className="alert-inner--text">
                          Transaction successful with tx:{" "}
                          <a target="_blank" href={url}>
                            {Address.shortAddress(tx)}
                          </a>
                        </div>
                      ) : (
                        `Transaction failed`
                      ),
                      canDelete: true,
                      transition: {
                        duration: 0.25,
                      },
                    });
                  },
                },
                {
                  confirmedBalance: confirmedBalance,
                  utxos: utxos,
                  blacklistedUtxos: [],
                  amount: BtcToSats(Number(sendConfigs.amountConfig.amount)),
                  feeRate:
                    sendConfigs.feeConfig.feeRate[
                      sendConfigs.feeConfig.feeType
                    ],
                } as any
              );
              if (!isDetachedPage) {
                history.replace("/");
              }
              // notification.push({
              //   placement: 'top-center',
              //   type: 'success',
              //   duration: 5,
              //   content: 'Transaction submitted!',
              //   canDelete: true,
              //   transition: {
              //     duration: 0.25
              //   }
              // });
            } catch (e: any) {
              if (!isDetachedPage) {
                history.replace("/");
              }

              notification.push({
                type: "warning",
                placement: "top-center",
                duration: 5,
                content: `Fail to send token: ${e.message}`,
                canDelete: true,
                transition: {
                  duration: 0.25,
                },
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
        <div className={style.formInnerContainer}>
          <div>
            <AddressInput
              inputRef={inputRef}
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              label={intl.formatMessage({ id: "send.input.recipient" })}
              placeholder="Enter recipient address"
            />
            <CoinInputBtc
              amountConfig={sendConfigs.amountConfig}
              label={intl.formatMessage({ id: "send.input.amount" })}
              balanceText={intl.formatMessage({
                id: "send.input-button.balance",
              })}
              placeholder="Enter your amount"
            />
            <MemoInput
              memoConfig={sendConfigs.memoConfig}
              label={"Message"}
              placeholder="Enter your message"
            />
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
          <div style={{ flex: 1 }} />
          <Button
            type="submit"
            block
            // data-loading={accountInfo.isSendingMsg === 'send'}
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
      </form>
    </>
  );
});
