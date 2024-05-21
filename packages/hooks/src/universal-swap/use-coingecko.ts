import { cosmosTokens, evmTokens } from "@oraichain/oraidex-common";
import { useEffect, useState } from "react";

/**
 * Constructs the URL to retrieve prices from CoinGecko.
 * @param tokens
 * @returns
 */
export const buildCoinGeckoPricesURL = (tokens: any[]): string =>
  // `https://api.coingecko.com/api/v3/simple/price?ids=${tokens.join('%2C')}&vs_currencies=usd`;
  `https://price.market.orai.io/simple/price?ids=${tokens.join(
    "%2C"
  )}&vs_currencies=usd`;

/**
 * Prices of each token.
 */
export type CoinGeckoPrices<T extends string> = {
  [C in T]: number | null;
};

/**
 * Fetches prices of tokens from CoinGecko.
 * @returns The CoinGecko prices.
 */
export const useCoinGeckoPrices = (customEVM?, customCosmos?) => {
  const tokensEVM = customEVM ?? evmTokens;
  const tokensCosmos = customCosmos ?? cosmosTokens;
  const [data, setData] = useState<CoinGeckoPrices<string>>({});
  const tokens = [
    ...new Set([...tokensCosmos, ...tokensEVM].map((t) => t.coinGeckoId)),
  ];
  tokens.sort();

  const getCoingeckoPrices = async () => {
    const coingeckoPricesURL = buildCoinGeckoPricesURL(tokens);

    const prices = {};

    // by default not return data then use cached version
    try {
      const resp = await fetch(coingeckoPricesURL, {});
      const rawData = await resp.json();
      // update cached
      for (const key in rawData) {
        prices[key] = rawData[key].usd;
      }
    } catch {
      // remain old cache
    }
    setData(
      Object.fromEntries(tokens.map((token: any) => [token, prices[token]]))
    );
  };

  useEffect(() => {
    getCoingeckoPrices();
  }, []);
  return { data };
};
