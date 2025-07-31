import { BaseAdapter } from "./BaseAdapter";
import { Route, RouteParams, Transaction, Token } from "../../types/v2";
import {
  NATIVE_TOKEN_ADDRESS,
  ERC20_ABI,
  RPC_ENDPOINTS,
} from "../../constants/index";
import axios, { AxiosInstance } from "axios";
import { SwapEvmWallet } from "../../wallet";
import { providers, Contract, constants, utils as ethersUtils } from "ethers";
import { Dec, DecUtils } from "@owallet/unit";
const EVM_CHAIN_IDS = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  avalanche: 43114,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
  ronin: 2020,
  berachain: 80094,
  linea: 59144,
  sonic: 146,
  unichain: 130,
  mantle: 5000,
  zksync: 324,
};

export class KyberSwapAdapter extends BaseAdapter {
  readonly provider = "kyberswap";
  supportsAbortController(): boolean {
    return true;
  }
  readonly supportedChains = Object.values(EVM_CHAIN_IDS).map(
    (chainId) => "eip155:" + chainId.toString()
  );

  private apiClient: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();
  private swapStore: any;

  constructor(swapStore: any) {
    super();
    this.apiClient = axios.create({
      timeout: 10000, // 10 seconds
    });
    this.swapStore = swapStore;
  }

  private getChainName(chainId: string): string {
    // Map numeric chainId to name used in KyberSwap API
    const chainIdMap: Record<string, string> = {
      "1": "ethereum",
      "56": "bsc",
      "137": "polygon",
      "43114": "avalanche",
      "42161": "arbitrum",
      "10": "optimism",
      "2020": "ronin",
      "80094": "berachain",
      "59144": "linea",
      "146": "sonic",
      "8453": "base",
      "130": "unichain",
      "5000": "mantle",
      "324": "zksync",
    };

    return chainIdMap[chainId] || chainId;
  }

  private getChainId(chainName: string): number {
    return EVM_CHAIN_IDS[chainName as keyof typeof EVM_CHAIN_IDS] || 1;
  }

