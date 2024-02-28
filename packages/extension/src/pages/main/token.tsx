import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";

import styleToken from "./token.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useHistory } from "react-router";
import { Hash } from "@owallet/crypto";
import { ObservableQueryBalanceInner } from "@owallet/stores";
import classmames from "classnames";
import { Input } from "../../components/form";
import { UncontrolledTooltip } from "reactstrap";
import { WrongViewingKeyError } from "@owallet/stores";
import { useNotification } from "../../components/notification";
import { useLoadingIndicator } from "../../components/loading-indicator";
import { DenomHelper } from "@owallet/common";

import { useLanguage } from "@owallet/common";
import { Bech32Address } from "@owallet/cosmos";
import { NetworkType } from "@owallet/types";
import { NftPage } from "../nft";

const TokenView: FunctionComponent<{
  balance: ObservableQueryBalanceInner;
  active?: boolean;
  onClick: () => void;
}> = observer(({ onClick, balance, active }) => {
  const { chainStore, accountStore, tokensStore, priceStore } = useStore();
  const language = useLanguage();
  const [colors] = useState([
    ["#5e72e4", "#ffffff"],
    ["#11cdef", "#ffffff"],
    ["#2dce89", "#ffffff"],
    ["#F6F7FB", "#0e0314"],
  ]);

  let name = balance.currency.coinDenom;
  const minimalDenom = balance.currency.coinMinimalDenom;

  let amount = balance.balance.trim(true).shrink(true);

  const [backgroundColor, color] = useMemo(() => {
    const hash = Hash.sha256(Buffer.from(minimalDenom));
    if (hash.length > 0) {
      return colors[hash[0] % colors.length];
    } else {
      return colors[0];
    }
  }, [colors, minimalDenom]);

  const error = balance.error;

  // It needs to create the id deterministically according to the currency.
  // But, it is hard to ensure that the id is valid selector because the currency can be suggested from the webpages.
  // So, just hash the minimal denom and encode it to the hex and remove the numbers.
  const validSelector = Buffer.from(Hash.sha256(Buffer.from(minimalDenom)))
    .toString("hex")
    .replace(/\d+/g, "")
    .slice(0, 20);

  const history = useHistory();

  const notification = useNotification();
  const loadingIndicator = useLoadingIndicator();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const createViewingKey = async (): Promise<string | undefined> => {
    if ("type" in balance.currency && balance.currency.type === "secret20") {
      const contractAddress = balance.currency.contractAddress;
      return new Promise((resolve) => {
        accountInfo.secret
          .createSecret20ViewingKey(
            contractAddress,
            "",
            {},
            {},
            (_, viewingKey) => {
              loadingIndicator.setIsLoading("create-veiwing-key", false);

              resolve(viewingKey);
            }
          )
          .then(() => {
            loadingIndicator.setIsLoading("create-veiwing-key", true);
          });
      });
    }
  };

  // If the currency is the IBC Currency.
  // Show the amount as slightly different with other currencies.
  // Show the actual coin denom to the top and just show the coin denom without channel info to the bottom.
  if ("originCurrency" in amount.currency && amount.currency.originCurrency) {
    amount = amount.setCurrency(amount.currency.originCurrency);
  } else {
    const denomHelper = new DenomHelper(amount.currency.coinMinimalDenom);
    if (denomHelper.contractAddress) {
      name += ` (${Bech32Address.shortenAddress(
        denomHelper.contractAddress,
        24
      )})`;
    }
  }

  const tokenPrice = priceStore.calculatePrice(amount, language.fiatCurrency);

  return (
    <div
      className={styleToken.tokenContainer}
      onClick={(e) => {
        e.preventDefault();

        onClick();
      }}
    >
      <div className={styleToken.icon}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "100000px",
            backgroundColor,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: backgroundColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color,
            fontSize: "16px",
          }}
        >
          {balance.currency.coinImageUrl ? (
            <img src={balance.currency.coinImageUrl} />
          ) : name.length > 0 ? (
            name[0]
          ) : (
            "?"
          )}
        </div>
      </div>
      <div className={styleToken.innerContainer}>
        <div className={styleToken.content}>
          <div
            className={classmames(styleToken.name, {
              activeToken: active,
            })}
          >
            {name}
          </div>
          <div className={styleToken.amount}>
            {amount.maxDecimals(6).toString()}
            {balance.isFetching ? (
              <i className="fas fa-spinner fa-spin ml-1" />
            ) : null}
          </div>
          {tokenPrice && (
            <div className={styleToken.price}>{tokenPrice.toString()}</div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        {error ? (
          <div className={classmames(styleToken.rightIcon, "mr-2")}>
            <i
              className="fas fa-exclamation-circle text-danger"
              id={validSelector}
            />
            <UncontrolledTooltip target={validSelector}>
              {error.message}
            </UncontrolledTooltip>
          </div>
        ) : null}
        {error?.data && error.data instanceof WrongViewingKeyError ? (
          <div
            className={classmames(styleToken.rightIcon, "mr-2")}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              if (
                "type" in balance.currency &&
                balance.currency.type === "secret20"
              ) {
                const viewingKey = await createViewingKey();
                if (!viewingKey) {
                  notification.push({
                    placement: "top-center",
                    type: "danger",
                    duration: 2,
                    content: "Failed to create the viewing key",
                    canDelete: true,
                    transition: {
                      duration: 0.25,
                    },
                  });

                  return;
                }

                const tokenOf = tokensStore.getTokensOf(
                  chainStore.current.chainId
                );

                await tokenOf.addToken({
                  ...balance.currency,
                  viewingKey,
                });

                history.push({
                  pathname: "/",
                });
              }
            }}
          >
            {accountInfo.isSendingMsg === "createSecret20ViewingKey" ? (
              <i className="fa fa-spinner fa-spin fa-fw" />
            ) : (
              <i className="fas fa-wrench" />
            )}
          </div>
        ) : null}
        <div className={styleToken.rightIcon}>
          <i className="fas fa-angle-right" />
        </div>
      </div>
    </div>
  );
});

