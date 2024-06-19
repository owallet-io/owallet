import React, { useEffect, useState } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { useStore } from "../../stores";
import { ChainIdEnum } from "@owallet/common";
import {
  initPrice,
  sortTokensByPrice,
  useMultipleAssets,
} from "../../hooks/use-multiple-assets";

import { CoinPretty, PricePretty } from "@owallet/unit";
import { ViewRawToken } from "@owallet/types";

export const HomePage = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();
  const [dataTokensCache, setDataTokensCache] = useState([]);
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
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } =
    useMultipleAssets(
      accountStore,
      priceStore,
      allChainMap,
      chainStore.current.chainId,
      true,
      refreshing,
      accountOrai.bech32Address,
      totalSizeChain
    );
  let totalPrice = initPrice;
  const totalPriceByChainId:
    | Map<ChainIdEnum | string, PricePretty>
    | undefined = new Map();
  useEffect(() => {
    const dataTokens = localStorage.getItem("dataTokens");
    if (!dataTokens) return;
    setDataTokensCache(JSON.parse(dataTokens));
  }, []);
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const dataTokensWithPrice = (
    (dataTokens?.length > 0 ? dataTokens : dataTokensCache) || []
  ).map((item: ViewRawToken, index) => {
    const coinData = new CoinPretty(item.token.currency, item.token.amount);
    const priceData = priceStore.calculatePrice(coinData);
    const totalBalanceByChain = (
      totalPriceByChainId.get(item?.chainInfo?.chainId) || initPrice
    ).add(priceData || initPrice);

    totalPrice = totalPrice.add(priceData || initPrice);
    totalPriceByChainId.set(item?.chainInfo?.chainId, totalBalanceByChain);
    if (dataTokensByChain?.[chainStore.current.chainId]) {
      dataTokensByChain[chainStore.current.chainId].totalBalance = (
        new PricePretty(
          fiatCurrency,
          dataTokensByChain[chainStore.current.chainId]?.totalBalance
        ) || initPrice
      )
        .add(priceData || initPrice)
        .toDec()
        .toString();
    }

    return {
      ...item,
      price: priceData?.toDec()?.toString() || initPrice?.toDec()?.toString(),
    };
  });

  const dataTokensWithPriceByChain = (
    dataTokensByChain?.[chainStore.current.chainId]?.tokens || []
  ).map((item, index) => {
    const coinData = new CoinPretty(item.token.currency, item.token.amount);
    const priceData = priceStore.calculatePrice(coinData);
    return {
      ...item,
      price: priceData?.toDec()?.toString() || initPrice?.toDec()?.toString(),
    };
  });

  return (
    <FooterLayout
      totalPrice={totalPrice}
      totalPriceByChainId={totalPriceByChainId}
    >
      <InfoAccountCard totalPrice={totalPrice} />
      {/*TODO:// need check again Claim reward */}
      {/*<ClaimReward />*/}
      <TokensCard
        dataTokens={sortTokensByPrice(
          chainStore.isAllNetwork
            ? dataTokensWithPrice
            : dataTokensWithPriceByChain
        )}
      />
    </FooterLayout>
  );
});
