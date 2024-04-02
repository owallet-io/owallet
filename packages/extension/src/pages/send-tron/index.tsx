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
  ChainIdEnum,
  encodeParams,
  estimateBandwidthTron,
  EthereumEndpoint,
  getBase58Address,
  getEvmAddress,
} from "@owallet/common";
import { FeeInput } from "../../components/form/fee-input";
import { Dec, DecUtils, Int } from "@owallet/unit";
import TronWeb from "tronweb";
import { useSendTxTronConfig } from "@owallet/hooks/build/tx/send-tx-tron";
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

  const sendConfigs = useSendTxTronConfig(
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
  const queries = queriesStore.get(current.chainId);
  const chainParameter =
    queries.tron.queryChainParameter.getQueryChainParameters(addressTron);

  console.log(chainParameter, "chainParameter");

  const accountTronInfo =
    queries.tron.queryAccount.getQueryWalletAddress(addressTronBase58);
  const caculatorAmountBandwidthFee = (signedTx, bandwidthRemaining): Int => {
    if (!signedTx || !bandwidthRemaining) return;
    const bandwidthUsed = estimateBandwidthTron(signedTx);
    if (!bandwidthUsed) return;
    setBandwidthUsed(`${bandwidthUsed}`);
    const bandwidthUsedInt = new Int(bandwidthUsed);
    const bandwidthEstimated = bandwidthRemaining.sub(bandwidthUsedInt);
    let amountBandwidthFee = new Int(0);
    if (bandwidthEstimated.lt(new Int(0))) {
      const fee = bandwidthUsedInt
        .mul(chainParameter.bandwidthPrice)
        .toDec()
        .roundUp();
      if (!fee) return;
      amountBandwidthFee = fee;
    }
    return amountBandwidthFee;
  };
  const caculatorAmountEnergyFee = (
    signedTx,
    energyRemaining,
    energy_used
  ): Int => {
    if (!signedTx || !energyRemaining || !energy_used) return;
    const energyUsedInt = new Int(energy_used);
    const energyEstimated = energyRemaining.sub(energyUsedInt);
    let amountEnergyFee = new Int(0);
    if (energyEstimated.lt(new Int(0))) {
      amountEnergyFee = energyUsedInt
        .sub(energyRemaining)
        .mul(chainParameter.energyPrice)
        .toDec()
        .roundUp();
    }
    return amountEnergyFee;
  };
  const simulateSignTron = async () => {
    if (
      !sendConfigs.amountConfig.amount ||
      !sendConfigs.recipientConfig.recipient ||
      !sendConfigs.amountConfig.sendCurrency ||
      !addressTronBase58
    )
      return;
    const msg = {
      amount: sendConfigs.amountConfig.amount,
      currency: sendConfigs.amountConfig.sendCurrency,
      recipient: sendConfigs.recipientConfig.recipient,
      from: addressTronBase58,
    };
    console.log(msg, "data submit tron");
    const tronWeb = new TronWeb({
      fullHost: chainStore.current.raw.grpc,
    });

    const feeCurrency = chainStore.current.feeCurrencies[0];
    const recipientInfo = await queries.tron.queryAccount
      .getQueryWalletAddress(sendConfigs.recipientConfig.recipient)
      .waitFreshResponse();
    const { data } = recipientInfo;
    console.log(data, "accountActivated");
    const { bandwidthRemaining, energyRemaining } = accountTronInfo;
    if (!data?.activated) {
      sendConfigs.feeConfig.setManualFee({
        denom: feeCurrency.coinMinimalDenom,
        amount: "1000000",
      });
    } else if (
      msg.currency.coinMinimalDenom ===
      chainStore.current.feeCurrencies[0].coinMinimalDenom
    ) {
      const transaction = await tronWeb.transactionBuilder.sendTrx(
        msg.recipient,
        sendConfigs.amountConfig.getAmountPrimitive().amount,
        msg.from,
        1
      );
      const signedTx = await keyRingStore.simulateSignTron(transaction);
      const amountBandwidthFee = caculatorAmountBandwidthFee(
        signedTx,
        bandwidthRemaining
      );
      sendConfigs.feeConfig.setManualFee({
        denom: feeCurrency.coinMinimalDenom,
        amount: amountBandwidthFee.toString(),
      });
    } else if (msg.currency.coinMinimalDenom?.includes("erc20")) {
      try {
        const parameter = await encodeParams([
          {
            type: "address",
            value: getEvmAddress(sendConfigs.recipientConfig.recipient),
          },
          {
            type: "uint256",
            value: sendConfigs.amountConfig.getAmountPrimitive().amount,
          },
        ]);

        const dataReq = {
          //@ts-ignore
          contract_address: msg.currency?.contractAddress,
          owner_address: addressTronBase58,
          parameter,
          visible: true,
          function_selector: "transfer(address,uint256)",
        };

        const triggerContractFetch =
          await queries.tron.queryTriggerConstantContract
            .queryTriggerConstantContract(dataReq)
            .waitFreshResponse();
        const triggerContract = triggerContractFetch.data;
        if (!triggerContract?.energy_used) return;
        setEnergyUsed(`${triggerContract.energy_used}`);
        const signedTx = await keyRingStore.simulateSignTron(
          triggerContract.transaction
        );
        const amountBandwidthFee = caculatorAmountBandwidthFee(
          signedTx,
          bandwidthRemaining
        );
        const amountEnergyFee = caculatorAmountEnergyFee(
          signedTx,
          energyRemaining,
          triggerContract.energy_used
        );
        const trc20Fee = amountBandwidthFee.add(amountEnergyFee);
        if (!trc20Fee) return;
        sendConfigs.feeConfig.setManualFee({
          denom: feeCurrency.coinMinimalDenom,
          amount: trc20Fee.toString(),
        });
        const feeLimit = new Int(triggerContract.energy_used).mul(
          chainParameter.energyPrice
        );
        console.log(feeLimit, "feeLimit");
      } catch (e) {
        console.log(e, "err");
      }
    }
  };

  useEffect(() => {
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
              label={"Fee"}
              defaultValue={1}
              //@ts-ignore
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
