import React, { useEffect, useMemo } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { useStore } from "../../stores";

import { LinkStakeView, StakeView } from "./stake";
import { Dec, PricePretty } from "@owallet/unit";

export const HomePage = observer(() => {
  const { chainStore, hugeQueriesStore } = useStore();

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
