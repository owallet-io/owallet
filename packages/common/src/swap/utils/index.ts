import { CoinPretty, Dec, DecUtils } from "@owallet/unit";
import { BalanceItem, Chain, Token } from "../types";
import { getBase58Address } from "../../utils";
import { Bech32Address } from "@owallet/cosmos";
import { fetchChains } from "../api";
import { PublicKey } from "@solana/web3.js";

export * from "./chain-utils";
export * from "./skip-utils";
export * from "./fee-calculator";
export * from "./cryptoInputHelpers";

// Import fetchChains dynamically to avoid circular dependencies
const REFERRAL_ADDRESS_SOL = "G24YyJ8yM75wLwZWPzeGTB9xPP8ayL3VkNpmUw1am4ia";
export const referalAddressSol = new PublicKey(REFERRAL_ADDRESS_SOL);

export const parseChainId = (chainId: string) => {
  if (!chainId) return null;
  const [networkType, networkId] = chainId.split(":");
  if (!networkType || !networkId) return null;
  if (networkType === "cosmos") return networkId;
  if (networkType === "tron") return `eip155:${Number(networkId)}`;
  return chainId;
};
export const formatChainId = (chainId: string) => {
  if (!chainId) return null;
  if (chainId === "eip155:728126428") {
    return "tron:0x2b6653dc"; // Special case
  }

  if (chainId.startsWith("eip155:")) {
    return chainId; // Keep as is
  }

  if (chainId.startsWith("solana:")) {
    return chainId; // Keep as is
  }

  // If it's cosmos (cosmoshub-4 or Oraichain) without prefix
  return `cosmos:${chainId}`;
};
export const formatChainIds = (chainIds: string[]): string[] => {
  if (!chainIds) return [];
  return chainIds.map((id) => {
    if (!id) return "";
    if (id === "eip155:728126428") {
      return "tron:0x2b6653dc"; // Special case
    }

    if (id.startsWith("eip155:")) {
      return id; // Keep as is
    }

    if (id.startsWith("solana:")) {
      return id; // Keep as is
    }

    // If it's cosmos (cosmoshub-4 or Oraichain) without prefix
    return `cosmos:${id}`;
  });
};
export const getAddress = async (chainId: string) => {
  if (!chainId) return "";
  if (chainId.startsWith("eip155:")) {
    const key = await (window as any).owallet.getKey("eip155:1");

    if (!key?.ethereumHexAddress) return "";
    return key.ethereumHexAddress;
  } else if (chainId.startsWith("cosmos:")) {
    const key = await (window as any).owallet.getKey("Oraichain");
    if (!key?.address) return "";
    const { chainsMap } = await getChainsWithCache();
    // Get bech32Prefix from chainMap or default to "orai"
    const chainInfo = chainsMap?.[chainId];
    if (chainInfo?.rawConfig?.bip44?.coinType !== 118) {
      const key = await (window as any).owallet.getKey(
        chainId.replace("cosmos:", "")
      );
      return key.bech32Address;
    }
    const bech32Prefix = chainInfo?.prefixBech32;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    return bech32Address;
  } else if (chainId.startsWith("tron:")) {
    const key = await (window as any).owallet.getKey("eip155:728126428");
    if (!key?.ethereumHexAddress) return "";
    return getBase58Address(key.ethereumHexAddress);
  } else if (chainId.startsWith("solana:")) {
    const key = await (window as any).owallet.solana.getKey(
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
    );
    if (!key?.base58Address) return "";
    return key.base58Address;
  }
  return "";
};

export const getMultipleAddresses = async (
  chainIds: string[]
): Promise<Record<string, string>> => {
  if (!chainIds || chainIds.length === 0) return {};

  try {
    // Use Promise.allSettled to get all addresses concurrently, ignoring failed chains
    const addressPromises = chainIds.map(async (chainId) => {
      const address = await getAddress(chainId);
      return { chainId, address };
    });

    const addressResults = await Promise.allSettled(addressPromises);

    // Convert array to object for easier access, only including successful results
    const addressMap: Record<string, string> = {};
    const failedChains: string[] = [];

    addressResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const { chainId, address } = result.value;
        addressMap[chainId] = address;
      } else {
        failedChains.push(chainIds[index]);
        console.warn(
          `Failed to get address for chain ${chainIds[index]}:`,
          result.reason
        );
      }
    });

    if (failedChains.length > 0) {
      console.log(
        `Successfully got addresses for ${Object.keys(addressMap).length}/${
          chainIds.length
        } chains. Failed chains:`,
        failedChains
      );
    }

    return addressMap;
  } catch (error) {
    console.error("Error getting multiple addresses:", error);
    return {};
  }
};

