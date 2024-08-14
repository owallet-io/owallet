import React, { useCallback, useEffect, useMemo } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { useStore } from "../../stores";

import { LinkStakeView, StakeView } from "./stake";
import { Dec, IntPretty, PricePretty } from "@owallet/unit";
// var Mixpanel = require('mixpanel');
import Mixpanel from "mixpanel";
import { sha256 } from "sha.js";
import { ChainIdEnum } from "@owallet/common";
import { debounce } from "lodash";
import "dotenv/config";
var mixpanel = process.env.REACT_APP_MIX_PANEL_TOKEN
  ? Mixpanel.init(process.env.REACT_APP_MIX_PANEL_TOKEN)
  : null;
export const HomePage = observer(() => {
  const { chainStore, hugeQueriesStore, priceStore, accountStore } = useStore();
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const allBalances = hugeQueriesStore.getAllBalances(true);
  const balancesByChain = hugeQueriesStore.filterBalanceTokensByChain(
    allBalances,
    chainStore.current.chainId
  );
  const availableTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        const price = priceStore.calculatePrice(bal.token, "usd");
        if (price) {
          if (!result) {
            result = price;
          } else {
            result = result.add(price);
          }
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances, priceStore]);

  const debouncedSetUaw = useCallback(
    debounce((availableTotalPriceEmbedOnlyUSD) => {
      if (!availableTotalPriceEmbedOnlyUSD || !accountOrai.bech32Address)
        return;
      const hashedAddress = new sha256()
        .update(accountOrai.bech32Address)
        .digest("hex");

      const amount = new IntPretty(availableTotalPriceEmbedOnlyUSD || "0")
        .maxDecimals(2)
        .shrink(true)
        .trim(true)
        .locale(false)
        .inequalitySymbol(true);
      const logEvent = {
        userId: hashedAddress,
        totalPrice: amount?.toString() || "0",
        currency: "usd",
      };
      if (mixpanel) {
        mixpanel.track("OWallet Extension - Assets Managements", logEvent);
      }

      // Example API call or expensive operation
    }, 400), // Adjust the debounce time (ms) as needed
    []
  );
  useEffect(() => {
    debouncedSetUaw(availableTotalPriceEmbedOnlyUSD);
    return () => {};
  }, [accountOrai.bech32Address, availableTotalPriceEmbedOnlyUSD?.toString()]);
  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    let balances = chainStore.isAllNetwork
      ? hugeQueriesStore.allKnownBalances
      : hugeQueriesStore.allKnownBalances.filter(
          (token) => token.chainInfo.chainId === chainStore.current.chainId
        );
    for (const bal of balances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [
    hugeQueriesStore.allKnownBalances,
    chainStore.isAllNetwork,
    chainStore.current.chainId,
  ]);

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
      <TokensCard
        dataTokens={chainStore.isAllNetwork ? allBalances : balancesByChain}
      />
    </FooterLayout>
  );
});
