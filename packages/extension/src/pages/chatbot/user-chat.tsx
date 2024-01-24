import React from 'react';
import style from './style.module.scss';

export const UserChat = ({ msg }) => {
  return (
    <div className={style.wrapperUserChat}>
      <div className={style.userChat}>
        <p>{msg}</p>
      </div>
    </div>
  );
};
