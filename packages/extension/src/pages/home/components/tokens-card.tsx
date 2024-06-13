import React, { FC, useMemo, useState } from "react";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { CoinPretty, Dec, Int, PricePretty } from "@owallet/unit";
import { useStore } from "../../../stores";
import { ViewRawToken } from "@owallet/types";
import { unknownToken } from "@owallet/common";
import classnames from "classnames";

export const TokensCard: FC<{
  dataTokens: ViewRawToken[];
}> = ({ dataTokens }) => {
  const [keyword, setKeyword] = useState("");
  return (
    <div className={styles.containerTokenCard}>
      <div className={styles.searchInputContainer}>
        <img
          className={styles.iconSearch}
          src={require("../../../public/assets/images/owallet_search.svg")}
          alt="Search icon"
        />
        <input
          onChange={(e) => {
            setKeyword(e.target.value);
            // console.log(e.target.value,"kkaa");
          }}
          className={styles.searchInput}
          name={"search-token"}
          placeholder="Search by name"
        />
      </div>
      <div className={styles.listTokens}>
        {/*{dataTokens?.length <= 0 || !dataTokens?.length ?}*/}
        {(
          dataTokens.filter(
            (item, index) =>
              new Int(item.token.amount).gt(new Int(1000)) &&
              item.token.currency.coinDenom?.toLowerCase().includes(keyword)
          ) || []
        ).map((item, index) => (
          <TokenItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

const TokenItem: FC<{
  item: ViewRawToken;
}> = observer(({ item }) => {
  const { priceStore } = useStore();
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
    <div className={styles.tokenItem}>
      <div className={styles.wrapLeftBlock}>
        <div className={styles.logoTokenAndChain}>
          <div className={styles.tokenWrap}>
            <img
              className={styles.token}
              src={item.token.currency.coinImageUrl}
            />
            <div className={styles.chainWrap}>
              <img className={styles.chain} src={item.chainInfo.chainImage} />
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
            >{` ${price24h > 0 ? "+" : ""}${price24h?.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}%`}</span>
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
