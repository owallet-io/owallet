import React, { FunctionComponent, useEffect, useRef } from "react";

import { HeaderLayout, LayoutHidePage } from "../../layouts";

import { Card, CardBody } from "reactstrap";

import style from "./token.module.scss";
import { StakeView } from "../main/stake";

import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { TokensView } from "../main/token";
import { TokensTronView } from "../main/tokenTron";
import { IBCTransferView } from "../main/ibc-transfer";
import { IBCTransferPage } from "../../pages/ibc-transfer";
import { SendPage } from "../send";
import { SelectChain } from "../../layouts/header";
import { SendEvmPage } from "../send-evm/send-evm";
import { SendTronEvmPage } from "../send-tron";
import {
  getBase58Address,
  getEvmAddress,
  TRC20_LIST,
  TRON_ID,
} from "@owallet/common";
import { TokensBtcView } from "../main/tokenBtc";
import { SendBtcPage } from "../send-btc";

export const TokenPage: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    uiConfigStore,
    keyRingStore,
  } = useStore();
  const { chainId, networkType } = chainStore.current;
  const accountInfo = accountStore.getAccount(chainId);
  const [hasIBCTransfer, setHasIBCTransfer] = React.useState(false);
  const [hasSend, setHasSend] = React.useState(false);
  const [coinMinimalDenom, setCoinMinimalDenom] = React.useState("");

  const checkTronNetwork = chainId === TRON_ID;
  const ledgerAddress =
    keyRingStore.keyRingType === "ledger"
      ? checkTronNetwork
        ? keyRingStore?.keyRingLedgerAddresses?.trx
        : keyRingStore?.keyRingLedgerAddresses?.eth
      : "";
  const queryBalances = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(
      networkType === "evm"
        ? keyRingStore.keyRingType !== "ledger"
          ? accountInfo.evmosHexAddress
          : ledgerAddress
        : accountInfo.bech32Address
    );

  const tokens = queryBalances.balances;

  const [tokensTron, setTokensTron] = React.useState(tokens);

  useEffect(() => {
    if (chainId == TRON_ID) {
      // call api get token tron network
      getTokenTron();
    }
    return () => {};
  }, [accountInfo.evmosHexAddress]);

  const getTokenTron = async () => {
    try {
      fetch(
        `${chainStore.current.rpc}/v1/accounts/${getBase58Address(
          keyRingStore.keyRingType !== "ledger"
            ? accountInfo.evmosHexAddress
            : getEvmAddress(keyRingStore?.keyRingLedgerAddresses?.trx)
        )}`
      ).then(async (res) => {
        const data = await res.json();
        if (data?.data.length > 0) {
          if (data?.data[0].trc20) {
            const tokenArr = [];
            TRC20_LIST.forEach((tk) => {
              let token = data?.data[0].trc20.find(
                (t) => tk.contractAddress in t
              );
              if (token) {
                tokenArr.push({ ...tk, amount: token[tk.contractAddress] });
              }
            });
            setTokensTron(tokenArr);
          }
        }
      });
    } catch (error) {
      console.log({ error });
    }
  };

  const hasTokens = tokens.length > 0 || tokensTron.length > 0;
  const handleClickToken = (token) => {
    if (!hasSend) setHasSend(true);
    setCoinMinimalDenom(token);
  };

  useEffect(() => {
    setHasSend(false);
  }, [chainStore.current]);
  const handleCheckSendPage = () => {
    if (networkType === "evm") {
      if (chainId === TRON_ID) {
        return (
          <SendTronEvmPage
            coinMinimalDenom={coinMinimalDenom}
            tokensTrc20Tron={tokensTron}
          />
        );
      }
      return <SendEvmPage coinMinimalDenom={coinMinimalDenom} />;
    } else if (networkType === "bitcoin") {
      return <SendBtcPage />;
    }
    return <SendPage coinMinimalDenom={coinMinimalDenom} />;
  };
  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <SelectChain showChainName canChangeChainInfo />
      <div style={{ height: 10 }} />
      {uiConfigStore.showAdvancedIBCTransfer &&
      chainStore.current.features?.includes("ibc-transfer") ? (
        <>
          <Card className={classnames(style.card, "shadow")}>
            <CardBody>
              <IBCTransferView
                handleTransfer={() => setHasIBCTransfer(!hasIBCTransfer)}
              />
            </CardBody>
          </Card>
          {hasIBCTransfer && (
            <Card className={classnames(style.card, "shadow")}>
              <CardBody>
                <LayoutHidePage hidePage={() => setHasIBCTransfer(false)} />
                <div style={{ height: 28 }} />
                <IBCTransferPage />
              </CardBody>
            </Card>
          )}
        </>
      ) : (
        <></>
      )}
      {hasTokens ? (
        <Card className={classnames(style.card, "shadow")}>
          <CardBody>
            {chainId === TRON_ID ? (
              <TokensTronView
                //@ts-ignore
                tokens={tokensTron}
                coinMinimalDenom={coinMinimalDenom}
                handleClickToken={handleClickToken}
              />
            ) : networkType === "bitcoin" ? (
              <TokensBtcView handleClickToken={handleClickToken} />
            ) : (
              <TokensView
                setHasSend={setHasSend}
                tokens={tokens}
                coinMinimalDenom={coinMinimalDenom}
                handleClickToken={handleClickToken}
              />
            )}
          </CardBody>
          {hasSend ? (
            <>
              <hr
                className="my-3"
                style={{
                  height: 1,
                  borderTop: "1px solid #E6E8EC",
                }}
              />
              <div style={{ paddingRight: 20, paddingLeft: 20 }}>
                <LayoutHidePage
                  hidePage={() => {
                    setHasSend(false);
                    setCoinMinimalDenom("");
                  }}
                />
                {handleCheckSendPage()}
              </div>
            </>
          ) : null}
        </Card>
      ) : null}
    </HeaderLayout>
  );
});
