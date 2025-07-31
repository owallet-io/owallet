// Import Route, RouteParams and Transaction directly from types to avoid circular dependencies
// We're not extending BaseAdapter anymore so we don't need to import it
import { Route, RouteParams, Transaction } from "../../types/v2";
import axios, { AxiosInstance } from "axios";
import { Dec, DecUtils } from "@owallet/unit";
import { AppCurrency } from "@owallet/types";
import { getBase58Address } from "../../../utils";
import { fetchRetry } from "../../../api";
import { SkipBaseUrl } from "../../../config";
import { ethers } from "ethers";
import { getSwapVenuesForChain } from "../../constants/skip-config";
import { SwapFeeBps } from "../../../config";
import {
  route as skipRoute,
  executeRoute,
  setClientOptions,
} from "@skip-go/client/cjs";
import { OfflineAminoSigner, OfflineDirectSigner } from "@owallet/types";
import { createWalletClient, custom, Account } from "viem";
import { fetchChainById } from "..";

// Toast notification function
const showToastBackpack = (
  type: "success" | "danger",
  msg: string,
  duration?: number
) => {
  console.log(type, msg, duration);
};

function toCamelCase(str) {
  return str.replace(/([-_][a-z])/gi, (match) =>
    match.toUpperCase().replace("-", "").replace("_", "")
  );
}

function keysToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = toCamelCase(key);
      result[camelKey] = keysToCamel(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

// Constant for the native token address pattern used in EVM environments
const EVM_NATIVE_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

// Interface for Skip API affiliate fees configuration
interface AffiliateConfig {
  basisPointsFee: string;
  address: string;
}

interface ChainIdsToAffiliates {
  [chainId: string]: {
    affiliates: AffiliateConfig[];
  };
}

// Helper function to generate chainIdsToAffiliates configuration for Skip API
// Based on: https://docs.skip.build/go/general/affiliate-fees
function generateChainIdsToAffiliates(): ChainIdsToAffiliates {
  const chainIdsToAffiliates: ChainIdsToAffiliates = {};

  SwapFeeBps.receivers.forEach((receiver) => {
    // Normalize chain ID to Skip format (remove eip155: and cosmos: prefixes if present)
    const normalizedChainId = receiver.chainId
      .replace("eip155:", "")
      .replace("cosmos:", "");

    chainIdsToAffiliates[normalizedChainId] = {
      affiliates: [
        {
          basisPointsFee: SwapFeeBps.value.toString(),
          address: receiver.address,
        },
      ],
    };
  });

  return chainIdsToAffiliates;
}

interface SkipRouteRequest {
  amount_in: string;
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  cumulative_affiliate_fee_bps?: string;
  allow_multi_tx?: boolean;
  allow_unsafe?: boolean;
  allow_swaps?: boolean;
  client_id?: string;
  swap_venues?: Array<{
    name: string;
    chainId: string;
  }>;
  smart_relay?: boolean;
  go_fast?: boolean;
  experimental_features?: string[];
  smart_swap_options?: {
    evm_swaps?: boolean;
    split_routes?: boolean;
  };
}

interface SkipRouteResponse {
  amount_in: string;
  amount_out: string;
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  operations: SkipOperation[];
  chain_ids: string[];
  required_chain_addresses: string[];
  does_swap: boolean;
  estimated_amount_out: string;
  swap_venue?: {
    name: string;
    chain_id: string;
  };
  swap_venues?: Array<{
    name: string;
    chain_id: string;
  }>;
  txs_required: number;
  usd_amount_in?: string;
  usd_amount_out?: string;
  swap_price_impact_percent?: string;
  estimated_fees?: Array<{
    amount: string;
    origin_asset: {
      denom: string;
      chain_id: string;
    };
  }>;
  estimated_route_duration_seconds?: number;
}

interface SkipOperation {
  transfer?: {
    port: string;
    channel: string;
    from_chain_id: string;
    to_chain_id: string;
    pfm_enabled: boolean;
    supports_memo: boolean;
    dest_denom: string;
    bridge_id: string;
  };
  swap?: {
    swap_in: {
      swap_venue: {
        name: string;
        chain_id: string;
      };
      swap_operations: Array<{
        pool: string;
        denom_in: string;
        denom_out: string;
      }>;
      swap_amount_in: string;
      price_impact_percent: string;
    };
    estimated_affiliate_fee: string;
    from_chain_id: string;
    chain_id: string;
    denom_in: string;
    denom_out: string;
  };
}

interface SkipMsgsDirectRequest {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  chain_ids_to_addresses: Record<string, string>;
  slippage_tolerance_percent: string;
  allow_multi_tx?: boolean;
  client_id?: string;
}

interface SkipMsgsDirectResponse {
  msgs: Array<{
    multi_chain_msg: {
      chain_id: string;
      path: string[];
      msg: string;
      msg_type_url: string;
    };
  }>;
  route: SkipRouteResponse;
}

export class SkipAdapter {
  readonly provider = "skip";
  readonly logo =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAD5UExURUdwTKKdu66owqGcu5SKsJSKr5SKr5+au5ePsqievamdvK+pwaacvKCcu6OdvJeMsJaMsJyXuJeNsZeOsZiOsZqTtZmQspmQs5mPspmPspmQs5mPspmPsZyVtpqRtJqRtJqRs5mQspmQspmQs5mQspmPs5mQs5mQs5mQspmQs5mQs5mQspmQs5mQspmQs5mQs5mQs5mQs5mQs5mQs5mQs5qRtJmQs5mQs5mQs5qRs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQs5mQsxalwpkAAACTdFJOUMD6iU0CBgj3/Tw4AdSOLk+HzHAg7M9DDJ27CrLzHY9F4y81gIis6zJBoN35JhKy87aPWhmDS/vcKdf+Q3iV3LyYp+i4u8CnkduuWq1olqXJxZ+7eUiAvbBoHIl9+mpw6L6MWOVY3IIq6qg/NHRx4b9XpCzw1EPL1UBkzjfSOiyFNuA9x5OqfCT+7LFC9xYfkoTMoLpX3/JVLlHuAAACdUlEQVRYw+2Y13LaMBSGhdgYxwVDiUMCgXTSJCXd6b333vf7v0YP2AZLuF7ZXORizv9fUL7ROYcj2YgYJmKQFq1INkQmDZFEWdPUosUcVgQ6SBVkVQHqAOHEcQwLMtGiKJJOIGBBvbK6ti7Jm1s+7Gw7nUCnDjG5u7e9H8DBoScm1Q+oBI4x+fDR4XE7cO+JTw7xU07+7Oz5i8MHTglhbnHei7OXr84P/dIdng/LPee9efvuvK4nUF6EfXj/4VOzOVBOCpjy6fPFxaF+5RDDrWnMjCNGdvH+y+Xl1VROApjys7OvrduEcM9vXF9fP3c5jTXlN41G41YJE+e39/f3jzwna47kz53f+eR3Vrn2GI0+NpttR4z03vMHrH7slYPWFKmhxuhzs9Gom9F791+w+5e+13OlQe00Rt+Gw2Gz41DZ59FSuWDuM9cXrZ8rPqKDdqHfaEzm8V26Xx0Tueh7bNPpD/wIN24eXVGWngcYz+7tgBh7w9HU6/eIX1bJgB/brNEoW0fj8bgHhjBR/PRqP7aneYUceiOYGdOJEAQ+ZScZkj2A7Cx2CvX2cDwdzRbQ6TTKJ4+reCDUgK7aAOXxyPPHPTfvhFqBLxfhRK2x7rruyPUYJfMmfxqizp0pcYu3m+59KicFDBPz3VGXiZxOJmJSMPytDya+Vb8v/EbuV94XOjKrfF/oG1mp7ws9ajfJ/cmVelcArBACBAm8N2pV+YMo3b8iPrj/gTrKH2+c/KdkvP9B/6uTT/33/9hPvXz/ay+f+Skn/5WTT/23q3z/SyX+RNVfwOz/yqJ/G1d+Y1R+q6qyyVYd67/k/gVzeaSuuIR45gAAAABJRU5ErkJggg==";

  // Skip supports cross-chain operations, so we include major Cosmos chains
  readonly supportedChains = [
    "cosmos:Oraichain",
    "cosmos:cosmoshub-4",
    "cosmos:osmosis-1",
    "cosmos:noble-1",
    "cosmos:evmos_9001-2",
    "cosmos:injective-1",
    "cosmos:dydx-mainnet-1",
    "cosmos:agoric-3",
    "cosmos:Neutaro-1",
    "cosmos:celestia",
    "cosmos:stargaze-1",
    "cosmos:omniflixhub-1",
    "cosmos:chihuahua-1",
    "eip155:1", // Ethereum
    "eip155:56", // BSC
    "eip155:137", // Polygon
    "eip155:42161", // Arbitrum
    "eip155:43114", // Avalanche
    "eip155:10", // Optimism
    "eip155:8453", // Base
    "eip155:80094", // Berachain
    "eip155:146", // Sonic
    "eip155:130", // Unichain
  ];

  private apiClient: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();
  private swapStore: any;

  constructor(swapStore: any) {
    this.apiClient = axios.create({
      baseURL: SkipBaseUrl,
      timeout: 30000, // 30 seconds timeout for cross-chain operations
      headers: {
        "Content-Type": "application/json",
      },
    });
    this.swapStore = swapStore;
  }

  /**
   * Check if the provider supports a specific chain
   * Handles both cosmos: prefixed and raw chain IDs
   */
  supportsChain(chainId: string): boolean {
    // Remove cosmos: prefix if present for checking
    const normalizedChainId = chainId;
    const isSupported = this.supportedChains.includes(normalizedChainId);

    return isSupported;
  }

  /**
   * Check if this adapter supports AbortController
   */
  supportsAbortController(): boolean {
    return true; // Default to true for most adapters
  }

  /* SkipAdapter now implements this method directly */

  async getRoutes(params: RouteParams, signal?: AbortSignal): Promise<Route[]> {
    const {
      tokenIn,
      tokenOut,
      amount,
      chainId,
      chainIdOut,
      slippageTolerance,
    } = params;

    // Create a new AbortController for this request
    const requestId = `${tokenIn}-${tokenOut}-${amount}-${Date.now()}`;

    // Abort ALL previous requests for this token pair
    for (const [key, controller] of Array.from(
      this.abortControllers.entries()
    )) {
      if (key.includes(`${tokenIn}-${tokenOut}`)) {
        controller.abort();
        this.abortControllers.delete(key);
      }
    }

    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    // Convert chain IDs to Skip format (remove eip155: and cosmos: prefixes)
    const sourceChainId = chainId.replace("eip155:", "").replace("cosmos:", "");
    const destChainId = chainIdOut
      .replace("eip155:", "")
      .replace("cosmos:", "");

    const sourceAssetDenom = this.isNativeToken(tokenIn)
      ? this.getNativeTokenDenom(chainId)
      : tokenIn;
    const destAssetDenom = this.isNativeToken(tokenOut)
      ? this.getNativeTokenDenom(chainIdOut)
      : tokenOut;

    // Build request similar to Keplr's implementation
    const skipRequest: SkipRouteRequest = {
      amount_in: amount,
      source_asset_denom: sourceAssetDenom,
      source_asset_chain_id: sourceChainId,
      dest_asset_denom: destAssetDenom,
      dest_asset_chain_id: destChainId,
      cumulative_affiliate_fee_bps: "0", // 0.75% affiliate fee
      allow_multi_tx: false,
      allow_unsafe: true, // Allow unsafe operations for broader route discovery
      //   allow_swaps: true,
      client_id: "owallet",
      // swap_venues: [{ name: "osmosis-poolmanager", chainId: "osmosis-1" }], // this.getSwapVenues(sourceChainId, destChainId),
      smart_relay: true,
      go_fast: true,

      // experimental_features: [
      //   "hyperlane",
      //   "stargate",
      //   "eureka",
      //   "layer_zero"
      // ],
      smart_swap_options: {
        evm_swaps: true,
        split_routes: true,
      },
    };

    try {
      const endpoint = "/v2/fungible/route";
      const fullUrl = `${this.apiClient.defaults.baseURL}${endpoint}`;

      const response = await this.apiClient.post<SkipRouteResponse>(
        endpoint,
        skipRequest,
        {
          signal: signal || abortController.signal,
          headers: {
            "Content-Type": "application/json",
            // Add API key if available (similar to Keplr's implementation)
            ...(process.env.SKIP_API_KEY && {
              authorization: process.env.SKIP_API_KEY,
            }),
          },
        }
      );

      if (!response.data) {
        throw new Error("Skip API returned empty response");
      }

      // Enhanced response validation similar to Keplr's approach
      if (!this.validateSkipResponse(response.data)) {
        throw new Error("Skip API returned invalid response format");
      }

      // Check if the response indicates no routes available
      if (
        !response.data.does_swap ||
        response.data.estimated_amount_out === "0" ||
        !response.data.estimated_amount_out
      ) {
        return []; // Return empty array when no routes are available
      }

      //   const routeData = response.data;

      const routeData = response.data;
      // Calculate price impact
      let priceImpact = "0";
      if (routeData.swap_price_impact_percent) {
        priceImpact = routeData.swap_price_impact_percent;
      } else {
        if (routeData.usd_amount_in && routeData.usd_amount_out) {
          priceImpact = new Dec(1)
            .sub(
              new Dec(routeData.usd_amount_out || 0).quo(
                new Dec(routeData.usd_amount_in || 0)
              )
            )
            .mul(new Dec(100))
            .toString();
        }
      }

      // Calculate minimum received with slippage
      const slippageMultiplier = new Dec(1).sub(
        new Dec(slippageTolerance).quo(new Dec(10000)) // slippageTolerance is in basis points
      );

      const minimumReceived = new Dec(
        routeData.estimated_amount_out || "0"
      ).mul(slippageMultiplier);

      const minimumReceivedFormatted = minimumReceived.quo(
        DecUtils.getTenExponentN(params.tokenOutDecimals || 0)
      );

      // Format display amount
      const displayAmount = ethers.utils
        .formatUnits(
          routeData.estimated_amount_out || "0",
          params.tokenOutDecimals || 0
        )
        .toString();

      // Extract route path from operations
      const routePath = this.extractRoutePath(routeData.operations);

      // Calculate additional fees similar to Keplr's implementation
      const { swapFees, otherFees } = this.calculateFees(routeData);
      const totalFeesUsd = this.calculateTotalFeesUsd(swapFees, otherFees);
      const route: Route = {
        id: `skip-${routeData.source_asset_chain_id}-${
          routeData.dest_asset_chain_id
        }-${Date.now()}`,
        provider: this.provider,
        tokenIn: routeData.source_asset_denom,
        tokenOut: routeData.dest_asset_denom,
        amountIn: routeData.amount_in,
        amountOut: routeData.estimated_amount_out,
        displayAmount: displayAmount,
        amountInUsd: routeData.usd_amount_in || "0",
        amountOutUsd: routeData.usd_amount_out || "0",
        priceImpact: Number(priceImpact).toFixed(2),
        estimatedGas: "0", // Skip handles gas estimation internally
        estimatedGasUsd: totalFeesUsd,
        route: routePath,
        routerAddress: "", // Not applicable for cross-chain routes
        chainId: sourceChainId,
        extraParams: {
          skipRouteData: routeData,
          chainIds: routeData.chain_ids,
          requiredChainAddresses: routeData.required_chain_addresses,
          txsRequired: routeData.txs_required,
          estimatedDurationSeconds: routeData.estimated_route_duration_seconds,
          swapFees: swapFees,
          otherFees: otherFees,
          swapVenue: routeData.swap_venue,
        },
        minimumReceived: minimumReceivedFormatted.toString(),
        minimumReceivedUsd: routeData.usd_amount_out
          ? new Dec(routeData.usd_amount_out).mul(slippageMultiplier).toString()
          : "0",
      };

      return [route];
    } catch (error) {
      if (axios.isCancel(error)) {
        return [];
      }

      throw error;
    } finally {
      if (this.abortControllers.get(requestId) === abortController) {
        this.abortControllers.delete(requestId);
      }
    }
  }

  async buildTransaction(
    route: Route,
    userAddress: string,
    slippageTolerance: number
  ): Promise<any> {
    // Create transaction object with Skip route data
    const transaction = {
      data: route.extraParams.skipRouteData, // Use skipRouteData from extraParams
      chainId: route.chainId,
      provider: this.provider,
    };

    return transaction;
  }

  async signAndSendTransaction(
    tx: Transaction,
    userAddress: string,
    destinationChainCurrencies?: AppCurrency[],
    extraSwapLogic?: Function
  ): Promise<any> {
    let step = "init";
    try {
      // 1. Resolve required chain addresses
      step = "resolve-addresses";

      const skipRouteData = tx.data as unknown as SkipRouteResponse;
      const camelCaseSkipRouteData = keysToCamel(skipRouteData);

      // Validate skipRouteData
      if (!skipRouteData) {
        throw new Error("skipRouteData is undefined in transaction data");
      }
      if (
        !skipRouteData.required_chain_addresses ||
        !Array.isArray(skipRouteData.required_chain_addresses)
      ) {
        throw new Error(
          "skipRouteData.required_chain_addresses is missing or invalid"
        );
      }

      // Resolve addresses with better error handling
      const userAddresses = [];
      for (const chainID of skipRouteData.required_chain_addresses) {
        try {
          const address = await this.getAddress(chainID);
          if (
            !address ||
            typeof address !== "string" ||
            address.trim() === ""
          ) {
            throw new Error(
              `Invalid or empty address returned for chain ${chainID}. Got: ${address}`
            );
          }
          userAddresses.push({ chainId: chainID, address });
        } catch (error) {
          throw new Error(
            `Failed to resolve address for chain ${chainID}: ${error.message}`
          );
        }
      }

      // 2. Configure Skip client
      step = "configure-skip-client";
      setClientOptions({
        apiUrl: SkipBaseUrl,
        ...(process.env.SKIP_API_KEY && { apiKey: process.env.SKIP_API_KEY }),
      });

      // 3. Execute route
      step = "execute-route";

      // Validate parameters before calling executeRoute
      if (!skipRouteData) {
        throw new Error("[signAndSendTransaction]  skipRouteData is undefined");
      }
      if (!userAddresses || userAddresses.length === 0) {
        throw new Error(
          "[signAndSendTransaction]  userAddresses is empty or undefined"
        );
      }

      if (!userAddresses || userAddresses.length === 0) {
        throw new Error(
          "[signAndSendTransaction] userAddresses is empty or invalid"
        );
      }

      // Generate chainIdsToAffiliates configuration for affiliate fees
      const chainIdsToAffiliates = generateChainIdsToAffiliates();

      console.log(
        "[signAndSendTransaction] Generated chainIdsToAffiliates:",
        chainIdsToAffiliates
      );
      let txHashData = "";
      const executeRouteParams = {
        route: camelCaseSkipRouteData as any,
        userAddresses,
        chainIdsToAffiliates,
        getCosmosSigner: async (chainId: string) => {
          return this.getCosmosSigner(chainId);
        },
        getEvmSigner: async (chainId: string) => {
          return this.getEvmSigner(chainId);
        },
        getSvmSigner: async () => {
          return this.getSvmSigner();
        },
        onTransactionBroadcast: async ({ txHash, chainId }) => {
          txHashData = txHash;

          console.log(
            "[signAndSendTransaction] Transaction broadcasted:",
            txHash,
            chainId
          );
        },
        onTransactionTracked: async ({ txHash, chainId }) => {
          txHashData = txHash;
          console.log(
            `[signAndSendTransaction] Tracked ${txHash} on ${chainId}`
          );
        },
        onTransactionCompleted: async ({ chainId, txHash, status }) => {
          txHashData = txHash;
          console.log(
            `[signAndSendTransaction] Completed ${txHash} on ${chainId} with status ${status?.state}`
          );
        },
      };

      // Create a timeout promise for 10 seconds
      const timeoutPromise = new Promise<"timeout">((resolve) => {
        setTimeout(() => resolve("timeout"), 120000);
      });

      // Create executeRoute promise
      const executeRoutePromise = executeRoute(executeRouteParams);
      // Race between timeout and executeRoute
      const raceResult = await Promise.race([
        timeoutPromise,
        executeRoutePromise,
      ]);

      // If timeout occurred and we have a transaction hash, show notification
      if (raceResult === "timeout") {
        if (txHashData) {
          showToastBackpack(
            "success",
            `Transaction submitted and being processed: ${txHashData.slice(
              0,
              8
            )}...`
          );
        }
        throw new Error("Request rejected");
      }

      console.log("[signAndSendTransaction] ExecuteRoute result:", txHashData);
      return txHashData;
    } catch (error: any) {
      throw error;
    }
  }

  async checkApprovalNeeded(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: string,
    chainId: string | number
  ): Promise<boolean> {
    // Cosmos chains don't typically require token approvals like EVM chains
    // Most tokens are native or IBC tokens that don't need approval
    return false;
  }

  async buildApprovalTransaction(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    chainId: string | number
  ): Promise<Transaction> {
    throw new Error("Token approvals not required for Cosmos chains");
  }

  abortRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  addAffiliateFeeToBuildParams(params: any): any {
    // Skip handles affiliate fees at the route level
    return params;
  }

  async getPriceImpact(params: {
    tokenInAddress: string;
    tokenInDecimals: number;
    tokenOutAddress: string;
    tokenOutDecimals: number;
    amountIn: string;
    amountOut: string;
    chainId: number;
  }): Promise<{ priceImpact: string }> {
    // Calculate price impact based on input and output amounts
    try {
      const amountInDec = new Dec(params.amountIn).quo(
        DecUtils.getTenExponentN(params.tokenInDecimals)
      );
      const amountOutDec = new Dec(params.amountOut).quo(
        DecUtils.getTenExponentN(params.tokenOutDecimals)
      );

      if (amountInDec.isZero() || amountOutDec.isZero()) {
        return { priceImpact: "0" };
      }

      // Simple price impact calculation: (amountIn - amountOut) / amountIn * 100
      // This is a basic implementation - in production you'd want more sophisticated pricing
      const priceImpact = amountInDec
        .sub(amountOutDec)
        .quo(amountInDec)
        .mul(new Dec(100))
        .abs();

      return { priceImpact: priceImpact.toString() };
    } catch (error) {
      return { priceImpact: "0" };
    }
  }

  // Helper methods

  /**
   * Check if a token identifier represents a native token
   */
  private isNativeToken(token: string): boolean {
    return token === EVM_NATIVE_TOKEN_ADDRESS;
  }

  private getSwapVenues(
    sourceChainId: string,
    destChainId: string
  ): Array<{ name: string; chainId: string }> {
    const venueMap: Map<string, Set<string>> = new Map();

    const collectVenues = (cid: string) => {
      const names = getSwapVenuesForChain(cid);
      if (names && names.length > 0) {
        if (!venueMap.has(cid)) {
          venueMap.set(cid, new Set());
        }
        names.forEach((n) => venueMap.get(cid)!.add(n));
      }
    };

    collectVenues(sourceChainId);
    if (destChainId !== sourceChainId) {
      collectVenues(destChainId);
    }

    // Always include Osmosis venues as central hub if not already present
    collectVenues("osmosis-1");

    const result: Array<{ name: string; chainId: string }> = [];
    venueMap.forEach((names, cid) => {
      names.forEach((name) => {
        if (!name.startsWith("temp-")) {
          result.push({ name, chainId: cid });
        }
      });
    });

    return result;
  }

  private getNativeTokenDenom(chainId: string): string {
    // Map chain IDs to their native token denominations
    // const nativeTokenMap: Record<string, string> = {
    //   "cosmoshub-4": "uatom",
    //   "osmosis-1": "uosmo",
    //   "juno-1": "ujuno",
    //   "stargaze-1": "ustars",
    //   "akashnet-2": "uakt",
    //   "regen-1": "uregen",
    //   "sentinelhub-2": "udvpn",
    //   "secret-4": "uscrt",
    //   "axelar-dojo-1": "uaxl",
    //   "phoenix-1": "uluna",
    //   "neutron-1": "untrn",
    //   "noble-1": "uusdc", // Noble's primary token is USDC
    //   "stride-1": "ustrd",
    //   "injective-1": "inj",
    //   "kava_2222-10": "ukava",
    //   "evmos_9001-2": "aevmos",
    //   "gravity-bridge-3": "ugraviton",
    //   "chihuahua-1": "uhuahua",
    //   "omniflixhub-1": "uflix",
    //   "columbus-5": "uluna",
    //   "crescent-1": "ucre",
    //   "kaiyo-1": "ukuji",
    //   Oraichain: "orai",
    //   // EVM chains
    //   "1": "eth", // Ethereum native token (ETH)
    //   "56": "binance-native", // BSC native token (BNB)
    //   // Add more as needed
    // };

    // return nativeTokenMap[chainId] || "unknown";
    const chain = this.swapStore.chainMap[chainId];
    return chain?.rawConfig?.feeCurrencies?.[0]?.coinMinimalDenom || "unknown";
  }

  private extractRoutePath(operations: SkipOperation[]): string[] {
    const path: string[] = [];

    for (const operation of operations) {
      if (operation.transfer) {
        path.push(`Transfer via ${operation.transfer.bridge_id || "IBC"}`);
      } else if (operation.swap) {
        // Safely access nested properties
        const swapVenueName =
          operation.swap?.swap_in?.swap_venue?.name || "Unknown DEX";
        path.push(`Swap on ${swapVenueName}`);
      }
    }

    return path.length > 0 ? path : ["Direct Transfer"];
  }

  private calculateFees(routeData: SkipRouteResponse): {
    swapFees: Array<{ amount: string; denom: string; chainId: string }>;
    otherFees: Array<{ amount: string; denom: string; chainId: string }>;
  } {
    const swapFees: Array<{ amount: string; denom: string; chainId: string }> =
      [];
    const otherFees: Array<{ amount: string; denom: string; chainId: string }> =
      [];

    // Extract swap fees from operations (similar to Keplr's swapFee computed property)
    for (const operation of routeData.operations) {
      if (operation.swap && operation.swap.estimated_affiliate_fee) {
        const fee = operation.swap.estimated_affiliate_fee;
        const swapIn = operation.swap.swap_in;

        if (swapIn && swapIn.swap_venue) {
          // Parse fee format like "1000uosmo"
          const match = fee.match(/^([0-9]+)([a-zA-Z][a-zA-Z0-9/-]*)$/);
          if (match) {
            swapFees.push({
              amount: match[1],
              denom: match[2],
              chainId:
                swapIn.swap_venue.chain_id ||
                operation.swap.chain_id ||
                "unknown",
            });
          }
        }
      }
    }

    // Extract other fees from estimated_fees (similar to Keplr's otherFees computed property)
    if (routeData.estimated_fees) {
      for (const fee of routeData.estimated_fees) {
        otherFees.push({
          amount: fee.amount,
          denom: fee.origin_asset.denom,
          chainId: fee.origin_asset.chain_id,
        });
      }
    }

    return { swapFees, otherFees };
  }

  private calculateTotalFeesUsd(
    swapFees: Array<{ amount: string; denom: string; chainId: string }>,
    otherFees: Array<{ amount: string; denom: string; chainId: string }>
  ): string {
    // For now, return "0" as we don't have USD conversion rates
    // In a full implementation, you would fetch token prices and convert fees to USD
    return "0";
  }

  private validateSkipResponse(data: any): data is SkipRouteResponse {
    // Basic validation of essential properties (simplified version of Keplr's Joi validation)
    return (
      data &&
      typeof data === "object" &&
      typeof data.amount_in === "string" &&
      typeof data.amount_out === "string" &&
      typeof data.source_asset_denom === "string" &&
      typeof data.source_asset_chain_id === "string" &&
      typeof data.dest_asset_denom === "string" &&
      typeof data.dest_asset_chain_id === "string" &&
      Array.isArray(data.operations) &&
      Array.isArray(data.chain_ids) &&
      typeof data.txs_required === "number"
    );
  }

  /**
   * Get Cosmos signer for the specified chain
   */
  private async getCosmosSigner(
    chainId: string
  ): Promise<(OfflineAminoSigner & OfflineDirectSigner) | null> {
    try {
      // Access the global owallet instance
      const owallet = (window as any).owallet;
      if (!owallet) {
        return null;
      }

      // Create and return the Cosmos offline signer
      const cosmosChainId = chainId.replace("cosmos:", "");

      return owallet.getOfflineSigner(cosmosChainId);
    } catch (error) {
      return null;
    }
  }

  private async getEvmSigner(chainId: string) {
    const ethereum = (window as any).owallet.ethereum;
    if (!ethereum) {
      throw new Error("MetaMask not installed");
    }

    // Fetch chain info from API
    let chainConfig;
    try {
      const response = await fetchChainById(`eip155:${chainId}`);
      if (!response.success || !response.data) {
        throw new Error("Invalid chain data response");
      }

      const data = response.data;
      chainConfig = {
        id: data.rawConfig?.evm?.chainId || parseInt(chainId),
        name: data.rawConfig?.chainName || data.name,
        nativeCurrency: {
          name: data.nativeToken?.name || "ETH",
          symbol: data.nativeToken?.symbol || "ETH",
          decimals: data.nativeToken?.decimals || 18,
        },
        rpcUrls: {
          default: {
            http: [data.rawConfig?.evm?.rpc || data.rawConfig?.rpc],
          },
        },
      };
    } catch (error) {
      // Fallback to default configuration
      chainConfig = {
        id: parseInt(chainId),
        name: `Chain ${chainId}`,
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: [`https://evm-${chainId}.keplr.app`],
          },
        },
      };
    }

    const accounts = (await ethereum.request({
      method: "eth_requestAccounts",
      chainId: `eip155:${chainId}`,
    })) as Account[];
    const account = accounts?.[0];
    if (!account) {
      throw new Error("No accounts found");
    }

    const client = createWalletClient({
      account,
      chain: chainConfig,
      transport: custom(ethereum),
    });
    return client;
  }

  /**
   * Get Solana signer
   */
  private getSvmSigner(): any | null {
    try {
      // Access the global owallet solana provider
      const owallet = (window as any).owallet;
      if (!owallet?.solana) {
        return null;
      }

      // Return the solana provider which can be used for signing
      return owallet.solana;
    } catch (error) {
      return null;
    }
  }

  /**
   * Handle transaction broadcast event
   */
  private async onTransactionBroadcast(
    txHash: string,
    chainId: string
  ): Promise<void> {
    try {
      // TODO: Implement transaction tracking in your app
      // This could involve:
      // 1. Storing the transaction in local state
      // 2. Showing a notification to the user
      // 3. Starting periodic status checks
      // 4. Updating UI to show transaction is pending
      // Example notification (if you have a notification system):
      // showNotification({
      //   type: 'info',
      //   title: 'Transaction Broadcasted',
      //   message: `Transaction ${txHash} has been submitted to ${chainId}`
      // });
    } catch (error) {}
  }

  /**
   * Helper method to get user address for a specific chain
   * Uses the mobile app's address management system
   */
  private async getAddress(chainId: string): Promise<string> {
    try {
      const owallet = (window as any).owallet;
      if (!owallet) {
        throw new Error("OWallet not available");
      }

      // Type 3: Tron chains (strings starting with 'tron:')
      if (chainId.startsWith("tron:")) {
        const key = await owallet.getKey("eip155:728126428");
        if (!key?.ethereumHexAddress) {
          throw new Error(`No Tron address found for chain ${chainId}`);
        }
        return getBase58Address(key.ethereumHexAddress);
      }

      // Type 4: Solana chains (strings starting with 'solana:')
      if (chainId.startsWith("solana:")) {
        const key = await owallet.solana.getKey(
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
        );
        if (!key?.base58Address) {
          throw new Error(`No Solana address found for chain ${chainId}`);
        }
        return key.base58Address;
      }

      // Type 1: Numeric strings (EVM chains like '1', '56', '137', etc.)

      if (/^\d+$/.test(chainId)) {
        const accounts = (await owallet.ethereum.request({
          method: "eth_requestAccounts",
          chainId: `eip155:${chainId}`,
        })) as string[];
        const account = accounts?.[0];
        if (!account) {
          throw new Error(`No Ethereum address found for chain ${chainId}`);
        }
        return account;
      }

      // Type 2: Other strings (Cosmos chains like 'osmosis-1', 'noble-1', 'Oraichain', etc.)
      try {
        const key = await owallet.getKey(chainId);
        if (!key?.bech32Address) {
          throw new Error(`No bech32 address found for chain ${chainId}`);
        }
        return key.bech32Address;
      } catch (error) {
        const data = await fetchRetry(
          "https://keplr-chain-registry.vercel.app/api/chains"
        );
        if (!data.chains) {
          throw new Error(`No chains found in registry`);
        }
        const chain = data.chains.find((c) => c.chainId === chainId);
        if (!chain) {
          throw new Error(`Chain ${chainId} not found in registry`);
        }
        await owallet.experimentalSuggestChain(chain);
        const key = await owallet.getKey(chainId);
        if (!key?.bech32Address) {
          throw new Error(`No bech32 address found for chain ${chainId}`);
        }
        return key.bech32Address;
      }
    } catch (error) {
      throw new Error(
        `Address retrieval for chain ${chainId} failed: ${error.message}`
      );
    }
  }
}
