/**
 * Skip Go API Configuration
 * Based on: https://docs.skip.build/go/general/getting-started
 *
 * This file contains all the necessary configuration for integrating with Skip Go API
 */

// Skip API Configuration
export const SKIP_CONFIG = {
  // API Base URL - Official Skip endpoint
  API_BASE_URL: "https://api.skip.money",

  // API Version
  API_VERSION: "v2",

  // Endpoints
  ENDPOINTS: {
    ROUTE: "/v2/fungible/route",
    MESSAGES: "/v2/fungible/msgs",
    TRACK: "/v2/tx/track",
    STATUS: "/v2/tx/status",
    CHAINS: "/v2/info/chains",
    TOKENS: "/v2/fungible/assets",
    VENUES: "/v2/fungible/venues",
  },

  // Request timeouts
  TIMEOUTS: {
    ROUTE_REQUEST: 15000, // 15 seconds
    TRANSACTION_BUILD: 10000, // 10 seconds
    STATUS_CHECK: 5000, // 5 seconds
  },

  // Default settings
  DEFAULTS: {
    SLIPPAGE_TOLERANCE_BPS: 300, // 3% in basis points
    AFFILIATE_FEE_BPS: 25, // 0.25% affiliate fee
    ALLOW_MULTI_TX: true,
    ALLOW_UNSAFE: false, // SAFE swapping enabled by default
  },
};

// Supported bridge protocols by Skip
export const SKIP_SUPPORTED_BRIDGES = [
  "IBC",
  "CCTP",
  "HYPERLANE",
  "AXELAR",
  "WORMHOLE", // If supported
] as const;

// Supported swap venues by chain
export const SKIP_SWAP_VENUES = {
  // Cosmos chains
  "osmosis-1": ["osmosis-poolmanager"],
  "neutron-1": ["astroport", "neutron-astroport"],
  "injective-1": ["injective-helix", "injective-dojoswap"],
  "juno-1": ["juno-junoswap", "astroport"],

  // EVM chains (if supported)
  "1": [
    // Ethereum
    "uniswap-v3",
    "uniswap-v2",
    "sushiswap",
  ],
  "56": ["pancakeswap"],
  "137": [
    // Polygon
    "uniswap-v3",
    "quickswap",
  ],
  "8453": [
    // Base
    "uniswap-v3",
    "aerodrome",
  ],
} as const;

// Chain ID mappings from our format to Skip format
export const CHAIN_ID_MAPPING = {
  // Cosmos chains
  "cosmos:cosmoshub-4": "cosmoshub-4",
  "cosmos:osmosis-1": "osmosis-1",
  "cosmos:juno-1": "juno-1",
  "cosmos:stargaze-1": "stargaze-1",
  "cosmos:secret-4": "secret-4",
  "cosmos:akashnet-2": "akashnet-2",
  "cosmos:neutron-1": "neutron-1",
  "cosmos:injective-1": "injective-1",
  "cosmos:noble-1": "noble-1",
  "cosmos:Oraichain": "Oraichain",
  "cosmos:kaiyo-1": "kaiyo-1",
  "cosmos:phoenix-1": "phoenix-1", // Terra
  "cosmos:pacific-1": "pacific-1", // Sei

  // EVM chains
  "eip155:1": "1",
  "eip155:137": "137",
  "eip155:56": "56",
  "eip155:43114": "43114",
  "eip155:42161": "42161",
  "eip155:10": "10",
  "eip155:8453": "8453",
} as const;

// Common token addresses for testing
export const SKIP_TEST_TOKENS = {
  // Native tokens
  OSMO: "uosmo",
  ATOM: "uatom",
  JUNO: "ujuno",
  STARS: "ustars",
  NTRN: "untrn",
  INJ: "inj",

  // IBC tokens (examples)
  USDC_NOBLE:
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
  ATOM_OSMOSIS:
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",

  // EVM tokens
  ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  BNB: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native BNB on BSC
  USDC_ETHEREUM: "0xa0b86a33e6156da1c0c2feeea8ed5c50e89c0c45",
  USDC_BASE: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  USDC_POLYGON: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  USDC_BSC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC on BSC
} as const;

