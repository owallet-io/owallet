import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AddressInput,
  FeeButtons,
  CoinInput,
  MemoInput,
} from "components/form";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";
import style from "./style.module.scss";
import { MsgSend } from "@owallet/proto-types/cosmos/bank/v1beta1/tx";
import { useIntl } from "react-intl";
import cn from "classnames/bind";
import { useHistory, useLocation } from "react-router";
import queryString from "querystring";
import { useSendTxConfig } from "@owallet/hooks";
import { fitPopupWindow } from "@owallet/popup";
import { useLanguage } from "@owallet/common";
import { ModalChooseTokens } from "pages/modals/modal-choose-tokens";
import { Text } from "components/common/text";
import { Button } from "components/common/button";
import colors from "theme/colors";
import useOnClickOutside from "hooks/use-click-outside";
import { ModalFee } from "pages/modals/modal-fee";
import { Card } from "components/common/card";
import { HeaderModal } from "pages/home/components/header-modal";
import { HeaderNew } from "layouts/footer-layout/components/header";
import { toast } from "react-toastify";
import { CosmosMsgOpts } from "@owallet/stores";
const cx = cn.bind(style);

export const SendPage: FunctionComponent<{
  coinMinimalDenom?: string;
}> = observer(({ coinMinimalDenom }) => {
  const history = useHistory();
  const {
    chainStore,
    accountStore,
    keyRingStore,
    queriesStore,
    analyticsStore,
    priceStore,
  } = useStore();
  const language = useLanguage();
  const [gasMsgSend, setGasMsgSend] = useState<CosmosMsgOpts["send"]>();
  const [openSetting, setOpenSetting] = useState(false);
  const settingRef = useRef();

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

  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const walletAddress = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  console.log(gasMsgSend, "gasMsgSend");
  const sendConfigs = useSendTxConfig(
    chainStore,
    current.chainId,
    //@ts-ignore
    gasMsgSend || accountInfo.msgOpts.send,
    walletAddress,
    queriesStore.get(current.chainId).queryBalances
  );

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

  useEffect(() => {
    if (query.defaultDenom) {
      const currency = current.currencies.find(
        (cur) => cur.coinMinimalDenom === query.defaultDenom
      );

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [current.currencies, query.defaultDenom, sendConfigs.amountConfig]);

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
  const simulateTx = async () => {
    try {
      const simulateTx = await accountInfo.cosmos.simulateTx(
        [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: MsgSend.encode({
              fromAddress: accountInfo.bech32Address,
              toAddress: sendConfigs.recipientConfig.recipient,
              amount: [sendConfigs.amountConfig.getAmountPrimitive()],
            }).finish(),
          },
        ],
        {
          amount: sendConfigs.feeConfig.toStdFee()?.amount ?? [],
        },
        sendConfigs.memoConfig.memo
      );
      if (!simulateTx?.gasUsed) {
        setGasMsgSend(null);
        return;
      }
      setGasMsgSend({
        native: {
          type: "cosmos-sdk/MsgSend",
          gas: Math.floor(simulateTx?.gasUsed * 1.3),
        },
      });
    } catch (error) {
      setGasMsgSend(null);
      console.error("SimulateTx Estimate Error", error);
    }
  };
  useEffect(() => {
    if (!txStateIsValid) return;
    simulateTx();
    return () => {};
  }, [
    sendConfigs.amountConfig.amount,
    sendConfigs.recipientConfig.recipient,
    txStateIsValid,
  ]);

  return (
    <div
      style={{
        height: "100%",
        width: "100vw",
        overflow: "scroll",
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
              const stdFee = sendConfigs.feeConfig.toStdFee();
              // (window as any).accountInfo = accountInfo;
              await accountInfo.sendToken(
                sendConfigs.amountConfig.amount,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                sendConfigs.amountConfig.sendCurrency,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo,
                stdFee,
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
                    toast(
                      tx?.data
                        ? `Transaction successful with tx: ${tx?.hash}`
                        : `Transaction failed with tx: ${tx?.hash}`,
                      {
                        type: tx?.data ? "success" : "error",
                      }
                    );
                  },
                }
              );
              if (!isDetachedPage) {
                history.replace("/");
              }
              toast("Transaction submitted!", {
                type: "success",
              });
            } catch (e: any) {
              if (!isDetachedPage) {
                history.replace("/");
              }
              console.log(e.message, "Catch Error on send!!!");

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
        <div className={style.container}>
          <div
            style={{
              height: "80%",
              overflowX: "auto",
              padding: 16,
              paddingLeft: 20,
              paddingTop: 0,
            }}
          >
            <div style={{ paddingBottom: 12 }}>
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
                    label={intl.formatMessage({ id: "send.input.memo" })}
                    placeholder="Required if send to CEX"
                  />
                </Card>

                <div style={{ display: "none" }}>
                  <FeeButtons
                    feeConfig={sendConfigs.feeConfig}
                    gasConfig={sendConfigs.gasConfig}
                    priceStore={priceStore}
                    label={intl.formatMessage({ id: "send.input.fee" })}
                    feeSelectLabels={{
                      low: intl.formatMessage({
                        id: "fee-buttons.select.slow",
                      }),
                      average: intl.formatMessage({
                        id: "fee-buttons.select.average",
                      }),
                      high: intl.formatMessage({
                        id: "fee-buttons.select.fast",
                      }),
                    }}
                    gasLabel={intl.formatMessage({ id: "send.input.gas" })}
                  />
                </div>
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
                onClick={async (e) => {}}
              >
                {intl.formatMessage({
                  id: "send.button.send",
                })}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
});
