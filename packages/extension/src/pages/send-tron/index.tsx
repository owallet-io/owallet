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
import {
  encodeParams,
  estimateBandwidthTron,
  EthereumEndpoint,
  getBase58Address,
} from "@owallet/common";
import { FeeInput } from "../../components/form/fee-input";

// export const useGetFeeTron = (keyRingStore)=>{
//
// }
export const SendTronEvmPage: FunctionComponent<{
  coinMinimalDenom?: string;
  tokensTrc20Tron?: Array<any>;
}> = observer(({ coinMinimalDenom, tokensTrc20Tron }) => {
  const [bandwidthUsed, setBandwidthUsed] = useState("0");
  const [energyUsed, setEnergyUsed] = useState("0");
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
  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError();
  const txStateIsValid = sendConfigError == null;
  const addressTron = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const addressTronBase58 = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
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

  const chainParameter = queriesStore
    .get(current.chainId)
    .tron.queryChainParameter.getQueryChainParameters(addressTron)
    .response?.data;
  console.log(chainParameter, "chainParameter");
  const simulateSignTron = async () => {
    if (
      !sendConfigs.amountConfig.amount ||
      !sendConfigs.recipientConfig.recipient ||
      !sendConfigs.amountConfig.sendCurrency ||
      !addressTron
    )
      return;
    const data = {
      amount: sendConfigs.amountConfig.amount,
      currency: sendConfigs.amountConfig.sendCurrency,
      recipient: sendConfigs.recipientConfig.recipient,
      from: addressTronBase58,
    };
    console.log(data, "data submit tron");
    const signedTx = await keyRingStore.simulateSignTron(data);
    const bandwidthUsed = estimateBandwidthTron(signedTx);
    if (!bandwidthUsed) return;
    setBandwidthUsed(bandwidthUsed);
    console.log(bandwidthUsed, "bandwidthUsed");
  };
  const encodeData = async () => {
    const encode = await encodeParams([
      { type: "address", value: "TEu6u8JLCFs6x1w5s8WosNqYqVx2JMC5hQ" },
      { type: "uint256", value: "12000000" },
    ]);
    console.log(encode, "encode");
  };
  useEffect(() => {
    encodeData();

    simulateSignTron();
  }, [
    sendConfigs.amountConfig.amount,
    sendConfigs.recipientConfig.recipient,
    addressTron,
    sendConfigs.amountConfig.sendCurrency,
  ]);
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
            <p>Estimate Bandwidth: {`${bandwidthUsed}`}</p>
            <p>Estimate Energy: {`${energyUsed}`}</p>
            <FeeInput
              fe
              label={"Fee"}
              defaultValue={1}
              feeConfig={sendConfigs.feeConfig}
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