// Token denomination mapping for proper Skip API usage
export const TOKEN_DENOM_MAPPING = {
  // Cosmos native tokens (use minimal denom)
  OSMO: "uosmo",
  ATOM: "uatom",
  JUNO: "ujuno",
  STARS: "ustars",
  NTRN: "untrn",
  INJ: "inj",

  // EVM native tokens (use native ETH format)
  ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  BNB: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native BNB
  MATIC: "0x0000000000000000000000000000000000001010", // Native MATIC

  // Common stablecoins by chain
  USDC: {
    "1": "0xa0b86a33e6156da1c0c2feeea8ed5c50e89c0c45", // Ethereum
    "56": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC
    "137": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // Polygon
    "8453": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // Base
    "noble-1": "uusdc", // Noble
  },
} as const;

// Skip API feature flags
export const SKIP_FEATURES = {
  CROSS_CHAIN_SWAPS: true,
  MULTI_HOP_TRANSFERS: true,
  BRIDGE_AND_ACT: true,
  REAL_TIME_TRACKING: true,
  GAS_PROTECTION: true,
  SLIPPAGE_PROTECTION: true,
  FAILURE_RECOVERY: true,
  DEX_AGGREGATION: true,
  BRIDGE_AGGREGATION: true,
} as const;

// Error codes that Skip might return
export const SKIP_ERROR_CODES = {
  INSUFFICIENT_LIQUIDITY: "insufficient_liquidity",
  UNSUPPORTED_CHAIN: "unsupported_chain",
  UNSUPPORTED_TOKEN: "unsupported_token",
  ROUTE_NOT_FOUND: "route_not_found",
  SLIPPAGE_TOO_HIGH: "slippage_too_high",
  AMOUNT_TOO_LOW: "amount_too_low",
  API_KEY_REQUIRED: "api_key_required",
  RATE_LIMITED: "rate_limited",
} as const;

// Skip API rate limits (approximate)
export const SKIP_RATE_LIMITS = {
  WITHOUT_API_KEY: {
    REQUESTS_PER_MINUTE: 10,
    REQUESTS_PER_HOUR: 100,
  },
  WITH_API_KEY: {
    REQUESTS_PER_MINUTE: 300,
    REQUESTS_PER_HOUR: 10000,
  },
} as const;

// How to get started with Skip
export const SKIP_GETTING_STARTED = {
  documentation: "https://docs.skip.build/go/general/getting-started",
  discord: "https://discord.gg/skip",
  apiKeyRequest: "Join Discord and request API key",
  integration: {
    restApi: "Use REST endpoints for maximum control",
    clientLibrary: "Use TypeScript library for easier integration",
    widget: "Embed Skip Go Widget for fastest deployment",
  },
  testnet: {
    available: true,
    chains: ["osmosis-testnet", "neutron-testnet", "juno-testnet"],
    recommendation: "Test on testnet before mainnet deployment",
  },
} as const;

/**
 * Helper function to get swap venues for a chain
 */
export function getSwapVenuesForChain(chainId: string): string[] {
  const normalizedChainId =
    CHAIN_ID_MAPPING[chainId as keyof typeof CHAIN_ID_MAPPING] || chainId;
  const venues =
    SKIP_SWAP_VENUES[normalizedChainId as keyof typeof SKIP_SWAP_VENUES];
  return venues ? [...venues] : [];
}

/**
 * Helper function to normalize chain ID for Skip API
 */
export function normalizeChainIdForSkip(chainId: string): string {
  return (
    CHAIN_ID_MAPPING[chainId as keyof typeof CHAIN_ID_MAPPING] ||
    chainId.split(":")[1] ||
    chainId
  );
}

