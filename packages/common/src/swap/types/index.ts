// Chain types
export interface NativeToken {
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
}

export interface Chain {
  id: string;
  name: string;
  type: string;
  prefixBech32?: string;
  nativeToken: {
    denom?: string;
    logoURI?: string;
    symbol: string;
    name: string;
    decimals: number;
    coingeckoId: string;
  };
  blockExplorer: string;
  logoUrl: string;
  rawConfig?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ChainsResponse {
  code: number;
  message: string;
  data: {
    hash: string;
    config: Chain[];
  };
}

// Chain API response
export type ChainApiResponse = ApiResponse<Chain[]>;
export type ChainByIdApiResponse = ApiResponse<Chain>;

// Token types
export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  isNative: boolean;
  isVerified: boolean;
  isToken2022?: boolean;
  coingeckoId?: string;
}

export interface ChainInfo {
  id: string;
  name: string;
  type: string;
  standardId: string;
}

export interface BalanceItem {
  chain: ChainInfo;
  token: TokenData;
  balance: string;
  balanceFormatted: string;
  usdPrice: number;
  usdValue: number;
  lastUpdated: string;
  // Optional properties for all-chains mode
  chainInfo?: Chain;
  chainId?: string;
}

export type BalancesResponse = ApiResponse<{ balances: BalanceItem[] }>;

// Keeping original Token interface for compatibility
export interface Token {
  id?: string;
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  image?: string;
  logoURI?: string;
  isWhitelisted: boolean;
  balance?: string;
  displayBalance?: string;
  isNativeToken?: boolean;
  usdValue?: string;
  hasPrice?: boolean;
  hasBalance?: boolean;
  priceChange24h?: number;
  isCustom?: boolean;
  price?: {
    usd: number;
    usd_24h_change: number;
    last_updated_at: number;
  };
  createdAt?: number;
  updatedAt?: number;
  coingeckoId?: string;
}

// New API response format
export type TokensResponse = ApiResponse<{ balances: BalanceItem[] }>;

// Route types
export interface ExtraFee {
  feeAmount: string;
  chargeFeeBy: string;
  isInBps: boolean;
  feeReceiver: string;
}

export interface PoolExtra {
  fee: number;
  feePrecision: number;
  blockNumber: number;
}

export interface RouteStep {
  pool: string;
  tokenIn: string;
  tokenOut: string;
  swapAmount: string;
  amountOut: string;
  exchange: string;
  poolType: string;
  poolExtra: PoolExtra;
  extra: any;
}

export interface RouteSummary {
  tokenIn: string;
  amountIn: string;
  amountInUsd: string;
  tokenOut: string;
  amountOut: string;
  amountOutUsd: string;
  gas: string;
  gasPrice: string;
  gasUsd: string;
  l1FeeUsd: string;
  extraFee: ExtraFee;
  route: RouteStep[][];
  routeID: string;
  checksum: string;
  timestamp: number;
}

export interface RouteResponse {
  code: number;
  message: string;
  data: {
    routeSummary: RouteSummary;
    routerAddress: string;
  };
  requestId: string;
}

// Price impact types
export interface PriceImpactResponse {
  code: number;
  message: string;
  data: {
    amountInUSD: string;
    amountOutUSD: string;
    priceImpact: string;
  };
}

// Price USD types
export interface PriceUsdData {
  [tokenId: string]: {
    usd: number;
    [currency: string]: number;
  };
}

// Search tokens types
export interface SearchTokenBalance {
  amount: string;
  lastUpdated: string;
  balanceFormatted: string;
  usdPrice: number;
  usdValue: string;
}

export interface SearchTokenItem {
  _id: string;
  chainId: string;
  chainType: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string | null;
  coingeckoId?: string;
  isNative: boolean;
  isCustom: boolean;
  isVerified: boolean;
  isToken2022: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
  balance: SearchTokenBalance | null;
}

export interface SearchTokensResponse {
  success: boolean;
  data: SearchTokenItem[];
  message?: string;
}

// 24h Change types
export interface Change24hData {
  [tokenId: string]: number;
}

// Transaction build types
export interface BuildTransactionRequest {
  routeSummary: RouteSummary;
  sender: string;
  recipient: string;
  permit?: string;
  deadline?: number;
  slippageTolerance: number;
  ignoreCappedSlippage?: boolean;
  enableGasEstimation?: boolean;
  source?: string;
  referral?: string;
  skipSimulateTx?: string;
}

export interface BuildTransactionResponse {
  code: number;
  message: string;
  data: {
    amountIn: string;
    amountInUsd: string;
    amountOut: string;
    amountOutUsd: string;
    gas: string;
    gasUsd: string;
    additionalCostUsd?: string;
    additionalCostMessage?: string;
    data: string;
    routerAddress: string;
    transactionValue: string;
  };
  requestId: string;
}

// UI State types
export interface SwapState {
  fromChain: Chain | null;
  toChain: Chain | null;
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  amountOut: string;
  slippage: number;
  customSlippage: string;
  route: RouteSummary | null;
  isProcessing: boolean;
  isRouteLoading: boolean;
  error: string | null;
  transaction: BuildTransactionResponse["data"] | null;
}

export interface TokenBalances {
  [chainId: string]: {
    [tokenAddress: string]: string;
  };
}

export interface PricesUsd {
  [tokenSymbol: string]: number;
}

import { TokenItemType } from "@oraichain/oraidex-common";
// Import from a relative path to avoid circular references
// import {Chain as ImportedChain, Token as ImportedToken} from "@screens/swap/types";

export type voidNode = () => React.ReactNode;
export type NodeElement = React.ReactNode | voidNode;
export type TokenInfo = {
  symbol: string;
  logo: string;
  network: string;
  available?: string;
  networkLogo?: string;
};
export type TypeTextAndCustomizeComponent = NodeElement | string;
export interface IInputSelectToken {
  tokenActive: TokenItemType;
  amount?: string;
  type?: "from" | "to";
  amountUsd?: string;
  currencyValue?: string;
  editable?: boolean;
  loading?: boolean;
  impactWarning?: number;
  onChangeAmount?: (txt: any) => void;
  onOpenTokenModal: (ev: any) => void;
  tokens: BalanceItem[];
  selectedToken: BalanceItem | null;
  onSelectToken: (token: BalanceItem) => void;
}

export interface ISwapBox extends Omit<IInputSelectToken, "type"> {
  network: string;
  tokenFee?: number;
  currencyValue?: string;
  balanceValue: string | number;
  tokenActive: TokenItemType;
  editable?: boolean;
  disabled?: boolean;
  onOpenNetworkModal: () => void;
  onSelectAmount?: () => void;
  type?: string;
  loading?: boolean;
  impactWarning?: number;
  chains?: Chain[];
  amountUsd?: string;
}

export type BalanceType = {
  id: string;
  value: string;
};

const ONE_QUARTER = "25";
const HALF = "50";
const THREE_QUARTERS = "75";
export const MAX = "100";
export const interpolateURL = "https://static.orai.io/interpolate.html";
export const oraidexURL = "https://app.oraidex.io";

export const balances: BalanceType[] = [
  {
    id: "1",
    value: ONE_QUARTER,
  },
  { id: "2", value: HALF },
  { id: "3", value: THREE_QUARTERS },
  { id: "4", value: MAX },
];
