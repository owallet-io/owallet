import { OraidexCommon } from "@oraichain/oraidex-common";
import { useCallback, useEffect, useRef, useState } from "react";

// Cache for storing token prices to avoid unnecessary API calls
let priceCache: Record<string, number | null> = {};
let lastFetchTime = 0;
const CACHE_EXPIRY_TIME = 60000; // 1 minute cache

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
  const [data, setData] = useState<CoinGeckoPrices<string>>(priceCache);
  const fetchingRef = useRef(false);

  const getCoingeckoPrices = useCallback(async (forceUpdate = false) => {
    // Check if we have fresh cache and not forcing update
    const now = Date.now();
    if (
      !forceUpdate &&
      lastFetchTime > 0 &&
      now - lastFetchTime < CACHE_EXPIRY_TIME &&
      Object.keys(priceCache).length > 0
    ) {
      setData(priceCache);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const { cosmosTokens, evmTokens } = await OraidexCommon.load();

      const tokens = [
        ...new Set([...cosmosTokens, ...evmTokens].map((t) => t.coinGeckoId)),
      ];
      tokens.sort();

      const MAX_IDS_PER_REQUEST = 40;
      const allPrices: Record<string, number | null> = {};

      // Split tokens into chunks of maximum 40
      for (let i = 0; i < tokens.length; i += MAX_IDS_PER_REQUEST) {
        const chunk = tokens.slice(i, i + MAX_IDS_PER_REQUEST);
        const coingeckoPricesURL = buildCoinGeckoPricesURL(chunk);

        try {
          const resp = await fetch(coingeckoPricesURL, {});
          const rawData = await resp.json();

          // Update cached prices for this chunk
          for (const key in rawData) {
            allPrices[key] = rawData[key].usd;
          }
        } catch (chunkError) {
          console.error(
            `Failed to fetch prices for chunk ${i / MAX_IDS_PER_REQUEST + 1}:`,
            chunkError
          );
          // Continue with other chunks even if one fails
        }
      }

      const result = Object.fromEntries(
        tokens.map((token: any) => [token, allPrices[token]])
      );

      // Update the global cache
      priceCache = result;
      lastFetchTime = now;

      setData(result);
    } catch (err) {
      console.log("error on getCoingeckoPrices", err);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    getCoingeckoPrices();

    // Set up interval to refresh prices
    const intervalId = setInterval(() => {
      getCoingeckoPrices(true);
    }, CACHE_EXPIRY_TIME);

    return () => {
      clearInterval(intervalId);
    };
  }, [getCoingeckoPrices]);

  return {
    data,
    refreshPrices: () => getCoingeckoPrices(true),
  };
};