export const filterTokensBySearchQuery = (
  tokens: BalanceItem[],
  searchQuery: string
): BalanceItem[] => {
  if (!searchQuery) {
    return tokens;
  }

  const normalizedSearchQuery = searchQuery.toLowerCase().trim();

  return tokens.filter((token) => {
    // Search by symbol (case insensitive)
    if (token.token.symbol.toLowerCase().includes(normalizedSearchQuery)) {
      return true;
    }

    // Search by name (case insensitive)
    if (token.token.name.toLowerCase().includes(normalizedSearchQuery)) {
      return true;
    }

    // Search by contract address (exact match or partial)
    if (token.token.address.toLowerCase().includes(normalizedSearchQuery)) {
      return true;
    }

    return false;
  });
};

export const filterChainsBySearchQuery = (
  chains: Chain[],
  query: string
): Chain[] => {
  if (!query) return chains;

  const lowerCaseQuery = query.toLowerCase();

  return chains.filter((token) =>
    token.name.toLowerCase().includes(lowerCaseQuery)
  );
};

export const calculateExchangeRate = (
  amountIn: string,
  amountOut: string,
  decimalsIn = 18,
  decimalsOut = 18,
  amountOutDisplay?: string
): string => {
  if (!amountIn || !amountOut) return "0";

  try {
    const valueIn = new Dec(amountIn).quo(DecUtils.getTenExponentN(decimalsIn));
    const valueOut = amountOutDisplay
      ? new Dec(amountOutDisplay)
      : new Dec(amountOut).quo(DecUtils.getTenExponentN(decimalsOut));

    if (valueIn.equals(new Dec(0))) return "0";

    const rate = valueOut.quo(valueIn);

    return Number(rate.toString()).toFixed(4);
  } catch (error) {
    console.error("Error calculating exchange rate:", error);
    return "0";
  }
};

/**
 * Format a token amount with proper decimals and optional denomination
 * @param amount - The amount to format (can be string, number, or Dec object)
 * @param token - The token object with decimals and other information
 * @param options - Formatting options
 * @returns Formatted amount string
 */
export const formatTokenAmount = (
  amount: string | number | Dec,
  token: Token | null,
  options: {
    maxDecimals?: number;
    showDenom?: boolean;
    minimalDenomPrefix?: string;
  } = {}
): string => {
  if (!token) return "0";

  const {
    maxDecimals = amount ? 4 : 0,
    showDenom = false,
    minimalDenomPrefix = "erc20:",
  } = options;

  try {
    // Create a CoinPretty object with the token information
    let prettyAmount = new CoinPretty(
      {
        coinDecimals: token.decimals || 0,
        coinDenom: token.symbol || "",
        coinMinimalDenom: `${minimalDenomPrefix}${token.address}`,
      },
      amount || 0
    );

    // Apply formatting options
    prettyAmount = prettyAmount.maxDecimals(maxDecimals);

    if (!showDenom) {
      prettyAmount = prettyAmount.hideDenom(true);
    }

    // Convert to string
    const formattedAmount = prettyAmount.toString();

    return formattedAmount;
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return "0";
  }
};

// Cache for chains data
interface ChainsCacheData {
  chains: Chain[];
  chainsMap: Record<string, Chain>;
  timestamp: number;
}

let chainsCache: ChainsCacheData | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getChainsWithCache = async (): Promise<{
  chains: Chain[];
  chainsMap: Record<string, Chain>;
  isLoading: boolean;
  error: Error | null;
}> => {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (chainsCache && now - chainsCache.timestamp < CACHE_DURATION) {
      return {
        chains: chainsCache.chains,
        chainsMap: chainsCache.chainsMap,
        isLoading: false,
        error: null,
      };
    }

    const response = await fetchChains();
    console.log(response, "response getChainsWithCache");

    if (response.success) {
      console.log(response.data[0], "response.data.config[0]");

      const chains = response.data;

      // Map chains by chainId for easier lookup
      const chainsMap = chains.reduce(
        (acc: Record<string, Chain>, chain: Chain) => {
          acc[chain.id] = chain;
          return acc;
        },
        {}
      );

      // Update cache
      chainsCache = {
        chains,
        chainsMap,
        timestamp: now,
      };

      return {
        chains,
        chainsMap,
        isLoading: false,
        error: null,
      };
    }

    throw new Error(response.message || "Failed to fetch chains");
  } catch (error) {
    console.error("Error fetching chains:", error);

    // Return cached data if available, even if stale
    if (chainsCache) {
      return {
        chains: chainsCache.chains,
        chainsMap: chainsCache.chainsMap,
        isLoading: false,
        error: error as Error,
      };
    }

    return {
      chains: [],
      chainsMap: {},
      isLoading: false,
      error: error as Error,
    };
  }
};

// Helper function to clear cache manually if needed
export const clearChainsCache = () => {
  chainsCache = null;
};

// Helper function to check if cache is valid
export const isChainseCacheValid = (): boolean => {
  if (!chainsCache) return false;
  const now = Date.now();
  return now - chainsCache.timestamp < CACHE_DURATION;
};
