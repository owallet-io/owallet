import React from 'react';
import style from './style.module.scss';

export const BotChat = ({ msg }) => {
  return (
    <div className={style.wrapperBotChat}>
      <div className={style.botChat}>
        <p>{msg}</p>
      </div>
    </div>
  );
};
