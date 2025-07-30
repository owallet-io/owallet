import axios from "axios";
import { API_ENDPOINTS, TOKENS_PER_PAGE } from "../constants/index";
import type {
  ChainsResponse,
  TokensResponse,
  RouteResponse,
  PriceImpactResponse,
  PriceUsdData,
  Change24hData,
  BuildTransactionRequest,
  BuildTransactionResponse,
  RouteSummary,
  RouteStep,
  SearchTokensResponse,
  SearchTokenItem,
  BalanceItem,
  ChainApiResponse,
  ChainByIdApiResponse,
} from "../types";

const api = axios.create({
  timeout: 30000,
});

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const fetchChainById = async (
  chainId: string
): Promise<ChainByIdApiResponse> => {
  try {
    const response = await api.get<ChainByIdApiResponse>(
      API_ENDPOINTS.GET_CHAIN_BY_ID,
      {
        params: {
          chainId,
        },
      }
    );

    // Transform the response to match the expected ChainsResponse format
    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data?.message || "Failed to fetch chains");
  } catch (error) {
    console.error("Failed to fetch chains:", error);
    return {
      success: false,
      message: "Failed to fetch chain by id",
      data: null,
    };
  }
};
export const fetchChains = async (): Promise<ChainApiResponse> => {
  try {
    const response = await api.get<ChainApiResponse>(API_ENDPOINTS.GET_CHAINS);

    // Transform the response to match the expected ChainsResponse format
    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data?.message || "Failed to fetch chains");
  } catch (error) {
    console.error("Failed to fetch chains:", error);
    return {
      code: -1,
      message: "Failed to fetch chains",
      //@ts-ignore
      data: { hash: "", config: [] },
    };
  }
};

export const fetchTokensByChainId = async (
  chainId: string,
  page = 1,
  isWhitelisted = true
): Promise<TokensResponse> => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_TOKENS, {
      params: {
        page,
        pageSize: TOKENS_PER_PAGE,
        isWhitelisted,
        chainIds: chainId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch tokens for chain ${chainId}:`, error);
    return {
      success: false,
      message: "Failed to fetch tokens",
      data: { balances: [] },
    };
  }
};

export const fetchRoutes = async (
  chain: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  gasInclude = true,
  signal?: AbortSignal
): Promise<RouteResponse> => {
  try {
    const url = API_ENDPOINTS.GET_ROUTES.replace("{chain}", chain);
    const response = await api.get(url, {
      params: {
        tokenIn,
        tokenOut,
        amountIn,
        gasInclude,
      },
      signal,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch routes:", error);
    // Create a default empty route summary
    const emptyRouteSummary: RouteSummary = {
      tokenIn,
      amountIn,
      amountInUsd: "0",
      tokenOut,
      amountOut: "0",
      amountOutUsd: "0",
      gas: "0",
      gasPrice: "0",
      gasUsd: "0",
      l1FeeUsd: "0",
      extraFee: {
        feeAmount: "0",
        chargeFeeBy: "",
        isInBps: false,
        feeReceiver: "",
      },
      route: [] as RouteStep[][],
      routeID: "",
      checksum: "",
      timestamp: 0,
    };

    return {
      code: -1,
      message: `Sorry, we couldn't find any rate for this pair`,
      data: {
        routeSummary: emptyRouteSummary,
        routerAddress: "",
      },
      requestId: "error-" + Date.now(),
    };
  }
};

export const fetchPriceImpact = async (
  tokenIn: string,
  tokenInDecimal: number,
  tokenOut: string,
  tokenOutDecimal: number,
  amountIn: string,
  amountOut: string,
  chainId: string,
  signal?: AbortSignal
): Promise<PriceImpactResponse> => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_PRICE_IMPACT, {
      params: {
        tokenIn,
        tokenInDecimal,
        tokenOut,
        tokenOutDecimal,
        amountIn,
        amountOut,
        chainId,
      },
      signal,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch price impact:", error);
    return {
      code: -1,
      message: "Failed to fetch price impact",
      data: {
        amountInUSD: "0",
        amountOutUSD: "0",
        priceImpact: "0",
      },
    };
  }
};

export const fetchPricesUsd = async (
  tokenIds: string[]
): Promise<PriceUsdData> => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_PRICE_USD, {
      params: {
        ids: tokenIds.join(","),
        vs_currencies: "usd",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch USD prices:", error);
    return {};
  }
};

export const fetch24hChange = async (
  tokenIds: string[]
): Promise<Change24hData> => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_24H_CHANGE, {
      params: {
        ids: tokenIds.join(","),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch 24h changes:", error);
    return {};
  }
};

export const buildTransaction = async (
  chain: string,
  data: BuildTransactionRequest
): Promise<BuildTransactionResponse> => {
  try {
    const url = API_ENDPOINTS.BUILD_TRANSACTION.replace("{chain}", chain);
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    console.error("Failed to build transaction:", error);
    return {
      code: -1,
      message: "Failed to build transaction",
      data: {
        amountIn: "0",
        amountInUsd: "0",
        amountOut: "0",
        amountOutUsd: "0",
        gas: "0",
        gasUsd: "0",
        data: "",
        routerAddress: "",
        transactionValue: "0",
      },
      requestId: "error-" + Date.now(),
    };
  }
};

