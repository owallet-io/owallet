import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../layouts";
import style from "./style.module.scss";
import "./style.css";

export const ChatbotPage: FunctionComponent = observer(() => {
  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <div className={style.container}>
        <div className="frame-wrapper">
          <div className="frame">
            <div className="div">
              <div className="frame-5">
                <img
                  className="img"
                  alt="WeMinimal Icon"
                  src={require("../../public/assets/img/we-minimal-icon.svg")}
                />
                <p className="p">How can i help you ?</p>
              </div>
              <div className="frame-3">
                <div className="frame-4">
                  <div className="text-wrapper-2">Price of token today</div>
                </div>
                <div className="frame-4">
                  <p className="text-wrapper-2">
                    The fluctuation of token this week
                  </p>
                </div>
                <div className="frame-4">
                  <p className="text-wrapper-2">
                    The fluctuation of token this year
                  </p>
                </div>
                <div className="div-wrapper">
                  <div className="frame-2">
                    <div className="text-wrapper">Ask anything...</div>
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
      </div>
    </HeaderLayout>
  );
});
