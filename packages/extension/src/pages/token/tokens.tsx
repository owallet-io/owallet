import React, { FunctionComponent, useEffect, useRef } from 'react';

import { HeaderLayout } from '../../layouts';

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

export const TokenPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, uiConfigStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

  const tokens = queryBalances.unstakables;

  const hasTokens = tokens.length > 0;

  return (
    <HeaderLayout showChainName canChangeChainInfo>
      {uiConfigStore.showAdvancedIBCTransfer &&
      chainStore.current.features?.includes('ibc-transfer') ? (
        <Card className={classnames(style.card, 'shadow')}>
          <CardBody>
            <IBCTransferView />
          </CardBody>
        </Card>
      ) : (
        <></>
      )}
      {hasTokens ? (
        <Card className={classnames(style.card, 'shadow')}>
          <CardBody>{<TokensView tokens={tokens} />}</CardBody>
        </Card>
      ) : null}
    </HeaderLayout>
  );
});
