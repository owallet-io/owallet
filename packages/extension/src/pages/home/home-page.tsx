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
import { IMultipleAsset, ViewRawToken, ViewTokenData } from "@owallet/types";

export const HomePage = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();
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
      chainStore,
      refreshing,
      accountOrai.bech32Address,
      totalSizeChain
    );

  return (
    <FooterLayout>
      <InfoAccountCard totalPrice={totalPriceBalance} />
      {/*TODO:// need check again Claim reward */}
      {/*<ClaimReward />*/}
      <TokensCard dataTokens={sortTokensByPrice(dataTokens)} />
    </FooterLayout>
  );
});
