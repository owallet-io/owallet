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
export const HomePage = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);
  const {
    chainStore,
    hugeQueriesStore,
    accountStore,
    priceStore,
    keyRingStore,
  } = useStore();
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } =
    useMultipleAssets(
      accountStore,
      priceStore,
      chainStore,
      refreshing,
      accountOrai.bech32Address,
      hugeQueriesStore
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