  async getRoutes(params: RouteParams, signal?: AbortSignal): Promise<Route[]> {
    console.log("[logging] KyberSwap adapter getRoutes started with params:", {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amount: params.amount,
      chainId: params.chainId,
      slippageTolerance: params.slippageTolerance,
    });

    const { tokenIn, tokenOut, amount, chainId } = params;

    // Create a new AbortController for this request
    const requestId = `${tokenIn}-${tokenOut}-${amount}-${Date.now()}`;

    // Abort ALL previous requests for this token pair, regardless of amount
    // This ensures only the latest amount is processed
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

    try {
      const chainName = this.getChainName(chainId.replace("eip155:", ""));
      const tokenInAddress =
        tokenIn === "native" ? NATIVE_TOKEN_ADDRESS : tokenIn;
      const tokenOutAddress =
        tokenOut === "native" ? NATIVE_TOKEN_ADDRESS : tokenOut;
      console.log(`KyberSwap fetching route for amount: ${amount}`);
      const feeReceiver = "0x8cF81131B8144f1b6D957E79B757A6643aBAf74C";
      const response = await this.apiClient.get(
        `https://aggregator-api.kyberswap.com/${chainName}/api/v1/routes`,
        {
          params: {
            tokenIn: tokenInAddress,
            tokenOut: tokenOutAddress,
            amountIn: amount,
            gasInclude: true,
            // referral:"owallet",
            feeAmount: "75",
            chargeFeeBy: "currency_in",
            isInBps: true,
            feeReceiver: feeReceiver,
          },
          signal: signal,
        }
      );

      if (response.data.code !== 0) {
        throw new Error(`KyberSwap API error: ${response.data.message}`);
      }

      const routeData = response.data.data.routeSummary;

      // Get price impact if available
      let dataPriceImpact: {
        amountInUSD: string;
        amountOutUSD: string;
        priceImpact: string;
      } = {
        amountInUSD: "0",
        amountOutUSD: "0",
        priceImpact: "0",
      };
      try {
        const numericChainId = this.getChainId(chainName);
        const priceImpactResponse = await this.apiClient.get(
          `https://bff.kyberswap.com/api/v1/price-impact`,
          {
            params: {
              tokenIn: tokenInAddress,
              tokenInDecimal: params.tokenInDecimals,
              tokenOut: tokenOutAddress,
              tokenOutDecimal: params.tokenOutDecimals,
              amountIn: amount,
              amountOut: routeData.amountOut,
              chainId: numericChainId,
            },
            signal: signal,
          }
        );

        if (priceImpactResponse.data.code === 0) {
          dataPriceImpact = priceImpactResponse.data.data;
        }
      } catch (error) {
        console.error("Failed to fetch price impact:", error);
      }
      const slippageMultiplier = new Dec(1).sub(
        new Dec(
          new Dec(params.slippageTolerance).quo(new Dec(100)).toString()
        ).quo(new Dec(100))
      );
      const minimumReceived = new Dec(routeData?.amountOut || "0").mul(
        slippageMultiplier
      );
      const minimumReceivedFormatted = minimumReceived.quo(
        DecUtils.getTenExponentN(params.tokenOutDecimals || 0)
      );

      const prices = await this.fetchPrices(
        [
          this.swapStore.fromToken?.token?.coingeckoId,
          this.swapStore.toToken?.token?.coingeckoId,
        ].filter(Boolean)
      );

      // Calculate USD price for minimum received
      let usdPriceMinimumReceived = "0";

      // Try to use CoinGecko price first
      const tokenPrice =
        prices?.[this.swapStore.toToken?.token?.coingeckoId]?.usd;
      if (tokenPrice && tokenPrice > 0) {
        usdPriceMinimumReceived = new Dec(tokenPrice)
          .mul(minimumReceivedFormatted)
          .toString();
      } else if (
        dataPriceImpact.amountOutUSD &&
        new Dec(dataPriceImpact.amountOutUSD).gt(new Dec(0))
      ) {
        // Fallback: Calculate from amountOutUSD and amountOut ratio
        const amountOutFormatted = new Dec(routeData?.amountOut || "0").quo(
          DecUtils.getTenExponentN(params.tokenOutDecimals || 0)
        );

        if (amountOutFormatted.gt(new Dec(0))) {
          // Calculate price per token from amountOutUSD
          const pricePerToken = new Dec(dataPriceImpact.amountOutUSD).quo(
            amountOutFormatted
          );
          usdPriceMinimumReceived = pricePerToken
            .mul(minimumReceivedFormatted)
            .toString();
        }
      }
      console.log(
        {
          minimumReceivedFormatted: minimumReceivedFormatted?.toString(),
          minimumReceived: minimumReceived?.toString(),
          slippageMultiplier: slippageMultiplier?.toString(),
          slippageTolerance: params.slippageTolerance,
          usdPriceMinimumReceived: usdPriceMinimumReceived,
          prices: prices,
          tokenPrice: tokenPrice,
          amountOutUSD: dataPriceImpact.amountOutUSD,
          usedFallback: !tokenPrice || tokenPrice <= 0,
        },
        "minimumReceivedFormatted + USD calculation"
      );

      // Calculate displayAmount to prevent duplicate formatting
      const displayAmount = ethersUtils.formatUnits(
        routeData.amountOut || "0",
        params.tokenOutDecimals || 18
      );

      // Process the route
      const route: Route = {
        id: routeData.routeID,
        provider: this.provider,
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn: routeData.amountIn,
        amountOut: routeData.amountOut,
        displayAmount: displayAmount, // Add displayAmount to prevent duplicate formatting
        amountInUsd: dataPriceImpact.amountInUSD,
        amountOutUsd: dataPriceImpact.amountOutUSD,
        priceImpact: dataPriceImpact.priceImpact,
        estimatedGas: routeData.gas,
        estimatedGasUsd: routeData.gasUsd,
        route: routeData.route
          ? routeData.route?.map(
              (route: any) => route?.[0]?.exchange || "Unknown"
            )
          : [],
        routerAddress: response.data.data.routerAddress,
        chainId,
        routeSummary: routeData,
        extraParams: {
          checksum: routeData.checksum,
          timestamp: routeData.timestamp,
        },
        minimumReceived: minimumReceivedFormatted?.toString() || "0",
        minimumReceivedUsd: usdPriceMinimumReceived || "0",
      };

      console.log(
        "[logging] KyberSwap adapter getRoutes completed with route:",
        {
          provider: route.provider,
          amountOut: route.amountOut,
          priceImpact: route.priceImpact,
          estimatedGas: route.estimatedGas,
          routes: route.route,
        }
      );

      return [route];
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return [];
      }

      console.error("KyberSwap getRoutes error:", error);
      throw error;
    } finally {
      if (this.abortControllers.get(requestId) === abortController) {
        this.abortControllers.delete(requestId);
      }
    }
  }
  private async fetchPrices(ids: string[]) {
    try {
      if (ids.length === 0) return;

      const endpoint = `https://price.market.orai.io/simple/price?ids=${ids.join(
        ","
      )}&vs_currencies=usd`;

      const resp = await fetch(endpoint, {});
      return await resp.json();
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    }
  }
  async buildTransaction(
    route: Route,
    userAddress: string,
    slippageTolerance: number
  ): Promise<Transaction> {
    const chainId = route.chainId.replace("eip155:", "");
    const chainName = this.getChainName(chainId);
    try {
      if (!route.routeSummary) throw new Error("Route summary not found");
      if (!userAddress) throw new Error("User address not found");
      // Calculate deadline (current time + 20 minutes in seconds)
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      const buildParams = {
        routeSummary: route.routeSummary,
        deadline,
        slippageTolerance,
        sender: userAddress,
        recipient: userAddress,
        source: "owallet", // Custom source identifier
        skipSimulateTx: false,
        enableGasEstimation: true,
        referral: "",
      };

      // Add affiliate fee if configured
      const buildParamsWithFee = buildParams;
      // const buildParamsWithFee = buildParams
      const response = await this.apiClient.post(
        `https://aggregator-api.kyberswap.com/${chainName}/api/v1/route/build`,
        buildParamsWithFee
      );

      if (response.data.code !== 0) {
        throw new Error(
          `KyberSwap build transaction error: ${response.data.message}`
        );
      }

      const txData = response.data.data;
      // Format transaction data
      const transaction: Transaction = {
        to: route.routerAddress,
        data: txData.data,
        value: txData.transactionValue,
        gasLimit: txData.gas,
        chainId: chainId,
        provider: this.provider,
      };

      return transaction;
    } catch (error) {
      console.error("KyberSwap buildTransaction error:", error);
      throw error;
    }
  }
  async executeTransaction(tx, networkId) {
    const evmWallet = new SwapEvmWallet(false);
    await evmWallet.switchNetwork(networkId);
    const signer = await evmWallet.getSigner();
    return await signer.sendTransaction(tx);
  }
  async signAndSendTransaction(
    tx: Transaction,
    _userAddress: string = ""
  ): Promise<string> {
    try {
      const { chainId, provider, ...rest } = tx;
      const txResponse = await this.executeTransaction(
        rest,
        chainId.replace("eip155:", "")
      );
      const receipt = await txResponse.wait();
      return receipt.transactionHash;
    } catch (e) {
      console.error("KyberSwap signAndSendTransaction error:", e);
      throw e;
    }
  }
  async checkApprovalNeeded(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: string,
    chainId: string | number
  ): Promise<boolean> {
    // Implement ERC20 allowance check
    // This would use ethers.js or web3.js to check if the allowance is sufficient
    const provider = new providers.JsonRpcProvider(
      RPC_ENDPOINTS[(chainId as string)?.replace("eip155:", "")]
    );
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

    const currentAllowance = await tokenContract.allowance(
      ownerAddress,
      spenderAddress
    );
    const allowanceStr = currentAllowance.toString();

    // For now, return true if it's not the native token
    return (
      tokenAddress !== NATIVE_TOKEN_ADDRESS &&
      (allowanceStr === "0" || new Dec(allowanceStr).lt(new Dec(amount || 0)))
    );
  }

  async buildApprovalTransaction(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    chainId: string | number
  ): Promise<Transaction> {
    // Implement ERC20 approval transaction builder
    // This would create an ERC20 approve transaction
    const provider = new providers.JsonRpcProvider(RPC_ENDPOINTS[chainId]);
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

    const maxUint256 = constants.MaxUint256;

    const approveTx = await tokenContract.populateTransaction.approve(
      spenderAddress,
      amount === "unlimited" ? maxUint256 : amount
    );
    // For demonstration, returning a placeholder
    const transaction: Transaction = {
      to: tokenAddress,
      //@ts-ignore
      data: approveTx.data,
      value: "0x0",
      // gasLimit: approveTx.gasLimit,
      chainId: chainId as string, // Should be dynamically set
      provider: this.provider,
    };

    return transaction;
  }

  addAffiliateFeeToBuildParams(params: any): any {
    // Add your affiliate details to earn fees
    // This is just an example; implement according to KyberSwap's fee structure
    const newParams = { ...params };

    // Set affiliate fee details
    // if (newParams.routeSummary && newParams.routeSummary.extraFee) {
    //     newParams.routeSummary.extraFee = {
    //         feeAmount: "25", // 0.25% fee
    //         chargeFeeBy: "currency_in", // Take fee from input token
    //         isInBps: true, // Fee is in basis points
    //         feeReceiver: "0xc7ff071D996f03d57DEAFEf987a8008E689653E9" // Your fee receiver address
    //     };
    // }

    // Set referral code
    // newParams.referral = "owallet"; // Your referral code

    return newParams;
  }

  getPriceImpact(params: {
    tokenInAddress: string;
    tokenInDecimals: number;
    tokenOutAddress: string;
    tokenOutDecimals: number;
    amountIn: string;
    amountOut: string;
    chainId: number;
  }): Promise<{ priceImpact: string }> {
    return this.apiClient
      .get(`https://bff.kyberswap.com/api/v1/price-impact`, {
        params: {
          tokenIn: params.tokenInAddress,
          tokenInDecimal: params.tokenInDecimals,
          tokenOut: params.tokenOutAddress,
          tokenOutDecimal: params.tokenOutDecimals,
          amountIn: params.amountIn,
          amountOut: params.amountOut,
          chainId: params.chainId,
        },
      })
      .then((response) => {
        if (response.data.code === 0) {
          return { priceImpact: response.data.data.priceImpact };
        }
        throw new Error(`Failed to get price impact: ${response.data.message}`);
      });
  }

  abortRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }
}
