// Chain information
export interface ChainInfo {
  id: string;
  chainId: string;
  name: string;
  shortName: string;
  nativeCoinId: string;
  logoUrl: string;
  bech32Prefix?: string;
}

// Token information
export interface Token {
  id: string;
  address: string;
  symbol: string;
  name: string;
  logoUrl: string;
  decimals: number;
  isWhitelisted: boolean;
  isNative: boolean;
  chainId: string;
}

// Token with balance information
export interface TokenBalance extends Token {
  balance: string;
  displayBalance: string;
  usdValue: string;
  price: number;
  priceChange24h: number;
}

// Swap route parameters
export interface RouteParams {
  tokenIn: string;
  tokenOut: string;
  tokenInDecimals: number;
  tokenOutDecimals: number;
  amount: string;
  chainId: string;
  chainIdOut: string;
  slippageTolerance: number;
}

// Swap route information
export interface Route {
  id: string;
  provider: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  amountInUsd: string;
  amountOutUsd: string;
  priceImpact: string;
  estimatedGas: string;
  estimatedGasUsd: string;
  route: any[]; // The detailed route path, structure varies by provider
  routerAddress: string;
  chainId: string;
  extraParams?: Record<string, any>;
  quoteResponse?: any;
  displayAmount?: string;
  routeSummary?: any;
  minimumReceived?: string;
  minimumReceivedUsd?: string;
}

// Transaction data
export interface Transaction {
  to: string;
  data: Uint8Array;
  value: string;
  gasLimit: string;
  chainId: string;
  provider: string;
  serializeConfig?: {
    requireAllSignatures?: boolean;
    verifySignatures?: boolean;
  };
}

// Swap quote information
export interface SwapQuote {
  route: Route;
  transaction?: Transaction;
  approvalNeeded?: boolean;
  approvalTransaction?: Transaction;
}

// Token price information
export interface TokenPrice {
  usd: number;
  usd_24h_change: number;
  last_updated_at: number;
}

// Error response
export interface ErrorResponse {
  message: string;
  code?: string;
  data?: any;
}
