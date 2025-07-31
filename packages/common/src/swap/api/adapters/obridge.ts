import { BaseAdapter } from "./BaseAdapter";
import { Route, RouteParams, Transaction } from "../../types/v2";
import axios, { AxiosInstance } from "axios";
import { UniversalSwapHelper } from "@oraichain/oraidex-universal-swap";
import {
  BigDecimal,
  DEFAULT_SLIPPAGE,
  OraidexCommon,
  TokenItemType,
  getTokenOnOraichain,
} from "@oraichain/oraidex-common";
import { OraiswapRouterQueryClient } from "@oraichain/oraidex-contracts-sdk";
import {
  ChainIdEnum,
  getEvmAddress,
  toAmount,
  isValidTronAddress,
} from "../../../utils";
import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import { ethers } from "ethers";
import {
  calculateAllFeesAndTotal,
  calculateRelayerFee,
  getRouterConfig,
} from "../../utils/fee-calculator";
import {
  UniversalSwapData,
  UniversalSwapHandler,
} from "@oraichain/oraidex-universal-swap";
import { Networks } from "@oraichain/ethereum-multicall";
import { AFFILIATE_ADDRESS, NATIVE_TOKEN_ADDRESS } from "../../constants/index";
import { getSpecialCoingecko } from "../../utils/chain-utils";
import { getMultipleAddresses } from "../../utils";
import { Dec } from "@owallet/unit";
import { SwapCosmosWallet, SwapEvmWallet } from "../../wallet";
import { AppCurrency } from "@owallet/types";

/**
 * Interface cho network configuration
 */
interface NetworkConfig {
  router: string;
  oracle?: string;
  [key: string]: any;
}

/**
 * Interface cho Oraichain network configuration
 */
interface OraichainNetworkConfig {
  rpc: string;
  rest?: string;
  chainId?: string;
  [key: string]: any;
}

/**
 * Cache interface for simulation results
 */
interface SimulationCache {
  [key: string]: {
    result: any;
    timestamp: number;
  };
}

// Add interface for swap transaction data
interface SwapTransactionData {
  cosmosAddress: string;
  evmAddress: string;
  tronAddress: string;
  originalFromToken: TokenItemType;
  originalToToken: TokenItemType;
  simulateData: any;
  relayerFeeToken: any;
  ratio: any;
  userSlippage: number;
  fromAmount: number;
  amountsBalance: any;
  sendToAddress?: string;
  useAlphaIbcWasm: boolean;
  useIbcWasm: boolean;
}

export class ObridgeAdapter extends BaseAdapter {
  readonly provider = "obridge";
  readonly supportedChains = [
    "cosmos:Oraichain",
    "cosmos:cosmoshub-4",
    "cosmos:osmosis-1",
    "cosmos:Neutaro-1",
    "cosmos:noble-1",
    "cosmos:injective-1",
    "cosmos:celestia",
    "eip155:1",
    "eip155:56",
    "tron:0x2b6653dc",
  ];

  private apiClient: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();
  private prices: Record<string, { usd: number }> = {};
  private priceRefreshInterval: NodeJS.Timeout | null = null;
  private lastPriceUpdate: number = 0;
  private RELAYER_DECIMAL = 6;

  // Common data from OraidexCommon with proper types
  private flattenTokens: TokenItemType[] = [];
  private oraichainTokens: TokenItemType[] = [];
  private network: NetworkConfig | null = null;
  private oraichainNetwork: OraichainNetworkConfig | null = null;

  // Performance optimization caches
  private tokenMap: Map<string, TokenItemType> = new Map();
  private clientCache: cosmwasm.SigningCosmWasmClient | null = null;
  private routerClientCache: OraiswapRouterQueryClient | null = null;
  private simulationCache: SimulationCache = {};
  private readonly CACHE_TTL = 30000; // 30 seconds
  private readonly SIMULATION_CACHE_TTL = 60000; // 1 minute
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 500; // 500ms

  private swapStore: any;

  private splitsOSOR = {
    ORAICHAIN: 5,
    OTHERCHAIN: 1,
    DEFAULTCHAIN: 10,
  };

  constructor(swapStore: any) {
    super();
    this.apiClient = axios.create({
      timeout: 10000,
    });
    this.swapStore = swapStore;
    this.initPriceData();
  }

  /**
   * Check if common data has been loaded
   */
  private isCommonDataLoaded(): boolean {
    return (
      this.flattenTokens.length > 0 &&
      this.oraichainTokens.length > 0 &&
      this.network !== null &&
      this.oraichainNetwork !== null
    );
  }

  /**
   * Build optimized token map for O(1) lookups
   */
  private buildTokenMap() {
    this.tokenMap.clear();
    this.flattenTokens.forEach((token) => {
      const key = (token.contractAddress || token.denom).toLowerCase();
      this.tokenMap.set(key, token);
    });
  }

