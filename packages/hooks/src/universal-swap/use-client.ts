import { CWStargate, ChainIdEnum } from "@owallet/common";
import { useCallback, useEffect, useRef, useState } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

// Global client cache to avoid recreating clients unnecessarily
const clientCache: Record<
  string,
  {
    client: SigningCosmWasmClient;
    timestamp: number;
  }
> = {};

export const useClient = (
  accountOrai: any,
  oraichainNetwork: any,
  network: any
) => {
  const [client, setClient] = useState<SigningCosmWasmClient>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const clientInitInProgress = useRef(false);

  // Create a cache key based on network parameters
  const getCacheKey = useCallback(() => {
    if (!oraichainNetwork?.rpc) return null;
    return `${ChainIdEnum.Oraichain}-${oraichainNetwork.rpc}-${network}-${
      accountOrai?.address || ""
    }`;
  }, [oraichainNetwork?.rpc, network, accountOrai?.address]);

  const getClient = useCallback(
    async (forceRefresh = false) => {
      const cacheKey = getCacheKey();
      if (!cacheKey) return;

      // Check cache first (valid for 10 minutes)
      if (
        !forceRefresh &&
        clientCache[cacheKey] &&
        Date.now() - clientCache[cacheKey].timestamp < 10 * 60 * 1000
      ) {
        if (isMounted.current) {
          setClient(clientCache[cacheKey].client);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      // Prevent concurrent initialization
      if (clientInitInProgress.current) return;
      clientInitInProgress.current = true;

      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }

      try {
        if (!oraichainNetwork || !oraichainNetwork.rpc) {
          throw new Error("Missing RPC configuration");
        }

        const cwClient = await CWStargate.init(
          accountOrai,
          ChainIdEnum.Oraichain,
          oraichainNetwork.rpc,
          network,
          oraichainNetwork.gasPrice || ""
        );

        // Update cache
        clientCache[cacheKey] = {
          client: cwClient,
          timestamp: Date.now(),
        };

        if (isMounted.current) {
          setClient(cwClient);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to initialize client:", err);
        if (isMounted.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      } finally {
        clientInitInProgress.current = false;
      }
    },
    [oraichainNetwork, network, accountOrai, getCacheKey]
  );

  useEffect(() => {
    isMounted.current = true;

    if (oraichainNetwork?.rpc) {
      getClient();
    }

    return () => {
      isMounted.current = false;
    };
  }, [getClient, oraichainNetwork?.rpc]);

  return {
    client,
    isLoading,
    error,
    refreshClient: () => getClient(true),
  };
};