export const TokensView: FunctionComponent<{
  tokens: ObservableQueryBalanceInner[];
  handleClickToken?: (token) => void;
  coinMinimalDenom?: string;
  setHasSend?: (status) => void;
}> = observer(({ tokens, handleClickToken, coinMinimalDenom, setHasSend }) => {
  // const { chainStore, accountStore, queriesStore } = useStore();

  // const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [tab, setTab] = useState(0);
  const displayTokens = tokens
    .filter((v, i, obj) => {
      return (
        v?.balance &&
        obj.findIndex(
          (v2) =>
            v2.balance.currency?.coinDenom === v.balance.currency?.coinDenom
        ) === i
      );
    })
    .sort((a, b) => {
      const aDecIsZero = a.balance?.toDec()?.isZero();
      const bDecIsZero = b.balance?.toDec()?.isZero();

      if (aDecIsZero && !bDecIsZero) {
        return 1;
      }
      if (!aDecIsZero && bDecIsZero) {
        return -1;
      }

      return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
    });

  const history = useHistory();
  const [search, setSearch] = useState("");

  return (
    <div className={styleToken.tokensContainer}>
      <div className={styleToken.tabsContainer}>
        {["Tokens", "SoulBound NFTs"].map((nft, i) => (
          <div className={styleToken.tab}>
            <h1
              style={{
                color: tab == i && "#7664E4",
              }}
              className={styleToken.title}
              onClick={() => {
                if (i) {
                  setHasSend(false);
                }
                setTab(i);
              }}
            >
              {nft}
            </h1>
            {tab == i && <hr />}
          </div>
        ))}
      </div>
      {tab ? (
        <>
          <NftPage />
        </>
      ) : (
        <>
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
                  <img
                    src={require("../../public/assets/img/light.svg")}
                    alt=""
                  />
                </div>
              }
            />
          </div>
          {displayTokens
            .filter(
              (token) =>
                token?.currency?.coinMinimalDenom?.includes(
                  search.toUpperCase()
                ) ||
                token?.currency?.coinDenom?.includes(search.toUpperCase()) ||
                token?.currency?.coinGeckoId?.includes(search.toUpperCase()) ||
                token?.currency?.coinMinimalDenom?.includes(
                  search.toLowerCase()
                ) ||
                token?.currency?.coinDenom?.includes(search.toLowerCase()) ||
                token?.currency?.coinGeckoId?.includes(search.toLowerCase())
            )
            .map((token, i) => {
              return (
                <TokenView
                  key={i.toString()}
                  balance={token}
                  active={
                    `?defaultDenom=${token.currency.coinMinimalDenom}` ==
                    coinMinimalDenom
                  }
                  onClick={() => {
                    if (handleClickToken) {
                      handleClickToken(
                        `?defaultDenom=${token.currency.coinMinimalDenom}`
                      );
                      return;
                    }
                    history.push({
                      pathname: "/send",
                      search: `?defaultDenom=${token.currency.coinMinimalDenom}`,
                    });
                  }}
                />
              );
            })}
        </>
      )}
    </div>
  );
});
