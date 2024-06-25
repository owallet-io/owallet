import React, { FC, useMemo, useState } from "react";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { CoinPretty, Dec, Int, PricePretty } from "@owallet/unit";
import { useStore } from "../../../stores";
import { ViewRawToken } from "@owallet/types";
import { unknownToken } from "@owallet/common";
import classnames from "classnames";
import { SearchInput } from "./search-input";
import { useHistory } from "react-router";

export const TokensCard: FC<{
  dataTokens: ViewRawToken[];
  onSelectToken?: (token) => void;
}> = observer(({ dataTokens, onSelectToken }) => {
  const [keyword, setKeyword] = useState("");
  const { priceStore } = useStore();
  const onChangeKeyword = (e) => {
    setKeyword(e.target.value);
  };
  return (
    <div className={styles.containerTokenCard}>
      <SearchInput
        onChange={onChangeKeyword}
        placeholder={"Search by token name"}
      />
      <div className={styles.listTokens}>
        {/*{dataTokens?.length <= 0 || !dataTokens?.length ?}*/}
        {(
          dataTokens.filter((item, index) => {
            const balance = new CoinPretty(
              item.token.currency,
              item.token.amount
            );
            const price = priceStore.calculatePrice(balance, "usd");
            return (
              price?.toDec().gte(new Dec("0.1")) &&
              item?.token?.currency?.coinDenom
                ?.toLowerCase()
                ?.includes(keyword?.toLowerCase())
            );
          }) || []
        ).map((item, index) => (
          <TokenItem onSelectToken={onSelectToken} key={index} item={item} />
        ))}
      </div>
    </div>
  );
});

const TokenItem: FC<{
  item: ViewRawToken;
  onSelectToken?: (token) => void;
}> = observer(({ item, onSelectToken }) => {
  const { priceStore } = useStore();
  const history = useHistory();

  const balance = useMemo(
    () =>
      new CoinPretty(
        item?.token?.currency || unknownToken,
        item?.token?.amount || new Dec(0)
      ),
    [item?.token?.currency, item?.token?.amount]
  );
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const price24h = priceStore.getPrice24hChange(
    item?.token?.currency?.coinGeckoId
  );
  return (
    <div
      style={{ cursor: "pointer" }}
      onClick={() => {
        try {
          onSelectToken?.(item);
          history.push({
            pathname: "/send",
            state: {
              token: item,
            },
          });
          return;
        } catch (err) {
          console.log("err", err);
        }
      }}
      className={styles.tokenItem}
    >
      <div className={styles.wrapLeftBlock}>
        <div className={styles.logoTokenAndChain}>
          <div className={styles.tokenWrap}>
            <img
              className={styles.token}
              src={
                item.token?.currency?.coinImageUrl?.includes("missing.png") ||
                !item.token?.currency?.coinImageUrl
                  ? unknownToken.coinImageUrl
                  : item.token?.currency?.coinImageUrl
              }
            />
            <div className={styles.chainWrap}>
              <img
                className={styles.chain}
                src={
                  item?.chainInfo?.chainImage ||
                  (unknownToken.coinImageUrl as string)
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.bodyTokenItem}>
          <span className={styles.title}>
            {item?.token?.currency?.coinDenom || unknownToken.coinDenom}
            <span
              className={classnames([
                styles.priceChange,
                price24h < 0 ? styles.errorColor : styles.successColor,
              ])}
            >{` ${price24h > 0 ? "+" : ""}${(price24h || 0)?.toLocaleString(
              "en-US",
              {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }
            )}%`}</span>
          </span>

          <span className={styles.subTitle}>{`${item.chainInfo.chainName} ${
            item?.type || ""
          }`}</span>
        </div>
      </div>
      <div className={styles.rightBlock}>
        <span className={styles.title}>
          {balance?.trim(true)?.hideDenom(true)?.maxDecimals(4)?.toString()}
        </span>
        <span className={styles.subTitle}>
          {new PricePretty(fiatCurrency, item.price || "0").toString()}
        </span>
      </div>
    </div>
  );
});
