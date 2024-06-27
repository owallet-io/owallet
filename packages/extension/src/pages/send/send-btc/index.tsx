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
import { useNotification } from "components/notification";

import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";
import queryString from "querystring";
import { useSendTxConfig } from "@owallet/hooks";
import { fitPopupWindow } from "@owallet/popup";
import { EthereumEndpoint, useLanguage } from "@owallet/common";
import { BtcToSats } from "@owallet/bitcoin";
import { CoinInputBtc } from "components/form/coin-input-btc";
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

  const renderTransactionFee = () => {
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottom: "1px solid" + colors["neutral-border-default"],
            paddingBottom: 14,
          }}
          onClick={() => {
            setOpenSetting(true);
          }}
        >
          <div
            style={{
              flexDirection: "column",
              display: "flex",
            }}
          >
            <div>
              <Text weight="600">Transaction fee</Text>
            </div>
          </div>
          <div
            style={{
              flexDirection: "column",
              display: "flex",
              alignItems: "flex-end",
              width: "50%",
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
                ≈
                {priceStore
                  .calculatePrice(
                    sendConfigs.feeConfig.fee,
                    language.fiatCurrency
                  )
                  ?.toString() || 0}
              </Text>
              <img src={require("assets/icon/tdesign_chevron-down.svg")} />
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
          padding: 16,
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

        <HeaderNew isDisableCenterBtn={true} isGoBack isConnectDapp={false} />
        <HeaderModal title={"Send".toUpperCase()} />
        <form
          className={style.formContainer}
          onSubmit={async (e: any) => {
            e.preventDefault();
            if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
              try {
                // (window as any).accountInfo = accountInfo;
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
                            <a target="_blank" href={url} rel="noreferrer">
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
        </form>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "15%",
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
      </div>
    </>
  );
});
