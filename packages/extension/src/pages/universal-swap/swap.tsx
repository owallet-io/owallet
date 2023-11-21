import React, { FunctionComponent, useEffect, useState } from 'react';
import style from './swap.module.scss';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

import { SwapInput } from './components/input-swap';
import { Button } from 'reactstrap';
import { useIntl } from 'react-intl';

export const UniversalSwapPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, uiConfigStore, keyRingStore } = useStore();
  const { chainId } = chainStore.current;
  const accountInfo = accountStore.getAccount(chainId);
  const intl = useIntl();

  return (
    <div>
      <SwapInput tokens={[1, 2, 3, 4, 5]} selectedToken={1} />
      <SwapInput tokens={[1, 2, 3, 4, 5]} selectedToken={3} />
      <div style={{ flex: 1 }} />
      <Button
        type="submit"
        block
        data-loading={accountInfo.isSendingMsg === 'send'}
        disabled={!accountInfo.isReadyToSendMsgs}
        className={style.sendBtn}
        style={{
          cursor: accountInfo.isReadyToSendMsgs ? '' : 'pointer'
        }}
      >
        <span className={style.sendBtnText}>
          {intl.formatMessage({
            id: 'send.button.send'
          })}
        </span>
      </Button>
    </div>
  );
});
