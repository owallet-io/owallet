import React, { FC, useEffect, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderModal } from "../home/components/header-modal";
// import { ChainIdEnum, DenomHelper } from "@owallet/common";
// import { useMultipleAssets } from "../../hooks/use-multiple-assets";
// import classnames from "classnames";
// import { TokensCard } from "../home/components/tokens-card";
import { IAmountConfig } from "@owallet/hooks";
import { ObservableQueryBalanceInner } from "@owallet/stores";
import {
  ChainIdEnum,
  DenomHelper,
  formatAddress,
  removeDataInParentheses,
  extractDataInParentheses,
  unknownToken,
} from "@owallet/common";
import { useHistory } from "react-router";

const TokenItem: FC<{
  item: any;
  onSelectToken?: (token) => void;
}> = observer(({ item, onSelectToken }) => {
  const { priceStore, chainStore } = useStore();
  const history = useHistory();

  const name = item?.currency?.coinDenom;
  const getName = () => {
    return removeDataInParentheses(name);
  };
  const image = item.currency?.coinImageUrl;

  let contractAddress: string = "";
  let amount = item?.balance
    ?.trim(true)
    ?.shrink(true)
    ?.maxDecimals(6)
    ?.hideDenom(true);
  // If the currency is the IBC Currency.
  // Show the amount as slightly different with other currencies.
  // Show the actual coin denom to the top and just show the coin denom without channel info to the bottom.
  if ("originCurrency" in amount.currency && amount.currency.originCurrency) {
    amount = amount.setCurrency(amount.currency.originCurrency);
  } else {
    const denomHelper = new DenomHelper(amount.currency.coinMinimalDenom);
    if (denomHelper.contractAddress) {
      contractAddress = formatAddress(denomHelper.contractAddress, 8);
    }
  }
  if (extractDataInParentheses(name)) {
    contractAddress = extractDataInParentheses(name);
  }
  const tokenPrice = priceStore.calculatePrice(amount);
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
          if (
            item.chainInfo?.chainId === ChainIdEnum.TRON ||
            chainStore.current.chainId === ChainIdEnum.TRON
          ) {
            history.push({
              pathname: "/send-tron",
              state: {
                token: item,
              },
            });
            return;
          }
          if (
            item.chainInfo?.chainId === ChainIdEnum.Bitcoin ||
            chainStore.current.chainId === ChainIdEnum.Bitcoin
          ) {
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
                !image || image === "missing.png"
                  ? unknownToken.coinImageUrl
                  : image
              }
            />
            <div className={styles.chainWrap}>
              <img
                className={styles.chain}
                src={
                  chainStore.current?.stakeCurrency?.coinImageUrl ||
                  (unknownToken.coinImageUrl as string)
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.bodyTokenItem}>
          <span className={styles.title}>
            {removeDataInParentheses(name || unknownToken.coinDenom)}
          </span>

          <span
            className={styles.subTitle}
          >{`${chainStore.current.chainName}`}</span>
        </div>
      </div>
      <div className={styles.rightBlock}>
        <span className={styles.title}> {amount?.toString()}</span>
        <span className={styles.subTitle}>
          {" "}
          {tokenPrice ? tokenPrice.toString() : "-"}
        </span>
      </div>
    </div>
  );
});

export const ModalChooseTokens: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  amountConfig: IAmountConfig;
  onSelectToken?: (item) => void;
}> = observer(({ isOpen, onRequestClose, onSelectToken, amountConfig }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const {
    chainStore,
    accountStore,
    keyRingStore,
    queriesStore,
    priceStore,
    hugeQueriesStore,
  } = useStore();
  const totalSizeChain = chainStore.chainInfos.length;
  const allChainMap = new Map();
  if (allChainMap.size < totalSizeChain) {
    chainStore.chainInfos.map((item, index) => {
      const acc = accountStore.getAccount(item.chainId);
      const address = acc.getAddressDisplay(
        keyRingStore.keyRingLedgerAddresses,
        false
      );
      if (!address) return;
      allChainMap.set(item.chainId, {
        address: address,
        chainInfo: item,
      });
    });
  }
  const [displayTokens, setDisplayTokens] = useState<
    ObservableQueryBalanceInner[]
  >([]);
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const addressToFetch = accountInfo.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  // const { dataTokens } = useMultipleAssets(
  //   accountStore,
  //   priceStore,
  //   chainStore,
  //   refreshing,
  //   accountOrai.bech32Address,
  //   hugeQueriesStore
  // );

  const onSelect = (item) => {
    const selectedKey = item?.currency?.coinMinimalDenom;
    const currency = amountConfig.sendableCurrencies.find(
      (cur) => cur.coinMinimalDenom === selectedKey
    );
    amountConfig.setSendCurrency(currency);
    onRequestClose();
    onSelectToken?.(currency);
  };

  useEffect(() => {
    // NOTE: TokensStoreInner addToken have cache, but chainStore.addCurrencies does not. Need to take a look ?
    const queryBalances = queriesStore
      .get(chainStore.current.chainId)
      .queryBalances.getQueryBech32Address(addressToFetch);
    const tokens = queryBalances.balances;
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
    setDisplayTokens(displayTokens);
  }, [chainStore.current.chainId, addressToFetch]);

  // const selectedKey = amountConfig.sendCurrency.coinMinimalDenom;
  // const setSelectedKey = (key: string | undefined) => {
  //   const currency = amountConfig.sendableCurrencies.find(cur => cur.coinMinimalDenom === key);

  //   amountConfig.setSendCurrency(currency);
  // };

  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalNetwork}
    >
      <div className={styles.contentWrap}>
        <HeaderModal
          title={"Select token".toUpperCase()}
          onRequestClose={onRequestClose}
        />
        {/* <TokensCard
          onSelectToken={onSelect}
          dataTokens={dataTokens.filter(token => token.chainInfo.chainId === chainStore.current.chainId)}
        /> */}
        {displayTokens.map((token, i) => {
          return (
            <TokenItem
              onSelectToken={onSelect}
              key={i.toString()}
              item={token}
            />
          );
        })}
      </div>
    </SlidingPane>
  );
});