/**
 * Helper function to validate if a chain is supported by Skip
 */
export function isChainSupportedBySkip(chainId: string): boolean {
  const normalizedChainId = normalizeChainIdForSkip(chainId);
  return Object.values(CHAIN_ID_MAPPING).includes(normalizedChainId as any);
}

/**
 * Helper function to get recommended slippage based on operation type
 */
export function getRecommendedSlippage(
  operationType: "same-chain-swap" | "cross-chain-swap" | "stablecoin-transfer"
): number {
  switch (operationType) {
    case "same-chain-swap":
      return 100; // 1%
    case "cross-chain-swap":
      return 300; // 3%
    case "stablecoin-transfer":
      return 50; // 0.5%
    default:
      return SKIP_CONFIG.DEFAULTS.SLIPPAGE_TOLERANCE_BPS;
  }
}

export const SwapVenues: {
  name: string;
  chainId: string;
}[] = [
  {
    name: "osmosis-poolmanager",
    chainId: "osmosis-1",
  },
  {
    name: "injective-helix",
    chainId: "injective-1",
  },
  {
    name: "injective-astroport",
    chainId: "injective-1",
  },
  {
    name: "injective-white-whale",
    chainId: "injective-1",
  },
  {
    name: "injective-dojoswap",
    chainId: "injective-1",
  },
  {
    name: "injective-hallswap",
    chainId: "injective-1",
  },
  {
    name: "neutron-drop",
    chainId: "neutron-1",
  },
  {
    name: "neutron-astroport",
    chainId: "neutron-1",
  },
  {
    name: "neutron-lido-satellite",
    chainId: "neutron-1",
  },
  {
    name: "persistence-dexter",
    chainId: "core-1",
  },
  {
    name: "pryzm-native",
    chainId: "pryzm-1",
  },
  {
    name: "chihuahua-white-whale",
    chainId: "chihuahua-1",
  },
  {
    name: "arbitrum-uniswap",
    chainId: "eip155:42161",
  },
  {
    name: "base-uniswap",
    chainId: "eip155:8453",
  },
  {
    name: "binance-uniswap",
    chainId: "eip155:56",
  },
  {
    name: "avalanche-uniswap",
    chainId: "eip155:43114",
  },
  {
    name: "optimism-uniswap",
    chainId: "eip155:10",
  },
  {
    name: "polygon-uniswap",
    chainId: "eip155:137",
  },
  {
    name: "blast-uniswap",
    chainId: "eip155:81457",
  },
  {
    name: "ethereum-uniswap",
    chainId: "eip155:1",
  },
  {
    name: "temp-forma",
    chainId: "eip155:984122",
  },
  {
    name: "neutron-duality",
    chainId: "neutron-1",
  },
];

export const SwapFeeBps = {
  value: 75,
  receivers: [
    {
      chainId: "osmosis-1",
      address: "osmo1h8rg7zknhxmffp3ut5ztsn8zcaytckfeq9njsj",
    },
    {
      chainId: "cosmoshub-4",
      address: "cosmos1h8rg7zknhxmffp3ut5ztsn8zcaytckfeg7qzxq",
    },
    {
      chainId: "noble-1",
      address: "noble1h8rg7zknhxmffp3ut5ztsn8zcaytckfeqa427w",
    },
    {
      chainId: "eip155:1",
      address: "0x8cF81131B8144f1b6D957E79B757A6643aBAf74C",
    },
    {
      chainId: "eip155:56",
      address: "0x8cF81131B8144f1b6D957E79B757A6643aBAf74C",
    },
  ],
};

// export const SwapFeeBps = {
//   value: 75,
//   receiver: "osmo1hvr9d72r5um9lvt0rpkd4r75vrsqtw6y86jn8t",
// };
export const SwapVenue: {
  name: string;
  chainId: string;
} = {
  name: "osmosis-poolmanager",
  chainId: "osmosis-1",
};
