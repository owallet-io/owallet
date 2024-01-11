import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { HeaderLayout } from '../../layouts';
import style from './style.module.scss';

export const ChatbotPage: FunctionComponent = observer(() => {
  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <div className={style.inputChat}>
        <input type="text" placeholder="Deploy ERC-20 Contract" />
        <button>Send</button>
      </div>
    </HeaderLayout>
  );
});
