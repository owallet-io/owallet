import React, { FunctionComponent, useEffect, useRef } from 'react';

import { HeaderLayout, LayoutHidePage } from '../../layouts';

import { Card, CardBody } from 'reactstrap';

import style from './token.module.scss';
import { StakeView } from '../main/stake';

import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { TokensView } from '../main/token';
import { TokensTronView } from '../main/tokenTron';
import { IBCTransferView } from '../main/ibc-transfer';
import { IBCTransferPage } from '../../pages/ibc-transfer';
import { SendPage } from '../send';
import { SelectChain } from '../../layouts/header';
import { SendEvmPage } from '../send-evm';
import { SendTronEvmPage } from '../send-tron';
import {
  getBase58Address,
  getEvmAddress,
  TRC20_LIST,
  TRON_ID
} from '@owallet/common';

export const TokenPage: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    uiConfigStore,
    keyRingStore
  } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [hasIBCTransfer, setHasIBCTransfer] = React.useState(false);
  const [hasSend, setHasSend] = React.useState(false);
  const [coinMinimalDenom, setCoinMinimalDenom] = React.useState('');
  const checkTronNetwork = chainStore.current.chainId === TRON_ID;
  const addressLedger =
    keyRingStore.keyRingType === 'ledger'
      ? checkTronNetwork
        ? keyRingStore?.keyRingLedgerAddress?.trx
        : keyRingStore?.keyRingLedgerAddress?.eth
      : '';
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === 'evm'
        ? keyRingStore.keyRingType !== 'ledger'
          ? accountInfo.evmosHexAddress
          : addressLedger
        : accountInfo.bech32Address
    );

  const tokens = queryBalances.balances;
  const [tokensTron, setTokensTron] = React.useState(tokens);
  // const queryBalances = queriesStore
  //   .get(chainStore.current.chainId)
  //   .queryBalances.getQueryBech32Address(
  //     accountStore.getAccount(chainStore.current.chainId).bech32Address
  //   );

  // const tokens = queryBalances.balances;

  useEffect(() => {
    if (chainStore.current.chainId == TRON_ID) {
      // call api get token tron network
      getTokenTron();
    }
    return () => {};
  }, [accountInfo.evmosHexAddress]);

  const getTokenTron = async () => {
    try {
      fetch(
        `${chainStore.current.rpc}/v1/accounts/${getBase58Address(
          keyRingStore.keyRingType !== 'ledger'
            ? accountInfo.evmosHexAddress
            : getEvmAddress(keyRingStore?.keyRingLedgerAddress?.trx)
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
  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <SelectChain showChainName canChangeChainInfo />
      <div style={{ height: 10 }} />
      {uiConfigStore.showAdvancedIBCTransfer &&
      chainStore.current.features?.includes('ibc-transfer') ? (
        <>
          <Card className={classnames(style.card, 'shadow')}>
            <CardBody>
              <IBCTransferView
                handleTransfer={() => setHasIBCTransfer(!hasIBCTransfer)}
              />
            </CardBody>
          </Card>
          {hasIBCTransfer && (
            <Card className={classnames(style.card, 'shadow')}>
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
        <Card className={classnames(style.card, 'shadow')}>
          <CardBody>
            {chainStore.current.chainId === TRON_ID ? (
              <TokensTronView
                //@ts-ignore
                tokens={tokensTron}
                coinMinimalDenom={coinMinimalDenom}
                handleClickToken={handleClickToken}
              />
            ) : (
              <TokensView
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
                  borderTop: '1px solid #E6E8EC'
                }}
              />
              <div style={{ paddingRight: 20, paddingLeft: 20 }}>
                <LayoutHidePage
                  hidePage={() => {
                    setHasSend(false);
                    setCoinMinimalDenom('');
                  }}
                />
                {chainStore.current.networkType === 'evm' ? (
                  chainStore.current.chainId === TRON_ID ? (
                    <SendTronEvmPage
                      coinMinimalDenom={coinMinimalDenom}
                      tokensTrc20Tron={tokensTron}
                    />
                  ) : (
                    <SendEvmPage coinMinimalDenom={coinMinimalDenom} />
                  )
                ) : (
                  <SendPage coinMinimalDenom={coinMinimalDenom} />
                )}
              </div>
            </>
          ) : null}
        </Card>
      ) : null}
    </HeaderLayout>
  );
});