  /**
   * Get cached client or create new one
   */
  private async getClient(): Promise<cosmwasm.SigningCosmWasmClient> {
    if (this.clientCache) {
      return this.clientCache;
    }

    const wallet = (window as any).owallet.getOfflineSigner(
      ChainIdEnum.Oraichain
    );
    this.clientCache = await cosmwasm.SigningCosmWasmClient.connectWithSigner(
      this.oraichainNetwork!.rpc,
      wallet
    );
    return this.clientCache;
  }

  /**
   * Get cached router client or create new one
   */
  private async getRouterClient(): Promise<OraiswapRouterQueryClient> {
    if (this.routerClientCache) {
      return this.routerClientCache;
    }

    const client = await this.getClient();
    this.routerClientCache = new OraiswapRouterQueryClient(
      client,
      this.network!.router
    );
    return this.routerClientCache;
  }

  /**
   * Generate cache key for simulation
   */
  private getSimulationCacheKey(
    fromToken: string,
    toToken: string,
    amount: string,
    options: any
  ): string {
    return `${fromToken}-${toToken}-${amount}-${JSON.stringify(options)}`;
  }

  /**
   * Check if simulation cache is valid
   */
  private isSimulationCacheValid(cacheEntry: any): boolean {
    return Date.now() - cacheEntry.timestamp < this.SIMULATION_CACHE_TTL;
  }

