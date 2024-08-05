import React, { FC, useMemo, useState } from "react";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { CoinPretty, Dec, Int, PricePretty } from "@owallet/unit";
import { useStore } from "../../../stores";
import { ViewRawToken } from "@owallet/types";
import {
  ChainIdEnum,
  removeDataInParentheses,
  unknownToken,
} from "@owallet/common";
import classnames from "classnames";
import { SearchInput } from "./search-input";
import { useHistory } from "react-router";
import Switch from "react-switch";
import colors from "../../../theme/colors";
import { OwEmpty } from "components/empty/ow-empty";
import { ViewToken } from "stores/huge-queries";

export const TokensCard: FC<{
  dataTokens: ViewToken[];
  onSelectToken?: (token) => void;
}> = observer(({ dataTokens, onSelectToken }) => {
  const [keyword, setKeyword] = useState("");
  const { priceStore, chainStore } = useStore();
  const onChangeKeyword = (e) => {
    setKeyword(e.target.value);
  };
  const onHideDust = () => {
    chainStore.setIsHideDust(!chainStore.isHideDust);
  };
  // const dataTokensHandled =
  //   dataTokens.filter((item, index) => {
  //     const balance = new CoinPretty(item.token.currency, item.token.amount);
  //     const price = priceStore.calculatePrice(balance, "usd");
  //     const searchKeyword = item?.token?.currency?.coinDenom?.toLowerCase()?.includes(keyword?.toLowerCase());
  //     if (chainStore.isHideDust) {
  //       return price?.toDec().gte(new Dec("0.1")) && searchKeyword;
  //     }
  //     return searchKeyword;
  //   }) || [];

  return (
    <div className={styles.containerTokenCard}>
      <div className={styles.wrapTopBlock}>
        <SearchInput
          onChange={onChangeKeyword}
          placeholder={"Search by token name"}
        />

        <div className={styles.wrapHideToken}>
          <span className={styles.label}>Hide dust</span>
          <Switch
            onColor={colors["highlight-surface-active"]}
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={35}
            onChange={onHideDust}
            checked={chainStore.isHideDust}
          />
        </div>
      </div>
      <div className={styles.listTokens}>
        {dataTokens?.length > 0 ? (
          dataTokens.map((item, index) => (
            <TokenItem onSelectToken={onSelectToken} key={index} item={item} />
          ))
        ) : (
          <OwEmpty />
        )}
      </div>
    </div>
  );
});

const TokenItem: FC<{
  item: ViewToken;
  onSelectToken?: (token) => void;
}> = observer(({ item, onSelectToken }) => {
  const { priceStore, chainStore } = useStore();
  const history = useHistory();

  // const balance = useMemo(
  //   () => new CoinPretty(item?.token?.currency || unknownToken, item?.token?.amount || new Dec(0)),
  //   [item?.token?.currency, item?.token?.amount]
  // );
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const price24h = priceStore.getPrice24hChange(
    item?.token?.currency?.coinGeckoId
  );
  return (
    <div
      style={{ cursor: "pointer" }}
      onClick={async () => {
        try {
          if (item && item.chainInfo) {
            chainStore.selectChain(item?.chainInfo?.chainId);
            await chainStore.saveLastViewChainId();
          }
          onSelectToken?.(item);
          if (item.chainInfo?.chainId === ChainIdEnum.TRON) {
            history.push({
              pathname: "/send-tron",
              state: {
                token: item,
              },
            });
            return;
          }
          if (item.chainInfo?.chainId === ChainIdEnum.Bitcoin) {
            history.push({
              pathname: "/send-btc",
              state: {
                token: item,
              },
            });
            return;
          }

          if (
            //@ts-ignore
            item.chainInfo?.networkType === "evm" ||
            chainStore.current.networkType === "evm"
          ) {
            history.push({
              pathname: "/send-evm",
              state: {
                token: item,
              },
            });
            return;
          }
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
                  item?.chainInfo?.currencies[0]?.coinImageUrl ||
                  (unknownToken.coinImageUrl as string)
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.bodyTokenItem}>
          <span className={styles.title}>
            {removeDataInParentheses(
              item?.token?.currency?.coinDenom || unknownToken.coinDenom
            )}
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

          <span
            className={styles.subTitle}
          >{`${item.chainInfo.chainName} `}</span>
        </div>
      </div>
      <div className={styles.rightBlock}>
        <span className={styles.title}>
          {item.token?.trim(true)?.hideDenom(true)?.maxDecimals(4)?.toString()}
        </span>
        <span className={styles.subTitle}>
          {new PricePretty(fiatCurrency, item.price || "0").toString()}
        </span>
      </div>
    </div>
  );
});
