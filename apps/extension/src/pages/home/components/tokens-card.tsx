import React, { FC, useMemo, useState } from "react";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { CoinPretty, Dec, Int, PricePretty } from "@owallet/unit";
import { useStore } from "../../../stores";
import { ViewRawToken, ViewToken } from "@owallet/types";
import {
  avatarName,
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

export const TokensCard: FC<{
  dataTokens: readonly ViewToken[];
  onSelectToken?: (token) => void;
}> = observer(({ dataTokens, onSelectToken }) => {
  const [keyword, setKeyword] = useState("");
  const { priceStore, chainStore, hugeQueriesStore } = useStore();
  const onChangeKeyword = (e) => {
    setKeyword(e.target.value);
  };
  const onHideDust = () => {
    chainStore.setIsHideDust(!chainStore.isHideDust);
  };
  const trimSearch = keyword.trim();

  const _allBalancesSearchFiltered = useMemo(() => {
    return dataTokens.filter((token) => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [dataTokens, trimSearch]);
  const hasLowBalanceTokens =
    hugeQueriesStore.filterLowBalanceTokens(dataTokens).length > 0;
  const lowBalanceFilteredAllBalancesSearchFiltered =
    hugeQueriesStore.filterLowBalanceTokens(_allBalancesSearchFiltered);
  const allBalancesSearchFiltered =
    chainStore.isHideDust && hasLowBalanceTokens
      ? lowBalanceFilteredAllBalancesSearchFiltered
      : _allBalancesSearchFiltered;

  return (
    <div className={styles.containerTokenCard}>
      <div className={styles.wrapTopBlock}>
        <SearchInput
          onChange={onChangeKeyword}
          placeholder={"Search by token"}
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
        {allBalancesSearchFiltered?.length > 0 ? (
          allBalancesSearchFiltered.map((item, index) => (
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
  const price24h = priceStore.getPrice24hChange(item?.token?.currency);
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
          if (item.chainInfo?.chainId.includes("solana")) {
            history.push({
              pathname: "/send-solana",
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
                !item.token?.currency?.coinImageUrl ||
                item.token?.currency?.coinImageUrl === unknownToken.coinImageUrl
                  ? avatarName.replace(
                      "{name}",
                      item.token?.currency?.coinDenom
                    )
                  : item.token?.currency?.coinImageUrl
              }
            />
            <div className={styles.chainWrap}>
              <img
                className={styles.chain}
                src={
                  item?.chainInfo?.chainSymbolImageUrl ||
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
          {item.token?.trim(true)?.hideDenom(true)?.maxDecimals(6)?.toString()}
        </span>
        <span className={styles.subTitle}>
          {new PricePretty(fiatCurrency, item.price || "0").toString()}
        </span>
      </div>
    </div>
  );
});
