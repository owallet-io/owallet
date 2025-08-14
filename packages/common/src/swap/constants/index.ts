export const AFFILIATE_ADDRESS = "orai1h8rg7zknhxmffp3ut5ztsn8zcaytckfemdkp8n";

// export const URL_BASE = "https://multichain-balance-service-stg.owallet.io";
export const URL_BASE = "https://multichain-balance-service.owallet.io";
// export const URL_BASE = 'https://4de3-222-252-31-239.ngrok-free.app';
export const API_ENDPOINTS = {
  GET_CHAINS: `${URL_BASE}/api/tokens/chains`,
  GET_CHAIN_BY_ID: `${URL_BASE}/api/tokens/chain-info`,
  SEARCH_TOKENS: `${URL_BASE}/api/tokens/search`,
  SEND_FCM_TOKEN_BATCH: `${URL_BASE}/api/balance-tracker/fcm-token/batch`,
  GET_TOKENS: "https://ks-setting.kyberswap.com/api/v1/tokens",
  GET_WALLET_BALANCES: `${URL_BASE}/api/balances/chain/{chainId}/address/{address}`,
  GET_WALLET_BALANCES_MULTI_CHAIN: `${URL_BASE}/api/balances/multi-chain`,
  GET_MULTI_TOKEN_INFO: `${URL_BASE}/api/balances/chain/{chainId}/address/{addressWallet}/tokens`,
  GET_ROUTES: "https://aggregator-api.kyberswap.com/{chain}/api/v1/routes",
  GET_PRICE_IMPACT: "https://bff.kyberswap.com/api/v1/price-impact",
  GET_PRICE_USD: "https://satellite.keplr.app/price/simple",
  GET_24H_CHANGE: "https://satellite.keplr.app/price/changes/24h",
  BUILD_TRANSACTION:
    "https://aggregator-api.kyberswap.com/{chain}/api/v1/route/build",
};
export const MAP_CHAIN_ID_TO_KYBER_ID = {
  "1": "ethereum",
  "56": "bsc",
};
export const RPC_ENDPOINTS = {
  "1": "https://ethereum.kyberengineering.io/",
  "42161": "https://arbitrum.kyberengineering.io/",
  "10": "https://optimism.kyberengineering.io/",
  "137": "https://polygon.kyberengineering.io/",
  "8453": "https://mainnet.base.org/",
  "56": "https://bsc.kyberengineering.io/",
  "43114": "https://avalanche.kyberengineering.io/",
  "4337": "https://rpc.soniclabs.com/",
};

export const DEFAULT_CHAINS = {
  ETHEREUM: "1",
  ARBITRUM: "42161",
  OPTIMISM: "10",
  POLYGON: "137",
  BASE: "8453",
  BSC: "56",
  AVALANCHE: "43114",
};

export const SLIPPAGE_OPTIONS = [
  { label: "1%", value: 1 },
  { label: "3%", value: 3 },
  { label: "5%", value: 5 },
];

export const POLLING_INTERVAL = 10000; // 10 seconds

export const DEFAULT_SLIPPAGE = 0.5;

export const NATIVE_TOKEN_ADDRESS =
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const PROVIDERS = {
  kyberswap: {
    name: "Kyber",
    image:
      "https://pbs.twimg.com/profile_images/1641706567014940672/UFuWgdxn_400x400.jpg",
  },
  jupiter: {
    name: "Jupiter",
    image:
      "https://support.jup.ag/hc/theming_assets/01JK6E3ECFCVSBV57THP9RKVJQ",
  },
  obridge: {
    name: "OBridge",
    image: "https://avatars.githubusercontent.com/u/180637973?s=280&v=4",
  },
  skip: {
    name: "Skip",
    image: "https://img.cryptorank.io/coins/skip_protocol1733834754901.png",
  },
};
export const TOKENS_PER_PAGE = 100;
export const NATIVE_TOKENS: Record<number, any> = {
  1: {
    chainId: 1,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    isWhitelisted: true,
    isStable: false,
    isStandardERC20: false,
    isHoneypot: false,
    isFOT: false,
  },
  56: {
    chainId: 56,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: "BNB",
    name: "Binance Coin",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png",
    isWhitelisted: true,
    isStable: false,
    isStandardERC20: false,
    isHoneypot: false,
    isFOT: false,
  },
  137: {
    chainId: 137,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: "MATIC",
    name: "Polygon",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
    isWhitelisted: true,
    isStable: false,
    isStandardERC20: false,
    isHoneypot: false,
    isFOT: false,
  },
  42161: {
    chainId: 42161,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    isWhitelisted: true,
    isStable: false,
    isStandardERC20: false,
    isHoneypot: false,
    isFOT: false,
  },
  10: {
    chainId: 10,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    isWhitelisted: true,
    isStable: false,
    isStandardERC20: false,
    isHoneypot: false,
    isFOT: false,
  },
  8453: {
    chainId: 8453,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    isWhitelisted: true,
    isStable: false,
    isStandardERC20: false,
    isHoneypot: false,
    isFOT: false,
  },
  43114: {
    chainId: 43114,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: "AVAX",
    name: "Avalanche",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
    isWhitelisted: true,
    isStable: false,
    isStandardERC20: false,
    isHoneypot: false,
    isFOT: false,
  },
  250: {
    chainId: 250,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: "FTM",
    name: "Fantom",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png",
    isWhitelisted: true,
    isStable: false,
    isStandardERC20: false,
    isHoneypot: false,
    isFOT: false,
  },
};
export const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",

  // Write functions
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
];

// Export Skip-specific constants
export * from "./skip-config";
