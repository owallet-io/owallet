import React, { FunctionComponent, useEffect, useState } from "react";
import {
  AddressInput,
  CoinInput,
  CoinInputTronEvm,
  FeeButtons,
} from "../../components/form";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";

import style from "../send-evm/style.module.scss";
import { useNotification } from "../../components/notification";

import { useIntl } from "react-intl";
import { Button } from "reactstrap";

import { useHistory, useLocation } from "react-router";
import queryString from "querystring";
import {
  useFeeEthereumConfig,
  useSendTxConfig,
  useSendTxEvmConfig,
} from "@owallet/hooks";
import { fitPopupWindow } from "@owallet/popup";
import { EthereumEndpoint, getBase58Address } from "@owallet/common";

export const SendTronEvmPage: FunctionComponent<{
  coinMinimalDenom?: string;
  tokensTrc20Tron?: Array<any>;
}> = observer(({ coinMinimalDenom, tokensTrc20Tron }) => {
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

  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  const intl = useIntl();
  const inputRef = React.useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [coinMinimalDenom]);

  const notification = useNotification();

  const { chainStore, priceStore, accountStore, queriesStore, keyRingStore } =
    useStore();
  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);

  const sendConfigs = useSendTxEvmConfig(
    chainStore,
    current.chainId,
    //@ts-ignore
    accountInfo.msgOpts.send,
    accountInfo.evmosHexAddress,
    queriesStore.get(current.chainId).queryBalances,
    EthereumEndpoint
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.defaultAmount, query.defaultRecipient]);
  const feeConfig = useFeeEthereumConfig(chainStore, current.chainId);
  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError();
  const txStateIsValid = sendConfigError == null;
  const addressTron = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const tokenTrc20 =
    (tokensTrc20Tron &&
      query &&
      tokensTrc20Tron.find((token) => token.coinDenom == query.defaultDenom)) ??
    undefined;
  const onSend = async (e: any) => {
    e.preventDefault();
    try {
      await accountInfo.sendTronToken(
        sendConfigs.amountConfig.amount,
        sendConfigs.amountConfig.sendCurrency!,
        sendConfigs.recipientConfig.recipient,
        addressTron,
        {
          onFulfill: (tx) => {
            notification.push({
              placement: "top-center",
              type: !!tx ? "success" : "danger",
              duration: 5,
              content: !!tx ? `Transaction successful` : `Transaction failed`,
              canDelete: true,
              transition: {
                duration: 0.25,
              },
            });
          },
        },
        tokenTrc20
      );
      if (!isDetachedPage) {
        history.replace("/");
      }
    } catch (error) {
      if (!isDetachedPage) {
        history.replace("/");
      }
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Fail to send token: ${error.message}`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    } finally {
      if (isDetachedPage) {
        window.close();
      }
    }
  };
  return (
    <>
      <form className={style.formContainer} onSubmit={onSend}>
        <div className={style.formInnerContainer}>
          <div>
            <AddressInput
              inputRef={inputRef}
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              label={intl.formatMessage({ id: "send.input.recipient" })}
              placeholder="Enter recipient address"
            />
            <CoinInput
              amountConfig={sendConfigs.amountConfig}
              label={intl.formatMessage({ id: "send.input.amount" })}
              balanceText={intl.formatMessage({
                id: "send.input-button.balance",
              })}
              placeholder="Enter your amount"
            />
            {/* <MemoInput
              memoConfig={sendConfigs.memoConfig}
              label={intl.formatMessage({ id: 'send.input.memo' })}
              placeholder="Enter your memo message"
            /> */}
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
          <div style={{ flex: 1 }} />
          <Button
            type="submit"
            block
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
      </form>
    </>
  );
});
