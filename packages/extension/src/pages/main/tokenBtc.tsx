import React, { FunctionComponent, useEffect, useMemo, useState } from "react";

import styleToken from "./token.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useHistory } from "react-router";
import classmames from "classnames";
import { Input } from "../../components/form";
import {
  formatBalance,
  getExchangeRate,
  getBalanceValue,
  btcToFiat,
} from "@owallet/bitcoin";
import { CoinPretty } from "@owallet/unit";
export const TokensBtcView: FunctionComponent<{
  handleClickToken?: (token) => void;
}> = observer(({ handleClickToken }) => {
  const history = useHistory();
  const [search, setSearch] = useState("");
  const { chainStore, priceStore, queriesStore, accountStore, keyRingStore } =
    useStore();
  const { chainId } = chainStore.current;
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const balanceBtc =
    queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.balance;
  const totalAmount = useMemo(() => {
    const amount = formatBalance({
      balance: Number(balanceBtc?.toCoin().amount),
      cryptoUnit: "BTC",
      coin: chainStore.current.chainId,
    });
    return amount;
  }, [
    chainStore.current.chainId,
    account?.bech32Address,
    chainStore.current.networkType,
    balanceBtc,
  ]);
  const token = chainStore.current.stakeCurrency;
  useEffect(() => {
    const getExchange = async () => {
      const exchange = (await getExchangeRate({
        selectedCurrency: priceStore.defaultVsCurrency,
      })) as { data: number };

      if (Number(exchange?.data)) {
        setExchangeRate(Number(exchange?.data));
      }
    };
    getExchange();
    return () => {};
  }, [priceStore.defaultVsCurrency]);

  const handleBalanceBtc = (balanceBtc: CoinPretty, exchangeRate: number) => {
    const balanceValueParams = {
      balance: Number(balanceBtc?.toCoin().amount),
      cryptoUnit: "BTC",
    };

    const amountData = getBalanceValue(balanceValueParams);

    const currencyFiat = priceStore.defaultVsCurrency;
    const fiat = btcToFiat({
      amount: amountData as number,
      exchangeRate: exchangeRate,
      currencyFiat,
    });
    return `$${fiat}`;
  };
  const totalBalance = useMemo(() => {
    if (!!exchangeRate && exchangeRate > 0) {
      return handleBalanceBtc(balanceBtc, exchangeRate);
    }
    return "";
  }, [
    token.coinDecimals,
    chainStore.current.chainId,
    account?.bech32Address,
    exchangeRate,
    balanceBtc,
  ]);

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

      <div
        key={"btc"}
        className={styleToken.tokenContainer}
        onClick={(e) => {
          e.preventDefault();
          if (handleClickToken) {
            handleClickToken(`?defaultDenom=${token.coinDenom}`);
            return;
          }
          history.push({
            pathname: "/send-btc",
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
            {token.coinImageUrl ? <img src={token.coinImageUrl} /> : null}
          </div>
        </div>
        <div className={styleToken.innerContainer}>
          <div className={styleToken.content}>
            <div
              className={classmames(styleToken.name, {
                activeToken: true,
              })}
            >
              {token.coinDenom}
            </div>
            <div className={styleToken.amount}>{totalAmount}</div>
            <div className={classmames(styleToken.price)}>{totalBalance}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div className={styleToken.rightIcon}>
            <i className="fas fa-angle-right" />
          </div>
        </div>
      </div>
    </div>
  );
});
