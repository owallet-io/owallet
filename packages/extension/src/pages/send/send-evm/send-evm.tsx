import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import {
  AddressInput,
  FeeButtons,
  CoinInput,
  MemoInput,
} from "components/form";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";
import style from "./style.module.scss";

import { useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router";
import queryString from "querystring";
import { useSendTxEvmConfig } from "@owallet/hooks";
import { fitPopupWindow } from "@owallet/popup";
import {
  ChainIdEnum,
  EthereumEndpoint,
  OasisTransaction,
  getOasisNic,
  parseRoseStringToBigNumber,
  signerFromPrivateKey,
  useLanguage,
} from "@owallet/common";
import { Signer } from "@oasisprotocol/client/dist/signature";
import { HeaderNew } from "layouts/footer-layout/components/header";
import { HeaderModal } from "pages/home/components/header-modal";
import { ModalFee } from "pages/modals/modal-fee";
import { ModalChooseTokens } from "pages/modals/modal-choose-tokens";
import colors from "theme/colors";
import useOnClickOutside from "hooks/use-click-outside";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { Text } from "components/common/text";
import { toast } from "react-toastify";

export const SendEvmPage: FunctionComponent<{
  coinMinimalDenom?: string;
}> = observer(({ coinMinimalDenom }) => {
  const history = useHistory();
  const language = useLanguage();

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

  const {
    chainStore,
    accountStore,
    priceStore,
    queriesStore,
    analyticsStore,
    keyRingStore,
  } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );

  const [openSetting, setOpenSetting] = useState(false);
  const settingRef = useRef();

  useOnClickOutside(settingRef, () => {
    setOpenSetting(false);
  });
  const [isShowSelectToken, setSelectToken] = useState(false);

  const sendConfigs = useSendTxEvmConfig(
    chainStore,
    current.chainId,
    //@ts-ignore
    accountInfo.msgOpts.send,
    walletAddress,
    queriesStore.get(current.chainId).queryBalances,
    queriesStore.get(current.chainId),
    EthereumEndpoint
  );

  const { gas: gasErc20 } = queriesStore
    .get(current.chainId)
    .evmContract.queryGas.getGas({
      to: sendConfigs.recipientConfig.recipient,
      from: walletAddress,
      contract_address:
        sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.split(":")[1],
      amount: sendConfigs.amountConfig.amount,
    });
  const { gas: gasNative } = queriesStore
    .get(current.chainId)
    .evm.queryGas.getGas({
      to: sendConfigs.recipientConfig.recipient,
      from: walletAddress,
    });
  const { gasPrice } = queriesStore
    .get(current.chainId)
    .evm.queryGasPrice.getGasPrice();
  useEffect(() => {
    if (!gasPrice) return;
    sendConfigs.gasConfig.setGasPriceStep(gasPrice);
    if (
      sendConfigs.amountConfig?.sendCurrency?.coinMinimalDenom?.startsWith(
        "erc20"
      )
    ) {
      if (!gasErc20) return;
      sendConfigs.gasConfig.setGas(gasErc20);
      return;
    }
    if (!gasNative) return;

    sendConfigs.gasConfig.setGas(gasNative);
    return () => {};
  }, [gasNative, gasPrice, gasErc20, sendConfigs.amountConfig?.sendCurrency]);

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

  useEffect(() => {
    if (isDetachedPage) {
      fitPopupWindow();
    }
  }, [isDetachedPage]);

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
    // sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
  const submitSignOasis = async (tx) => {
    const { bytes, amount, to } = tx;
    const signer = signerFromPrivateKey(bytes);

    const bigIntAmount = BigInt(parseRoseStringToBigNumber(amount).toString());
    const nic = getOasisNic(chainStore.current.raw.grpc);
    const chainContext = await nic.consensusGetChainContext();

    const tw = await OasisTransaction.buildTransfer(
      nic,
      signer as Signer,
      to,
      bigIntAmount
    );

    await OasisTransaction.sign(chainContext, signer as Signer, tw);

    await OasisTransaction.submit(nic, tw);
    toast("Transaction successful", {
      type: "success",
    });
  };
  const onSend = async (e: any) => {
    e.preventDefault();
    if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
      try {
        const stdFee = sendConfigs.feeConfig.toStdEvmFee();
        // (window as any).accountInfo = accountInfo;
        await accountInfo.sendToken(
          sendConfigs.amountConfig.amount,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          sendConfigs.amountConfig.sendCurrency!,
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
              if (tx && chainStore.current.chainId === ChainIdEnum.Oasis) {
                submitSignOasis(tx);
                return;
              }
              if (!tx?.status) return;
              toast(
                tx?.data
                  ? `Transaction successful with tx: ${tx?.hash}`
                  : `Transaction failed with tx: ${tx?.hash}`,
                {
                  type: tx?.data ? "success" : "error",
                }
              );
            },
          },
          sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.startsWith(
            "erc20"
          )
            ? {
                type: "erc20",
                from: walletAddress,
                contract_addr:
                  sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.split(
                    ":"
                  )[1],
                recipient: sendConfigs.recipientConfig.recipient,
                amount: sendConfigs.amountConfig.amount,
              }
            : null
        );
        if (!isDetachedPage) {
          history.replace("/");
        }
        toast("Transaction submitted", {
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
        <form className={style.formContainer} onSubmit={onSend}>
          <div className={style.formInnerContainer}>
            <div style={{ padding: 16, paddingTop: 0 }}>
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
                  //   customFee={true}
                  priceStore={priceStore}
                  label={intl.formatMessage({ id: "send.input.fee" })}
                  feeSelectLabels={{
                    low: intl.formatMessage({ id: "fee-buttons.select.slow" }),
                    average: intl.formatMessage({
                      id: "fee-buttons.select.average",
                    }),
                    high: intl.formatMessage({ id: "fee-buttons.select.fast" }),
                  }}
                  gasLabel={intl.formatMessage({ id: "send.input.gas" })}
                />
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
          </div>
        </form>
      </div>
    </>
  );
});
