import { OraidexCommon } from "@oraichain/oraidex-common";
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
export const useCoinGeckoPrices = () => {
  const [data, setData] = useState<CoinGeckoPrices<string>>({});

  const getCoingeckoPrices = async () => {
    try {
      const { cosmosTokens, evmTokens } = await OraidexCommon.load();

      const tokens = [
        ...new Set([...cosmosTokens, ...evmTokens].map((t) => t.coinGeckoId)),
      ];
      tokens.sort();
      const coingeckoPricesURL = buildCoinGeckoPricesURL(tokens);
      console.log("coingeckoPricesURL", coingeckoPricesURL);

      const prices = {};

      const resp = await fetch(coingeckoPricesURL, {});
      const rawData = await resp.json();
      // update cached
      for (const key in rawData) {
        prices[key] = rawData[key].usd;
      }

      setData(
        Object.fromEntries(tokens.map((token: any) => [token, prices[token]]))
      );
    } catch (err) {
      console.log("error on getCoingeckoPrices", err);
    }
  };

  useEffect(() => {
    getCoingeckoPrices();
  }, []);
  return { data };
};
