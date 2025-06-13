import { CWStargate, fetchTaxRate, ChainIdEnum } from "@owallet/common";
import { useCallback, useEffect, useRef, useState } from "react";

// Cache tax rate data with expiry
const taxRateCache = {
  data: "",
  timestamp: 0,
  expiry: 5 * 60 * 1000, // 5 minutes cache
};

export const useTaxRate = (accountOrai: any, oraichainNetwork, network) => {
  const [taxRate, setTaxRate] = useState(taxRateCache.data || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  const queryTaxRate = useCallback(
    async (forceRefresh = false) => {
      // Return cached data if valid and not forcing refresh
      const now = Date.now();
      if (
        !forceRefresh &&
        taxRateCache.timestamp > 0 &&
        now - taxRateCache.timestamp < taxRateCache.expiry &&
        taxRateCache.data
      ) {
        setTaxRate(taxRateCache.data);
        return;
      }

      // Prevent concurrent fetches
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;

      // Don't show loading indicator if we have cached data
      if (!taxRateCache.data) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const cwClient = await CWStargate.init(
          accountOrai,
          ChainIdEnum.Oraichain,
          oraichainNetwork?.rpc,
          network
        );
        const data = await fetchTaxRate(cwClient, network);

        // Update only if component is still mounted
        if (isMounted.current) {
          const rate = data?.rate || "";
          setTaxRate(rate);

          // Update cache
          taxRateCache.data = rate;
          taxRateCache.timestamp = now;
        }
      } catch (err) {
        console.error("Failed to fetch tax rate:", err);
        if (isMounted.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
        fetchInProgress.current = false;
      }
    },
    [accountOrai, oraichainNetwork?.rpc, network]
  );

  useEffect(() => {
    isMounted.current = true;

    if (oraichainNetwork?.rpc) {
      queryTaxRate();
    }

    return () => {
      isMounted.current = false;
    };
  }, [queryTaxRate, oraichainNetwork?.rpc]);

  return {
    taxRate,
    isLoading,
    error,
    refreshTaxRate: () => queryTaxRate(true),
  };
};
