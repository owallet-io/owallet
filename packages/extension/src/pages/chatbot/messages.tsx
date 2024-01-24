import React from 'react';
import style from './style.module.scss';
import { UserChat } from './user-chat';
import { BotChat } from './bot-chat';

export const Messages = ({ messages }) => {
  return (
    <div className={style.wrapperChat}>
      {messages.map((msg) => {
        if (msg.isUser) {
          return <UserChat msg={msg.msg} />;
        }
        return <BotChat msg={msg.msg} />;
      })}
    </div>
  );
};