export const fetchTokensByWalletAddress = async (
  chainId: string,
  walletAddress: string
): Promise<TokensResponse> => {
  try {
    const url = API_ENDPOINTS.GET_WALLET_BALANCES.replace(
      "{chainId}",
      chainId
    ).replace("{address}", walletAddress);

    const response = await api.get(url, {
      params: {
        isExtendToken: true,
        onlyTokenVerified: true,
        forceSync: true,
      },
    });

    // Simply return the response data as it now matches the TokensResponse type
    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data?.message || "Failed to fetch tokens");
  } catch (error) {
    console.error(
      `Failed to fetch tokens for chain ${chainId} and wallet ${walletAddress}:`,
      error
    );
    return {
      success: false,
      message: "Failed to fetch tokens",
      data: { balances: [] },
    };
  }
};

export const fetchMultiTokenInfo = async (
  chainId: string,
  tokenAddresses: string[],
  walletAddress: string
): Promise<TokensResponse> => {
  try {
    const url = API_ENDPOINTS.GET_MULTI_TOKEN_INFO.replace(
      "{chainId}",
      chainId
    ).replace("{addressWallet}", walletAddress);

    const response = await api.post(url, {
      tokenAddresses,
    });

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data?.message || "Failed to fetch custom tokens");
  } catch (error) {
    console.error(`Failed to fetch custom tokens for chain ${chainId}:`, error);
    return {
      success: false,
      message: "Failed to fetch custom tokens",
      data: { balances: [] },
    };
  }
};

// New multi-chain API for fetching token info across multiple chains
export const fetchMultiChainTokenInfo = async (
  chainAddressMap: Record<string, string>,
  params: {
    isExtendToken?: boolean;
    onlyTokenVerified?: boolean;
    forceSync?: boolean;
  } = {
    isExtendToken: true,
    onlyTokenVerified: true,
    forceSync: true,
  }
): Promise<{
  success: boolean;
  data: {
    balances: Record<string, any[]>;
    chainTotalUsd: Record<string, string>;
  };
  message?: string;
}> => {
  try {
    const url = API_ENDPOINTS.GET_WALLET_BALANCES_MULTI_CHAIN;
    const response = await api.post(
      url,
      {
        addresses: chainAddressMap,
      },
      {
        params: params,
      }
    );
    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data?.message || "Failed to fetch multi-chain token info"
    );
  } catch (error) {
    console.error("Failed to fetch multi-chain token info:", error);
    return {
      success: false,
      message: `Failed to fetch multi-chain token info: ${error}`,
      data: { balances: {}, chainTotalUsd: {} },
    };
  }
};
export * from "./adapters/BaseAdapter";
export * from "./adapters/jupiter";
export * from "./adapters/kyberswap";
export * from "./adapters/obridge";
export * from "./adapters/skip";
// Search tokens API with query parameter
export const searchTokens = async (
  chainId: string,
  walletAddress: string,
  query: string,
  signal?: AbortSignal
): Promise<TokensResponse> => {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: true,
        message: "Empty query",
        data: { balances: [] },
      };
    }

    const url = API_ENDPOINTS.SEARCH_TOKENS;

    const response = await api.get<SearchTokensResponse>(url + `/${chainId}`, {
      params: {
        walletAddress,
        query: query.trim(),
      },
      signal,
    });

    if (response.data && response.data.success) {
      // Convert SearchTokenItem[] to BalanceItem[]
      const balances: BalanceItem[] = response.data.data.map(
        (item: SearchTokenItem) => {
          const balanceAmount = item.balance?.amount || "0";
          const balanceFormatted = item.balance?.balanceFormatted || "0";
          const usdPrice = item.balance?.usdPrice || 0;
          const usdValue = parseFloat(item.balance?.usdValue || "0");

          return {
            chain: {
              id: item.chainId,
              name: item.chainType,
              type: item.chainType,
              standardId: item.chainId,
            },
            token: {
              id: item._id,
              symbol: item.symbol,
              name: item.name,
              address: item.address,
              decimals: item.decimals,
              logoURI: item.logoURI || "",
              isNative: item.isNative,
              isVerified: item.isVerified,
              isToken2022: item.isToken2022,
              coingeckoId: item.coingeckoId,
            },
            balance: balanceAmount,
            balanceFormatted: balanceFormatted,
            usdPrice: usdPrice,
            usdValue: usdValue,
            lastUpdated: item.balance?.lastUpdated || new Date().toISOString(),
          };
        }
      );

      return {
        success: true,
        message: "Search successful",
        data: { balances },
      };
    }

    throw new Error(response.data?.message || "Failed to search tokens");
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Token search request cancelled");
      return {
        success: false,
        message: "Request cancelled",
        data: { balances: [] },
      };
    }

    console.error(
      `Failed to search tokens for chain ${chainId} with query "${query}":`,
      error
    );
    return {
      success: false,
      message: "Failed to search tokens",
      data: { balances: [] },
    };
  }
};
