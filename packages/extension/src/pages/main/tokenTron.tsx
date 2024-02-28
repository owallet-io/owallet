import React, { FunctionComponent, useState } from "react";

import styleToken from "./token.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useHistory } from "react-router";
import classmames from "classnames";
import { Input } from "../../components/form";
import { toDisplay } from "@owallet/common";

export const TokensTronView: FunctionComponent<{
  tokens: {
    coinGeckoId: string;
    tokenName: string;
    coinDenom: string;
    coinImageUrl: string;
  };
  handleClickToken?: (token) => void;
  coinMinimalDenom?: string;
}> = observer(({ tokens, handleClickToken, coinMinimalDenom }) => {
  const { priceStore } = useStore();
  const history = useHistory();
  const [search, setSearch] = useState("");
  return (
    <div className={styleToken.tokensContainer}>
      <h1 className={styleToken.title}>Tokens</h1>
      <div>
        <Input
          type={"text"}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          classNameInputGroup={styleToken.inputGroup}
          placeholder={"Search Chain Coin"}
          append={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 50,
              }}
            >
              <img src={require("../../public/assets/img/light.svg")} alt="" />
            </div>
          }
        />
      </div>
      {tokens
        //@ts-ignore
        .filter((t) => t?.coinDenom?.includes(search.toUpperCase()))
        .map((token) => {
          const coinGeckoId = token?.coinGeckoId;
          const name = token?.tokenName ?? "?";
          const minimalDenom = token?.coinDenom;
          const coinImageUrl = token?.coinImageUrl;
          const amount =
            token.amount && `${toDisplay(token.amount, 6)} ${minimalDenom}`;
          return (
            <div
              key={token.coinDenom}
              className={styleToken.tokenContainer}
              onClick={(e) => {
                e.preventDefault();
                if (handleClickToken) {
                  handleClickToken(`?defaultDenom=${token.coinDenom}`);
                  return;
                }
                history.push({
                  pathname: "/send-tron",
                  search: `?defaultDenom=${token.coinDenom}`,
                });
              }}
            >
              <div className={styleToken.icon}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "100000px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "16px",
                  }}
                >
                  {coinImageUrl ? <img src={coinImageUrl} /> : name}
                </div>
              </div>
              <div className={styleToken.innerContainer}>
                <div className={styleToken.content}>
                  <div
                    className={classmames(styleToken.name, {
                      activeToken:
                        `?defaultDenom=${token.coinDenom}` == coinMinimalDenom,
                    })}
                  >
                    {name}
                  </div>
                  <div className={styleToken.amount}>{amount}</div>
                  <div className={classmames(styleToken.price)}>
                    {amount &&
                      (
                        toDisplay(token.amount, 6) *
                        priceStore?.getPrice(coinGeckoId)
                      ).toFixed(2)}
                    {" $"}
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <div className={styleToken.rightIcon}>
                  <i className="fas fa-angle-right" />
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
});
