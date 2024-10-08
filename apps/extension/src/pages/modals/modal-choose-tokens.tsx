import React, { FC, useEffect, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderModal } from "../home/components/header-modal";
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

const TokenItem: FC<{
  item: any;
  onSelectToken?: (token) => void;
}> = observer(({ item, onSelectToken }) => {
  const { priceStore, chainStore } = useStore();

  const name = item?.currency?.coinDenom;
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
                  chainStore.current?.chainSymbolImageUrl ||
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
  const { chainStore, accountStore, keyRingStore, queriesStore } = useStore();
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