  /**
   * Get cached simulation or perform new simulation
   */
  private async getCachedSimulation(
    cacheKey: string,
    simulationFn: () => Promise<any>
  ): Promise<any> {
    // const cached = this.simulationCache[cacheKey];
    // if (cached && this.isSimulationCacheValid(cached)) {
    //   return cached.result;
    // }

    const result = await simulationFn();
    this.simulationCache[cacheKey] = {
      result,
      timestamp: Date.now(),
    };

    return result;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache() {
    const now = Date.now();
    Object.keys(this.simulationCache).forEach((key) => {
      if (
        now - this.simulationCache[key].timestamp >
        this.SIMULATION_CACHE_TTL
      ) {
        delete this.simulationCache[key];
      }
    });
  }

  /**
   * Sleep helper function for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if simulation data has error
   */
  private hasSimulationError(data: any): boolean {
    return data?.routes?.error !== undefined;
  }

  /**
   * Retry simulation with delay between attempts
   */
  private async retrySimulation<T>(
    simulationFn: () => Promise<T>,
    maxRetries: number = this.MAX_RETRIES,
    delay: number = this.RETRY_DELAY
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await simulationFn();

        // Check if the result has an error in routes
        if (!this.hasSimulationError(result)) {
          if (attempt > 1) {
            console.log(`✅ Simulation succeeded on attempt ${attempt}`);
          }
          return result;
        }

        if (attempt === maxRetries) {
          console.warn(
            `⚠️ Simulation failed after ${maxRetries} attempts, using result with error. Routes error:`,
            (result as any)?.routes?.error
          );
          return result;
        }

        console.warn(
          `🔄 Simulation attempt ${attempt}/${maxRetries} has routes error: ${
            (result as any)?.routes?.error
          }. Retrying in ${delay}ms...`
        );
        await this.sleep(delay);
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          console.error(
            `❌ Simulation failed after ${maxRetries} attempts with error:`,
            error
          );
          throw lastError;
        }

        console.warn(
          `🔄 Simulation attempt ${attempt}/${maxRetries} failed with error: ${error.message}. Retrying in ${delay}ms...`
        );
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private async initPriceData() {
    try {
      // Load all common data at once
      const { flattenTokens, oraichainTokens, network, oraichainNetwork } =
        await OraidexCommon.load();

      // Store in class properties
      this.flattenTokens = flattenTokens;
      this.oraichainTokens = oraichainTokens;
      this.network = network;
      this.oraichainNetwork = oraichainNetwork;

      // Build optimized token map
      this.buildTokenMap();

      await this.fetchPrices();
    } catch (error) {
      console.error("Failed to initialize price data:", error);
    }
  }

  private async fetchPrices() {
    try {
      const flattenTokensIds = [
        ...new Set(
          this.flattenTokens.map((t) => t.coinGeckoId).filter(Boolean)
        ),
      ];

      if (flattenTokensIds.length === 0) return;

      const endpoint = `https://price.market.orai.io/simple/price?ids=${flattenTokensIds.join(
        ","
      )}&vs_currencies=usd`;

      const resp = await fetch(endpoint, {});
      this.prices = await resp.json();
      this.lastPriceUpdate = Date.now();
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    }
  }

  isAllowAlphaIbcWasm = (fromToken: TokenItemType, toToken: TokenItemType) => {
    // FIXME: fix case inj oraichain -> x oraichain
    if (
      fromToken &&
      fromToken.coinGeckoId === "injective-protocol" &&
      fromToken.chainId === toToken.chainId &&
      fromToken.chainId === "Oraichain"
    ) {
      return false;
    }
    return true;
  };

  /**
   * This function check status using ibc wasm
   * Example:  Oraichain -> Oraichain + Cosmos (false) | Oraichain -> Evm (true) | Evm -> Evm + Oraichain + Cosmos (true) | Cosmos -> Cosmos + Oraichain (false) | Cosmos -> Evm (true)
   * @param fromToken
   * @param toToken
   * @returns boolean
   */
  isAllowIBCWasm = (fromToken: TokenItemType, toToken: TokenItemType) => {
    // FIXME: fix case inj oraichain -> x oraichain
    if (
      fromToken &&
      fromToken.coinGeckoId === "injective-protocol" &&
      fromToken.chainId === toToken.chainId &&
      fromToken.chainId === "Oraichain"
    ) {
      return true;
    }
    return false;
  };

  getProtocolsSmartRoute = (
    fromToken: TokenItemType,
    toToken: TokenItemType,
    { useAlphaIbcWasm, useIbcWasm }
  ) => {
    const protocols = ["Oraidex", "OraidexV3"];
    if (useIbcWasm && !useAlphaIbcWasm) return protocols;
    if (fromToken?.chainId === "noble-1" || toToken?.chainId === "noble-1")
      return protocols;

    const allowOsmosisProtocols = [
      "injective-1",
      "Neutaro-1",
      "noble-1",
      "osmosis-1",
      "cosmoshub-4",
      "celestia",
    ];
    const isAllowOsmosisProtocol =
      allowOsmosisProtocols.includes(fromToken?.chainId) ||
      allowOsmosisProtocols.includes(toToken?.chainId);

    if (isAllowOsmosisProtocol) return [...protocols, "Osmosis"];
    return protocols;
  };

  async getRoutes(params: RouteParams): Promise<Route[]> {
    console.log("[logging] OBridge adapter getRoutes started with params:", {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amount: params.amount,
      chainId: params.chainId,
      slippageTolerance: params.slippageTolerance,
    });

    const { tokenIn, tokenOut, amount, chainId } = params;

    // Cleanup expired cache entries periodically
    this.cleanupCache();

    // Create a new AbortController for this request
    const requestId = `${tokenIn}-${tokenOut}-${amount}-${Date.now()}`;

    // Cancel previous requests for the same token pair more efficiently
    const tokenPairKey = `${tokenIn}-${tokenOut}`;
    for (const [key, controller] of this.abortControllers.entries()) {
      if (key.includes(tokenPairKey)) {
        controller.abort();
        this.abortControllers.delete(key);
      }
    }

    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      // Check if common data hasn't been loaded yet
      if (!this.isCommonDataLoaded()) {
        console.error("Common data not loaded yet");
        return [];
      }

      // Normalize addresses for Tron compatibility
      let tokenOutToCheck = tokenOut;
      let tokenInToCheck = tokenIn;

      if (isValidTronAddress(tokenOut)) {
        tokenOutToCheck = getEvmAddress(tokenOut);
      }
      if (isValidTronAddress(tokenIn)) {
        tokenInToCheck = getEvmAddress(tokenIn);
      }
      if (tokenIn === NATIVE_TOKEN_ADDRESS) {
        if (chainId === "eip155:56") {
          tokenInToCheck = "bnb";
        }
        if (chainId === "eip155:1") {
          tokenInToCheck = "eth";
        }
      }
      if (tokenOut === NATIVE_TOKEN_ADDRESS) {
        if (chainId === "eip155:56") {
          tokenOutToCheck = "bnb";
        }
        if (chainId === "eip155:1") {
          tokenOutToCheck = "eth";
        }
      }

      // Use optimized Map lookup instead of find()
      const originalFromToken = this.tokenMap.get(tokenInToCheck.toLowerCase());
      const originalToToken = this.tokenMap.get(tokenOutToCheck.toLowerCase());

      if (
        !originalFromToken ||
        !originalToToken ||
        (originalFromToken.chainId === "0x38" &&
          originalToToken.chainId === "0x38") ||
        (originalFromToken.chainId === "0x01" &&
          originalToToken.chainId === "0x01")
      ) {
        return [];
      }

      const amountIn = ethers.utils.formatUnits(
        amount,
        originalFromToken.decimals
      );

      // Get cached clients
      const routerClient = await this.getRouterClient();

      // Calculate simulation options
      const useAlphaIbcWasm = this.isAllowAlphaIbcWasm(
        originalFromToken,
        originalToToken
      );
      const useIbcWasm = this.isAllowIBCWasm(
        originalFromToken,
        originalToToken
      );
      const protocols = this.getProtocolsSmartRoute(
        originalFromToken,
        originalToToken,
        {
          useIbcWasm,
          useAlphaIbcWasm,
        }
      );

      const isOraichain =
        originalFromToken.chainId === "Oraichain" &&
        originalToToken.chainId === "Oraichain";
      const maxSplits = isOraichain
        ? this.splitsOSOR.ORAICHAIN
        : useAlphaIbcWasm
        ? this.splitsOSOR.OTHERCHAIN
        : this.splitsOSOR.DEFAULTCHAIN;

      const simulateOption = {
        useAlphaIbcWasm,
        useIbcWasm,
        protocols,
        maxSplits,
        dontAllowSwapAfter: useAlphaIbcWasm ? [""] : undefined,
      };

      // Create cache key for simulation
      const mainSimulationCacheKey = this.getSimulationCacheKey(
        tokenInToCheck,
        tokenOutToCheck,
        amountIn,
        simulateOption
      );

      const priceSimulationCacheKey = this.getSimulationCacheKey(
        tokenInToCheck,
        tokenOutToCheck,
        "1",
        { ...simulateOption, ignoreFee: true }
      );

      // Get cached client for parallel operations
      const client = await this.getClient();

      // Parallel execution of simulations and fee calculation with retry logic
      // Retries up to 3 times with 500ms delay if data.routes.error or simulateData.routes.error occurs
      const [data, simulateData, feeCalculation] = await Promise.all([
        // Main simulation with caching and retry
        this.retrySimulation(() =>
          this.getCachedSimulation(mainSimulationCacheKey, () =>
            UniversalSwapHelper.handleSimulateSwap({
              flattenTokens: this.flattenTokens,
              oraichainTokens: this.oraichainTokens,
              originalFromInfo: originalFromToken,
              originalToInfo: originalToToken,
              originalAmount: Number(amountIn),
              routerClient,
              routerOption: {
                useAlphaIbcWasm: simulateOption?.useAlphaIbcWasm,
                useIbcWasm: simulateOption?.useIbcWasm,
              },
              routerConfig: getRouterConfig(simulateOption),
            })
          )
        ),

        // Price ratio simulation with caching and retry
        this.retrySimulation(() =>
          this.getCachedSimulation(priceSimulationCacheKey, () =>
            UniversalSwapHelper.handleSimulateSwap({
              flattenTokens: this.flattenTokens,
              oraichainTokens: this.oraichainTokens,
              originalFromInfo: originalFromToken,
              originalToInfo: originalToToken,
              originalAmount: 1,
              routerClient,
              routerOption: {
                useAlphaIbcWasm: simulateOption?.useAlphaIbcWasm,
                useIbcWasm: simulateOption?.useIbcWasm,
              },
              routerConfig: getRouterConfig({
                ...simulateOption,
                ignoreFee: true,
              }),
            })
          )
        ),

        // Fee calculation
        calculateAllFeesAndTotal({
          originalFromToken,
          originalToToken,
          fromToken: originalFromToken,
          toToken: originalToToken,
          client,
          network: this.network!,
          oraichainTokens: this.oraichainTokens,
          flattenTokens: this.flattenTokens,
          simulateDisplayAmount: 0, // Will be updated after simulation
        }).catch((error) => {
          console.warn("Fee calculation failed:", error);
          return { totalFee: "0" };
        }),
      ]);
      console.log(
        data,
        simulateData,
        this.hasSimulationError(data),
        this.hasSimulationError(simulateData),
        "data Obridge"
      );
      if (
        this.hasSimulationError(data) ||
        this.hasSimulationError(simulateData)
      ) {
        const cached = this.simulationCache[mainSimulationCacheKey];
        if (cached && this.isSimulationCacheValid(cached)) {
          return cached.result;
        }
      }
      if (!data?.amount || Number(data?.amount) === 0) {
        return [];
      }

      // Update fee calculation with actual display amount
      const { totalFee } = await calculateAllFeesAndTotal({
        originalFromToken,
        originalToToken,
        fromToken: originalFromToken,
        toToken: originalToToken,
        client,
        network: this.network!,
        oraichainTokens: this.oraichainTokens,
        flattenTokens: this.flattenTokens,
        simulateDisplayAmount: Number(data?.displayAmount) || 0,
      }).catch((error) => {
        console.warn("Fee calculation failed:", error);
        return { totalFee: feeCalculation.totalFee };
      });

      // Use the cached prices instead of fetching them again
      const prices = this.prices;
      const usdPriceShowFrom =
        prices?.[originalFromToken?.coinGeckoId]?.usd * Number(amountIn);

      const feeInUsd =
        prices?.[originalToToken?.coinGeckoId]?.usd * Number(totalFee);
      const usdPriceShowTo =
        prices?.[originalToToken?.coinGeckoId]?.usd * data?.displayAmount;

      // Calculate price impact more efficiently
      const calculateImpactPrice = new BigDecimal(data.displayAmount)
        .div(amountIn)
        .div(simulateData.displayAmount)
        .mul(100);
      const impactWarning = calculateImpactPrice
        ? 100 - calculateImpactPrice.toNumber()
        : 0;
      const routes = this.getProtocols(data?.routes);
      const totalDisplayAmountWithFee = new Dec(
        data?.displayAmount ? `${data.displayAmount}` : "0"
      ).sub(new Dec(totalFee || "0"));
      const usdPriceMinimumReceived = new Dec(
        prices?.[originalToToken?.coinGeckoId]?.usd || 0
      )
        .mul(totalDisplayAmountWithFee)
        .toString();
      const slippageMultiplier = new Dec(1).sub(
        new Dec(
          new Dec(params.slippageTolerance).quo(new Dec(100)).toString()
        ).quo(new Dec(100))
      );
      const minimumReceived = new Dec(
        totalDisplayAmountWithFee.toString() || "0"
      ).mul(slippageMultiplier);
      const minimumReceivedFormatted = minimumReceived;
      console.log(totalDisplayAmountWithFee, "totalDisplayAmountWithFee");

      const route: Route = {
        id: null,
        provider: this.provider,
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountIn: amount,
        amountOut: data.amount,
        displayAmount: totalDisplayAmountWithFee.gt(new Dec("0"))
          ? `${parseFloat(totalDisplayAmountWithFee.toString())}`
          : "0",
        amountInUsd: usdPriceShowFrom?.toString() || "0",
        amountOutUsd: usdPriceShowTo?.toString() || "0",
        priceImpact: impactWarning?.toFixed(2)?.toString() || "0",
        estimatedGas: totalFee?.toString() || "0",
        estimatedGasUsd: feeInUsd?.toString() || "0",
        route: routes,
        routerAddress: "",
        chainId: chainId,
        quoteResponse: null,
        minimumReceived: minimumReceivedFormatted?.toString() || "0",
        minimumReceivedUsd: usdPriceMinimumReceived?.toString() || "0",
      };

      console.log("[logging] OBridge adapter getRoutes completed with route:", {
        provider: route.provider,
        amountOut: route.amountOut,
        priceImpact: route.priceImpact,
        estimatedGas: route.estimatedGas,
        routes: route.route,
      });

      return [route];
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return [];
      }

      console.error("OBridge getRoutes error:", error);
      return [];
    } finally {
      if (this.abortControllers.get(requestId) === abortController) {
        this.abortControllers.delete(requestId);
      }
    }
  }
  private getProtocols = (routesObj: any): string[] => {
    return (
      routesObj?.routes?.flatMap(
        (r) =>
          r.paths?.flatMap(
            (p) => p.actions?.map((a) => a.protocol).filter(Boolean) || []
          ) || []
      ) || []
    );
  };

  /**
   * Fetch real amounts balance instead of mock
   * Logic similar to fetchBalances function in index.tsx
   */
  private async fetchAmountsBalance(
    originalFromToken: TokenItemType,
    originalToToken: TokenItemType,
    userAddress: string
  ): Promise<any> {
    try {
      // TODO: Implement universalSwapStore equivalent
      // Currently return empty object, may need to implement store pattern
      let amountsBalance = {};

      const { isSpecialFromCoingecko } = getSpecialCoingecko(
        originalFromToken.coinGeckoId,
        originalToToken.coinGeckoId
      );

      if (isSpecialFromCoingecko && originalFromToken.chainId === "Oraichain") {
        const client = await this.getClient();

        const tokenInfo = getTokenOnOraichain(
          originalFromToken.coinGeckoId,
          this.oraichainTokens
        );
        const fromTokenInOrai = getTokenOnOraichain(
          tokenInfo.coinGeckoId,
          this.oraichainTokens
        );

        const [nativeAmount, cw20Amount] = await Promise.all([
          client.getBalance(userAddress, fromTokenInOrai.denom),
          client.queryContractSmart(tokenInfo.contractAddress, {
            balance: { address: userAddress },
          }),
        ]);

        amountsBalance = {
          [fromTokenInOrai.denom]: nativeAmount?.amount,
          [originalFromToken.denom]: cw20Amount.balance,
        };
      }

      return amountsBalance;
    } catch (error) {
      console.warn("Failed to fetch amounts balance:", error);
      return {};
    }
  }

  async buildTransaction(
    route: Route,
    userAddress: string,
    slippageTolerance: number
  ): Promise<Transaction> {
    try {
      const { tokenIn, tokenOut, amountIn } = route;

      // Check if common data hasn't been loaded yet
      if (!this.isCommonDataLoaded()) {
        throw new Error("Common data not loaded yet");
      }

      // Normalize addresses for Tron compatibility
      let tokenOutToCheck = tokenOut;
      let tokenInToCheck = tokenIn;

      if (isValidTronAddress(tokenOut)) {
        tokenOutToCheck = getEvmAddress(tokenOut);
      }
      if (isValidTronAddress(tokenIn)) {
        tokenInToCheck = getEvmAddress(tokenIn);
      }
      if (tokenIn === NATIVE_TOKEN_ADDRESS) {
        if (route.chainId === "eip155:56") {
          tokenInToCheck = "bnb";
        }
        if (route.chainId === "eip155:1") {
          tokenInToCheck = "eth";
        }
      }
      if (tokenOut === NATIVE_TOKEN_ADDRESS) {
        if (route.chainId === "eip155:56") {
          tokenOutToCheck = "bnb";
        }
        if (route.chainId === "eip155:1") {
          tokenOutToCheck = "eth";
        }
      }
      // Get original tokens
      const originalFromToken = this.tokenMap.get(tokenInToCheck.toLowerCase());
      const originalToToken = this.tokenMap.get(tokenOutToCheck.toLowerCase());

      if (!originalFromToken || !originalToToken) {
        throw new Error("Token not found in token map");
      }

      const amountInFormatted = ethers.utils.formatUnits(
        amountIn,
        originalFromToken.decimals
      );

      // Get simulation options
      const useAlphaIbcWasm = this.isAllowAlphaIbcWasm(
        originalFromToken,
        originalToToken
      );
      const useIbcWasm = this.isAllowIBCWasm(
        originalFromToken,
        originalToToken
      );
      const protocols = this.getProtocolsSmartRoute(
        originalFromToken,
        originalToToken,
        {
          useIbcWasm,
          useAlphaIbcWasm,
        }
      );

      const isOraichain =
        originalFromToken.chainId === "Oraichain" &&
        originalToToken.chainId === "Oraichain";
      const maxSplits = isOraichain
        ? this.splitsOSOR.ORAICHAIN
        : useAlphaIbcWasm
        ? this.splitsOSOR.OTHERCHAIN
        : this.splitsOSOR.DEFAULTCHAIN;

      const simulateOption = {
        useAlphaIbcWasm,
        useIbcWasm,
        protocols,
        maxSplits,
        dontAllowSwapAfter: useAlphaIbcWasm ? [""] : undefined,
      };

      // Get cached clients
      const routerClient = await this.getRouterClient();
      const client = await this.getClient();
      const cosmosChainId = originalFromToken.cosmosBased
        ? `cosmos:${originalFromToken.chainId}`
        : "cosmos:Oraichain";
      const addressesData = await getMultipleAddresses([
        "eip155:1",
        "tron:0x2b6653dc",
        cosmosChainId,
      ]);

      // Get addresses - assuming these are provided via userAddress or extracted
      // In real implementation, these might come from wallet connections
      const addresses: {
        cosmosAddress?: string;
        evmAddress?: string;
        tronAddress?: string;
      } = {
        cosmosAddress: addressesData?.[cosmosChainId] || "",
        evmAddress: addressesData?.["eip155:1"] || "",
        tronAddress: addressesData?.["tron:0x2b6653dc"] || "",
      };
      // Perform simulation and fetch amounts balance in parallel with retry logic
      const [simulateData, ratioData, amountsBalance] = await Promise.all([
        this.retrySimulation(() =>
          UniversalSwapHelper.handleSimulateSwap({
            flattenTokens: this.flattenTokens,
            oraichainTokens: this.oraichainTokens,
            originalFromInfo: originalFromToken,
            originalToInfo: originalToToken,
            originalAmount: Number(amountInFormatted),
            routerClient,
            routerOption: {
              useAlphaIbcWasm: simulateOption?.useAlphaIbcWasm,
              useIbcWasm: simulateOption?.useIbcWasm,
            },
            routerConfig: getRouterConfig(simulateOption),
          })
        ),
        this.retrySimulation(() =>
          UniversalSwapHelper.handleSimulateSwap({
            flattenTokens: this.flattenTokens,
            oraichainTokens: this.oraichainTokens,
            originalFromInfo: originalFromToken,
            originalToInfo: originalToToken,
            originalAmount: 1,
            routerClient,
            routerOption: {
              useAlphaIbcWasm: simulateOption?.useAlphaIbcWasm,
              useIbcWasm: simulateOption?.useIbcWasm,
            },
            routerConfig: getRouterConfig({
              ...simulateOption,
              ignoreFee: true,
            }),
          })
        ),
        // Fetch real amounts balance instead of mock
        this.fetchAmountsBalance(
          originalFromToken,
          originalToToken,
          addressesData?.["cosmos:Oraichain"]
        ),
      ]);
      if (!simulateData?.amount || Number(simulateData?.amount) === 0) {
        throw new Error("Simulation failed: No valid swap route found");
      }

      const { relayerFeeAmount } = await calculateRelayerFee({
        originalFromToken,
        originalToToken,
        client,
        network: this.network!,
        oraichainTokens: this.oraichainTokens,
        flattenTokens: this.flattenTokens,
      });
      // Prepare swap transaction data
      const swapTransactionData: SwapTransactionData = {
        cosmosAddress: addresses.cosmosAddress,
        evmAddress: addresses.evmAddress,
        tronAddress: addresses.tronAddress,
        originalFromToken,
        originalToToken,
        simulateData,
        relayerFeeToken: {
          relayerAmount: relayerFeeAmount?.toString() || "0",
          relayerDecimals: this.RELAYER_DECIMAL,
        }, // This would be calculated based on current conditions
        ratio: ratioData,
        userSlippage: Number(slippageTolerance) / 100,
        fromAmount: Number(amountInFormatted),
        amountsBalance, // Use real balance instead of mock
        sendToAddress: undefined, // This could be set if cross-chain transfer
        useAlphaIbcWasm,
        useIbcWasm,
      };

      // Create transaction object
      const transaction: Transaction = {
        to: "", // Not applicable for Universal Swap
        //@ts-ignore
        data: JSON.stringify(swapTransactionData), // Convert to string for Transaction interface
        value: "0",
        gasLimit: "0", // Will be calculated during execution
        chainId: route.chainId,
        provider: this.provider,
      };
      return transaction;
    } catch (error) {
      console.error("OBridge buildTransaction error:", error);
      throw error;
    }
  }

  async signAndSendTransaction(
    tx: Transaction,
    userAddress: string,
    destinationChainCurrencies?: AppCurrency[]
  ): Promise<string> {
    try {
      // Parse swap data from transaction
      //@ts-ignore
      const swapData: SwapTransactionData = JSON.parse(tx.data);

      if (!swapData) {
        throw new Error("Invalid swap transaction data");
      }

      const {
        cosmosAddress,
        evmAddress,
        tronAddress,
        originalFromToken,
        originalToToken,
        simulateData,
        relayerFeeToken,
        ratio,
        userSlippage,
        fromAmount,
        amountsBalance,
        sendToAddress,
        useAlphaIbcWasm,
        useIbcWasm,
      } = swapData;

      // Get client for Oraichain
      const client = await this.getClient();

      // Create cosmos and evm wallets
      const cosmosWallet = new SwapCosmosWallet(client);
      const isTron = Number(originalFromToken.chainId) === Networks.tron;
      const evmWallet = new SwapEvmWallet(isTron);

      // Handle relayer fee
      const RELAYER_DECIMAL = 6;
      const relayerFee = relayerFeeToken && {
        relayerAmount: relayerFeeToken.toString(),
        relayerDecimals: RELAYER_DECIMAL,
      };

      // Handle simulate amount
      let simulateAmount = simulateData?.amount;
      const isInjectiveProtocol =
        originalToToken.chainId === "injective-1" &&
        originalToToken.coinGeckoId === "injective-protocol";
      const isKawaiiChain = originalToToken.chainId === "kawaii_6886-1";
      const isDifferentChainAndNotCosmosBased =
        originalFromToken.chainId !== originalToToken.chainId &&
        !originalFromToken.cosmosBased &&
        !originalToToken.cosmosBased;

      if (
        isInjectiveProtocol ||
        isKawaiiChain ||
        isDifferentChainAndNotCosmosBased
      ) {
        simulateAmount = toAmount(
          simulateData?.displayAmount,
          originalToToken.decimals
        ).toString();
      }

      // Get alpha smart routes
      const alphaSmartRoutes = simulateData?.routes;

      // Create universal swap data
      let universalSwapData: UniversalSwapData = {
        sender: {
          cosmos: cosmosAddress,
          evm: evmAddress,
          tron: tronAddress,
        },
        originalFromToken,
        originalToToken,
        simulateAmount,
        amounts: amountsBalance,
        simulatePrice:
          ratio?.amount && new BigDecimal(ratio.amount).div(1).toString(), // SIMULATE_INIT_AMOUNT = 1
        userSlippage: userSlippage || DEFAULT_SLIPPAGE,
        fromAmount,
        relayerFee,
        alphaSmartRoutes,
        affiliates: [{ address: AFFILIATE_ADDRESS, basis_points_fee: "75" }],
        fee:
          originalFromToken.chainId === "Oraichain" &&
          originalToToken.chainId === "Oraichain"
            ? "auto"
            : 2,
      };

      // Add recipient address if available
      if (sendToAddress) {
        universalSwapData = {
          ...universalSwapData,
          recipientAddress: sendToAddress,
        };
      }

      // Create universal swap handler with type assertion to avoid incompatibility
      try {
        const universalSwapHandler = new UniversalSwapHandler(
          universalSwapData,
          {
            cosmosWallet: cosmosWallet as any,
            evmWallet: evmWallet as any,
            swapOptions: {
              isAlphaIbcWasm: useAlphaIbcWasm,
              isIbcWasm: useIbcWasm,
            },
          },
          await OraidexCommon.load()
        );

        // Execute universal swap
        const result = await universalSwapHandler.processUniversalSwap();

        if (result && result.transactionHash) {
          return result.transactionHash;
        } else {
          throw new Error(
            "Swap transaction failed: No transaction hash returned"
          );
        }
      } catch (error) {
        console.error("Error in signAndSendTransaction2:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in signAndSendTransaction:", error);
      throw error;
    }
  }

  addAffiliateFeeToBuildParams(params: any): any {
    // Add affiliate fee for Jupiter
    // See https://dev.jup.ag/docs/ultra-api/add-fees-to-ultra

    const newParams = { ...params };

    // Add fee parameters according to Jupiter's documentation
    newParams.feeAccount = "0x8c7E0A841269a01c0Ab389Ce8Fb3Cf150A94E797"; // Your fee receiver address
    newParams.feeBps = 5; // 0.05% fee

    return newParams;
  }

  abortRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  /**
   * Clear all caches - useful for memory management or when data needs refresh
   */
  clearCaches(): void {
    this.simulationCache = {};
    this.tokenMap.clear();
    this.clientCache = null;
    this.routerClientCache = null;
  }

  /**
   * Refresh common data and rebuild caches
   */
  async refreshData(): Promise<void> {
    try {
      // Clear existing caches
      this.clearCaches();

      // Reload common data
      const { flattenTokens, oraichainTokens, network, oraichainNetwork } =
        await OraidexCommon.load();

      this.flattenTokens = flattenTokens;
      this.oraichainTokens = oraichainTokens;
      this.network = network;
      this.oraichainNetwork = oraichainNetwork;

      // Rebuild token map
      this.buildTokenMap();

      // Refresh prices
      await this.fetchPrices();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    simulationCacheSize: number;
    tokenMapSize: number;
    hasClientCache: boolean;
    hasRouterClientCache: boolean;
  } {
    return {
      simulationCacheSize: Object.keys(this.simulationCache).length,
      tokenMapSize: this.tokenMap.size,
      hasClientCache: this.clientCache !== null,
      hasRouterClientCache: this.routerClientCache !== null,
    };
  }

  // Implement missing abstract methods from BaseAdapter
  async checkApprovalNeeded(
    tokenAddress: string,
    userAddress: string,
    amount: string,
    spenderAddress: string
  ): Promise<boolean> {
    // For Oraichain/Cosmos-based tokens, approval is typically not needed
    // as they use different token standards than ERC-20
    return false;
  }

  async buildApprovalTransaction(
    tokenAddress: string,
    userAddress: string,
    amount: string,
    spenderAddress: string
  ): Promise<Transaction> {
    // Since approval is not needed for Oraichain tokens, throw an error
    throw new Error("Approval not needed for Oraichain tokens");
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
    try {
      const { tokenInAddress, tokenOutAddress, amountIn } = params;

      // Use the same logic as in getRoutes to calculate price impact
      const originalFromToken = this.tokenMap.get(tokenInAddress.toLowerCase());
      const originalToToken = this.tokenMap.get(tokenOutAddress.toLowerCase());

      if (!originalFromToken || !originalToToken) {
        return { priceImpact: "0" };
      }

      const amountInFormatted = ethers.utils.formatUnits(
        amountIn,
        originalFromToken.decimals
      );

      const simulateOption = {
        useAlphaIbcWasm: this.isAllowAlphaIbcWasm(
          originalFromToken,
          originalToToken
        ),
        useIbcWasm: this.isAllowIBCWasm(originalFromToken, originalToToken),
        protocols: this.getProtocolsSmartRoute(
          originalFromToken,
          originalToToken,
          {
            useIbcWasm: this.isAllowIBCWasm(originalFromToken, originalToToken),
            useAlphaIbcWasm: this.isAllowAlphaIbcWasm(
              originalFromToken,
              originalToToken
            ),
          }
        ),
        maxSplits: 10,
        dontAllowSwapAfter: undefined,
      };

      const routerClient = await this.getRouterClient();

      const [data, simulateData] = await Promise.all([
        this.retrySimulation(() =>
          UniversalSwapHelper.handleSimulateSwap({
            flattenTokens: this.flattenTokens,
            oraichainTokens: this.oraichainTokens,
            originalFromInfo: originalFromToken,
            originalToInfo: originalToToken,
            originalAmount: Number(amountInFormatted),
            routerClient,
            routerOption: {
              useAlphaIbcWasm: simulateOption?.useAlphaIbcWasm,
              useIbcWasm: simulateOption?.useIbcWasm,
            },
            routerConfig: getRouterConfig(simulateOption),
          })
        ),
        this.retrySimulation(() =>
          UniversalSwapHelper.handleSimulateSwap({
            flattenTokens: this.flattenTokens,
            oraichainTokens: this.oraichainTokens,
            originalFromInfo: originalFromToken,
            originalToInfo: originalToToken,
            originalAmount: 1,
            routerClient,
            routerOption: {
              useAlphaIbcWasm: simulateOption?.useAlphaIbcWasm,
              useIbcWasm: simulateOption?.useIbcWasm,
            },
            routerConfig: getRouterConfig(simulateOption),
          })
        ),
      ]);

      if (!data?.displayAmount || !simulateData?.displayAmount) {
        return { priceImpact: "0" };
      }

      const calculateImpactPrice = new BigDecimal(data.displayAmount)
        .div(amountInFormatted)
        .div(simulateData.displayAmount)
        .mul(100);

      const impactWarning = calculateImpactPrice
        ? 100 - calculateImpactPrice.toNumber()
        : 0;

      return { priceImpact: impactWarning.toFixed(2) };
    } catch (error) {
      console.error("Error calculating price impact:", error);
      return { priceImpact: "0" };
    }
  }
}
