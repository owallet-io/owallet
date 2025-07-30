import { Route, RouteParams, Transaction } from "../../types/v2";
import { AppCurrency } from "@owallet/types";

/**
 * BaseAdapter is an abstract class that defines the interface for swap providers
 * All swap providers (KyberSwap, Jupiter, etc.) should extend this class
 */
export abstract class BaseAdapter {
  /** Provider identifier */
  abstract readonly provider: string;

  /** Chains supported by this provider */
  abstract readonly supportedChains: string[];
  /**
   * Check if this adapter supports AbortController
   * Override this in adapters that don't support abort
   */
  supportsAbortController(): boolean {
    return true; // Default to true for most adapters
  }
  /**
   * Get available routes for a swap
   * @param params Swap parameters including tokens, amount, and slippage
   * @returns Promise with array of available routes
   */
  abstract getRoutes(
    params: RouteParams,
    signal?: AbortSignal
  ): Promise<Route[]>;

  /**
   * Build a transaction for the selected route
   * @param route Selected route object
   * @param userAddress User's wallet address
   * @param slippageTolerance Slippage tolerance in basis points (e.g. 50 = 0.5%)
   * @returns Promise with transaction data
   */
  abstract buildTransaction(
    route: Route,
    userAddress: string,
    slippageTolerance: number
  ): Promise<Transaction>;

  /**
   * Build a transaction for the selected route
   * @param tx transaction data
   * @param userAddress with string
   * @param destinationChainCurrencies currencies for the destination chain
   * @param ibcSwapConfigs IBC swap configurations (optional)
   * @returns Promise with string
   */
  abstract signAndSendTransaction(
    tx: Transaction,
    userAddress: string,
    destinationChainCurrencies?: AppCurrency[],
    extraSwapLogic?: Function
  ): Promise<string>;

  /**
   * Check if approval is needed for EVM tokens
   * @param tokenAddress Token contract address
   * @param ownerAddress Token owner address
   * @param spenderAddress Address that will spend the tokens
   * @param amount Amount to approve
   * @returns Promise with boolean indicating if approval is needed
   */
  abstract checkApprovalNeeded?(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: string,
    chainId: string | number
  ): Promise<boolean>;

  /**
   * Build approval transaction for EVM tokens
   * @param tokenAddress Token contract address
   * @param spenderAddress Address that will spend the tokens
   * @param amount Amount to approve
   * @param chainId ChainId to approve
   * @returns Promise with approval transaction data
   */
  abstract buildApprovalTransaction?(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    chainId: string | number
  ): Promise<Transaction>;

  /**
   * Get price impact for a swap
   * @param params Parameters needed to calculate price impact
   * @returns Promise with price impact data
   */
  abstract getPriceImpact?(params: {
    tokenInAddress: string;
    tokenInDecimals: number;
    tokenOutAddress: string;
    tokenOutDecimals: number;
    amountIn: string;
    amountOut: string;
    chainId: number;
  }): Promise<{ priceImpact: string }>;

  /**
   * Helper method to abort any ongoing requests
   */
  abstract abortRequests(): void;

  /**
   * Add affiliate fee to the transaction if supported
   * @param params Parameters needed to add fee
   */
  abstract addAffiliateFeeToBuildParams?(params: any): any;

  /**
   * Check if the provider supports a specific chain
   * @param chainId Chain identifier
   * @returns Boolean indicating if the chain is supported
   */
  supportsChain(chainId: string): boolean {
    return this.supportedChains.includes(chainId);
  }
}
