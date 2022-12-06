import React, { FunctionComponent, useEffect, useRef } from 'react';

import { HeaderLayout, LayoutHidePage } from '../../layouts';

import { Card, CardBody } from 'reactstrap';

import style from './token.module.scss';
import { StakeView } from '../main/stake';

import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { TokensView } from '../main/token';
import { useIntl } from 'react-intl';
import { useConfirm } from '../../components/confirm';
import { IBCTransferView } from '../main/ibc-transfer';
import { IBCTransferPage } from '../../pages/ibc-transfer';
import { SendPage } from '../send';
import { SelectChain } from '../../layouts/header';
import { SendEvmPage } from '../send-evm';

export const TokenPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, uiConfigStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [hasIBCTransfer, setHasIBCTransfer] = React.useState(false);
  const [hasSend, setHasSend] = React.useState(false);
  const [coinMinimalDenom, setCoinMinimalDenom] = React.useState('');
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      chainStore.current.networkType === 'evm'
        ? accountInfo.evmosHexAddress
        : accountInfo.bech32Address
    );

  const tokens = queryBalances.balances;
  // const queryBalances = queriesStore
  //   .get(chainStore.current.chainId)
  //   .queryBalances.getQueryBech32Address(
  //     accountStore.getAccount(chainStore.current.chainId).bech32Address
  //   );

  // const tokens = queryBalances.balances;

  const hasTokens = tokens.length > 0;
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
            {
              <TokensView
                tokens={tokens}
                coinMinimalDenom={coinMinimalDenom}
                handleClickToken={handleClickToken}
              />
            }
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
                  <SendEvmPage coinMinimalDenom={coinMinimalDenom} />
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
