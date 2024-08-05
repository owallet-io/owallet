import React, { useEffect, useMemo } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { useStore } from "../../stores";
import { ChainIdEnum } from "@owallet/common";
import {
  sortTokensByPrice,
  useMultipleAssets,
} from "../../hooks/use-multiple-assets";
import { ClaimReward } from "./components/claim-reward";
import { LinkStakeView, StakeView } from "./stake";
import { Dec, PricePretty } from "@owallet/unit";
const zeroDec = new Dec(0);
export const HomePage = observer(() => {
  // const [refreshing, setRefreshing] = React.useState(false);
  const {
    chainStore,
    hugeQueriesStore,
    accountStore,
    priceStore,
    keyRingStore,
    queriesStore,
  } = useStore();
  const selected = keyRingStore?.multiKeyStoreInfo?.find(
    (keyStore) => keyStore?.selected
  );
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  const address = accountStore
    .getAccount(chainStore.current.chainId)
    .getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);
  // const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } = useMultipleAssets(
  //   accountStore,
  //   priceStore,
  //   chainStore,
  //   selected,
  //   accountOrai.bech32Address,
  //   hugeQueriesStore
  // );
  // useEffect(() => {
  //   fetchBalance();
  // }, [address]);
  // const fetchBalance = async () => {
  //   const queries = queriesStore.get(chainStore.current.chainId);
  //   // Because the components share the states related to the queries,
  //   // fetching new query responses here would make query responses on all other components also refresh.
  //   if (chainStore.current.networkType === "bitcoin") {
  //     await queries.bitcoin.queryBitcoinBalance.getQueryBalance(address).waitFreshResponse();

  //     return;
  //   } else {
  //     await Promise.all([
  //       priceStore.waitFreshResponse(),
  //       ...queries.queryBalances.getQueryBech32Address(address).balances.map((bal) => {
  //         return bal.waitFreshResponse();
  //       })
  //     ]);
  //   }
  // };
  const allBalances = hugeQueriesStore.getAllBalances(true);

  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances]);
  // console.log(availableTotalPrice, "availableTotalPrice");
  // const availableTotalPriceEmbedOnlyUSD = useMemo(() => {
  //   let result: PricePretty | undefined;
  //   for (const bal of hugeQueriesStore.allKnownBalances) {
  //     // if (!(bal.chainInfo.embedded as ChainInfoWithCoreTypes).embedded) {
  //     //   continue;
  //     // }
  //     if (bal.price) {
  //       const price = priceStore.calculatePrice(bal.token, "usd");
  //       if (price) {
  //         if (!result) {
  //           result = price;
  //         } else {
  //           result = result.add(price);
  //         }
  //       }
  //     }
  //   }
  //   return result;
  // }, [hugeQueriesStore.allKnownBalances, priceStore]);
  // const queryBalances = queriesStore.get(chainId).queryBalances;
  return (
    <FooterLayout>
      <InfoAccountCard
        isLoading={false}
        totalPrice={availableTotalPrice?.toString() || "-"}
      />

      {/*TODO:// need check again Claim reward */}
      {/* <ClaimReward /> */}
      {chainStore.isAllNetwork ||
      chainStore.current.networkType !== "cosmos" ? null : (
        <StakeView />
      )}
      <TokensCard dataTokens={allBalances} />
    </FooterLayout>
  );
});
