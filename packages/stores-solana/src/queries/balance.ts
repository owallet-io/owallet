import { _getBalancesSolana, API, DenomHelper } from "@owallet/common";
import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  ObservableQuery,
  QueryResponse,
  QuerySharedContext,
} from "@owallet/stores";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { CoinPretty, Int } from "@owallet/unit";
import { computed, makeObservable } from "mobx";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
const tokenNative = "11111111111111111111111111111111";

interface CoinGeckoTokenInfo {
  id: string;
  symbol: string;
  name: string;
  platforms?: {
    solana?: string;
  };
}

// Static cache for CoinGecko data across all instances
export const COINGECKO_CACHE = {
  tokenAddressToCoingeckoIdMap: new Map<string, string>(),
  lastFetched: 0,
  isFetching: false,
};

// Cache duration - 1 hour
const CACHE_DURATION = 60 * 60 * 1000;
// Retry delay - 30 seconds
const RETRY_DELAY = 30 * 1000;

export class ObservableQuerySvmAccountBalanceImpl
  extends ObservableQuery<string, any>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly walletAddress: string
  ) {
    super(sharedContext, "", "");

    makeObservable(this);
    // Only fetch if cache is empty or expired
    if (
      COINGECKO_CACHE.tokenAddressToCoingeckoIdMap.size === 0 ||
      Date.now() - COINGECKO_CACHE.lastFetched > CACHE_DURATION
    ) {
      this.fetchCoingeckoTokenList();
    }
  }

  // Fetch CoinGecko token list to map Solana token addresses to CoinGecko IDs
  private async fetchCoingeckoTokenList() {
    // Prevent multiple concurrent fetches
    if (COINGECKO_CACHE.isFetching) {
      return;
    }

    try {
      COINGECKO_CACHE.isFetching = true;

      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/list?include_platform=true",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 429) {
        console.warn("CoinGecko API rate limit reached. Will retry later.");
        // Schedule a retry
        setTimeout(() => {
          COINGECKO_CACHE.isFetching = false;
          this.fetchCoingeckoTokenList();
        }, RETRY_DELAY);
        return;
      }

      if (!response.ok) {
        console.error(
          "Failed to fetch CoinGecko token list:",
          response.status,
          response.statusText
        );
        COINGECKO_CACHE.isFetching = false;
        return;
      }

      const tokens: CoinGeckoTokenInfo[] = await response.json();

      // Clear previous data and update with new tokens
      COINGECKO_CACHE.tokenAddressToCoingeckoIdMap.clear();

      // Filter tokens that have Solana platform data
      tokens.forEach((token) => {
        if (token.platforms?.solana) {
          COINGECKO_CACHE.tokenAddressToCoingeckoIdMap.set(
            token.platforms.solana.toLowerCase(),
            token.id
          );
        }
      });

      // Update cache timestamp
      COINGECKO_CACHE.lastFetched = Date.now();

      console.log(
        `Loaded ${COINGECKO_CACHE.tokenAddressToCoingeckoIdMap.size} Solana tokens from CoinGecko`
      );
    } catch (error) {
      console.error("Error fetching CoinGecko token list:", error);
    } finally {
      COINGECKO_CACHE.isFetching = false;
    }
  }

  // Get CoinGecko ID for a Solana token address
  private getCoingeckoIdForTokenAddress(
    tokenAddress: string
  ): string | undefined {
    return COINGECKO_CACHE.tokenAddressToCoingeckoIdMap.get(
      tokenAddress.toLowerCase()
    );
  }

  protected override canFetch(): boolean {
    // If ethereum hex address is empty, it will always fail, so don't need to fetch it.
    return this.walletAddress.length > 0;
  }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;
    const contractAddress = this.denomHelper.contractAddress;
    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }
    const tokenInfos = (this.response.data as any)?.wallet.balances.tokens
      .edges;
    if (!tokenInfos?.length) return;

    const token = tokenInfos.find((item, index) => {
      if (!contractAddress) {
        return item.node.token === tokenNative;
      }
      return item.node.token === contractAddress;
    });
    if (!token) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }
    return new CoinPretty(currency, new Int(token.node.amount));
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${this.walletAddress}-${
      this.denomHelper.denom
    }`;
  }

  protected onReceiveResponse(_: Readonly<QueryResponse<string>>) {
    super.onReceiveResponse(_);
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const tokenInfos = (_.data as any)?.wallet.balances.tokens.edges;
    if (!tokenInfos?.length) return;

    // 5. Map token metadata to currencies
    const allTokenAddress = tokenInfos.filter(
      (item, index) => item.node.tokenListEntry.address !== tokenNative
    );
    if (!allTokenAddress?.length) return;
    const currencyInfo = allTokenAddress.map((item) => {
      const tokenAddress = item.node.tokenListEntry.address;
      // Get CoinGecko ID from our map
      const coinGeckoId =
        this.getCoingeckoIdForTokenAddress(tokenAddress) ||
        item.node.tokenListEntry.coingeckoId;
      console.log("coinGeckoId", coinGeckoId);
      return {
        coinImageUrl: item.node.tokenListEntry.logo,
        coinDenom: item.node.tokenListEntry.symbol,
        coinGeckoId: coinGeckoId, // Use the one from our map or fallback to existing
        coinDecimals: item.node.tokenListEntry.decimals,
        coinMinimalDenom:
          item.node.solana?.tokenProgram === TOKEN_2022_PROGRAM_ID.toBase58()
            ? `spl20:${item.node.tokenListEntry.address}`
            : `spl:${item.node.tokenListEntry.address}`,
      };
    });

    console.log("currencyInfo", currencyInfo);
    // 6. Update chain info with currencies
    chainInfo.addCurrencies(...currencyInfo);
  }

  async fetchSplBalances() {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (await _getBalancesSolana(
      this.walletAddress,
      chainInfo.chainId.replace("solana:", "")
    )) as any;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: any }> {
    const data = await this.fetchSplBalances();
    return {
      data: data,
      headers: null,
    };
  }
}

export class ObservableQuerySvmAccountBalanceRegistry
  implements BalanceRegistry
{
  constructor(protected readonly sharedContext: QuerySharedContext) {}

  // missing this
  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter<ChainInfo>,
    address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    const chainInfo = chainGetter.getChain(chainId);
    if (!chainInfo.chainId.includes("solana")) return;
    return new ObservableQuerySvmAccountBalanceImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      address
    );
  }
}
