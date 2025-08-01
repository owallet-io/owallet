import { ethers } from "ethers"; // ethers v6
import { PublicKey } from "@solana/web3.js";
import { isValidTronAddress } from "../../utils";

// Default chain order if no balances are available
// Prioritizes Skip-supported chains for better cross-chain routing
const DEFAULT_CHAIN_ORDER = [
  "cosmos:Oraichain",
  "cosmos:osmosis-1", // Skip excels at Osmosis routing
  "cosmos:noble-1", // Noble for USDC transfers
  "eip155:1", // Ethereum
  "eip155:8453", // Base (Skip supported)
  "eip155:56", // BSC
  "cosmos:cosmoshub-4", // Cosmos Hub
  "cosmos:neutron-1", // Neutron
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  "cosmos:injective-1", // Injective
];
export function detectAddressType(address: string): {
  valid: boolean;
  type: "evm" | "cosmos" | "solana" | "tron" | null;
} {
  // EVM - Dùng ethers để validate checksum
  if (ethers.utils.isAddress(address)) {
    return { valid: true, type: "evm" };
  }

  // Solana: base58, 32 bytes
  try {
    const pubkey = new PublicKey(address);
    return {
      valid: PublicKey.isOnCurve(pubkey.toBytes()) || true,
      type: "solana",
    };
  } catch {}

  // Tron: base58check, starts with 'T', 21 bytes
  try {
    return { valid: isValidTronAddress(address), type: "tron" };
  } catch {}

  return { valid: false, type: null };
}
export const getSpecialCoingecko = (
  fromCoingecko: string,
  toCoingecko: string
) => {
  const isSpecialCoingecko = (coinGeckoId: string) =>
    ["kawaii-islands", "milky-token", "injective-protocol"].includes(
      coinGeckoId
    );
  const isSpecialFromCoingecko = isSpecialCoingecko(fromCoingecko);
  const isSpecialToCoingecko = isSpecialCoingecko(toCoingecko);
  return {
    isSpecialFromCoingecko,
    isSpecialToCoingecko,
  };
};
/**
 * Get top 4 chains by USD value from chainTotalUsd data
 * Falls back to default order if insufficient data
 * @param chainTotalUsd - Record of chainId to USD value
 * @returns Array of top 4 chainIds
 */
export const getTop5ChainsByUsdValue = (
  chainTotalUsd: Record<string, string> | undefined
): string[] => {
  if (!chainTotalUsd || Object.keys(chainTotalUsd).length === 0) {
    return DEFAULT_CHAIN_ORDER.slice(0, 5);
  }

  // Convert to array and sort by USD value (highest first)
  const sortedChains = Object.entries(chainTotalUsd)
    .map(([chainId, usdValue]) => ({
      chainId,
      usdValue: parseFloat(usdValue) || 0,
    }))
    .sort((a, b) => b.usdValue - a.usdValue)
    .map((item) => item.chainId);

  // Get top 4 chains with actual balances
  const top4WithBalances = sortedChains
    .filter((chainId) => {
      const usdValue = parseFloat(chainTotalUsd[chainId] || "0");
      return usdValue > 0;
    })
    .slice(0, 5);

  // If we don't have 4 chains with balances, fill with default order
  if (top4WithBalances.length < 5) {
    const missingCount = 5 - top4WithBalances.length;
    const additionalChains = DEFAULT_CHAIN_ORDER.filter(
      (chainId) => !top4WithBalances.includes(chainId)
    ).slice(0, missingCount);
    return [...top4WithBalances, ...additionalChains];
  }

  return top4WithBalances;
};
