import React, { useEffect } from "react";
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
    queriesStore,
  } = useStore();
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const address = accountStore
    .getAccount(chainStore.current.chainId)
    .getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);
  const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } =
    useMultipleAssets(
      accountStore,
      priceStore,
      chainStore,
      refreshing,
      accountOrai.bech32Address,
      hugeQueriesStore
    );
  useEffect(() => {
    fetchBalance();
  }, [address]);
  const fetchBalance = async () => {
    const queries = queriesStore.get(chainStore.current.chainId);
    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.
    if (chainStore.current.networkType === "bitcoin") {
      await queries.bitcoin.queryBitcoinBalance
        .getQueryBalance(address)
        .waitFreshResponse();
      return;
    } else {
      await Promise.all([
        priceStore.waitFreshResponse(),
        ...queries.queryBalances
          .getQueryBech32Address(address)
          .balances.map((bal) => {
            return bal.waitFreshResponse();
          }),
      ]);
    }
  };
  return (
    <FooterLayout>
      <InfoAccountCard isLoading={isLoading} totalPrice={totalPriceBalance} />
      {/*TODO:// need check again Claim reward */}
      {/*<ClaimReward />*/}
      <TokensCard dataTokens={sortTokensByPrice(dataTokens)} />
    </FooterLayout>
  );
});
