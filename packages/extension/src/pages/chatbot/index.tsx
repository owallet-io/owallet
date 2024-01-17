import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect } from "react";
import { HeaderLayout } from "../../layouts";
import style from "./style.module.scss";

export const UserChat = ({ msg }) => {
  return (
    <div className={style.userMsg}>
      <p>{msg}</p>
    </div>
  );
};

export const ChatbotPage: FunctionComponent = observer(() => {
  useEffect(() => {
    fetch(
      "https://api.oraidex.io/price?base_denom=orai&quote_denom=orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh&tf=240"
    )
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <div className={style.container}>
        <div className="frame-wrapper">
          <div className="frame">
            <div className="div">
              <div className={style.header}>
                <img
                  className="img"
                  alt="WeMinimal Icon"
                  src={require("../../public/assets/img/we-minimal-icon.svg")}
                />
                <p>How can I help you?</p>
              </div>
              <div className={style.wrapperCommonPrompt}>
                <div className={style.commonPrompt}>
                  <p>Price of token today</p>
                </div>
                <div className={style.commonPrompt}>
                  <p>Deploy CW-20</p>
                </div>
                <div className={style.commonPrompt}>
                  <p>The fluctuation of token this year</p>
                </div>
              </div>
              <div className={style.wrapperChat}>
                <div className={style.wrapperUserChat}>
                  <div className={style.userChat}>
                    <p>Price of token today</p>
                  </div>
                </div>
                <div className={style.wrapperBotChat}>
                  <div className={style.botChat}>
                    <p>Sure, wait me a minute</p>
                  </div>
                </div>
                <div className={style.wrapperBotChat}>
                  <div className={style.botChat}>
                    <p>
                      To get the latest price information for Orai Coin, I
                      recommend checking a reputable cryptocurrency exchange,
                      financial news website, or the official website of the
                      project. Keep in mind that prices can vary between
                      different exchanges.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className={style.inputWrapperContent}>
                  <input
                    className={style.inputBox}
                    type="text"
                    placeholder="Ask anything..."
                  />
                  <img
                    className="arrow-up-square"
                    alt="Arrow up square"
                    src={require("../../public/assets/img/arrow-up-square.svg")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeaderLayout>
  );
});
