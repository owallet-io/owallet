import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../layouts";
import style from "./style.module.scss";

export const ChatbotPage: FunctionComponent = observer(() => {
  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <main className={style.msgerChat}>
        <div className={`${style.msg} ${style.leftMsg}`}>
          <div className={`${style.msgBubble}`}>
            <div className={`${style.msgInfo}`}>
              <div className={`${style.msgInfoName}`}>BOT</div>
              <div className={`${style.msgInfoTime}`}>12:45</div>
            </div>

            <div className={`${style.msgText}`}>
              Hi, welcome to OraiBot! Go ahead and send me a message. 😄
            </div>
          </div>
        </div>

        <div className={`${style.msg} ${style.rightMsg}`}>
          <div className={`${style.msgBubble}`}>
            <div className={`${style.msgInfo}`}>
              <div className={`${style.msgInfoName}`}>Alex</div>
              <div className={`${style.msgInfoTime}`}>12:46</div>
            </div>

            <div className={`${style.msgText}`}>Deploy ERC-20 Contract</div>
          </div>
        </div>
      </main>
      <div className={style.inputChat}>
        <input type="text" placeholder="Deploy ERC-20 Contract" />
        <button>Send</button>
      </div>
    </HeaderLayout>
  );
});
