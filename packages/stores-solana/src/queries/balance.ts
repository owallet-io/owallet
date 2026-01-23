import {
  _getBalancesSolana,
  API,
  DenomHelper,
  Network,
  parseRpcBalance,
} from "@owallet/common";
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
const tokenNative = "So11111111111111111111111111111111111111112";
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
    if (!tokenInfos?.length) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

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

    // // 5. Map token metadata to currencies
    const allTokenAddress = tokenInfos.filter(
      (item, index) => item.node.tokenListEntry.address !== tokenNative
    );
    if (!allTokenAddress?.length) return;
    const currencyInfo = allTokenAddress.map((item) => {
      return {
        coinImageUrl: item.node.tokenListEntry.logo,
        coinDenom: item.node.tokenListEntry.symbol,
        coinGeckoId: item.node.tokenListEntry.coingeckoId,
        coinDecimals: item.node.tokenListEntry.decimals,
        coinMinimalDenom:
          item.node.solana?.tokenProgram === TOKEN_2022_PROGRAM_ID.toBase58()
            ? `spl20:${item.node.tokenListEntry.address}`
            : `spl:${item.node.tokenListEntry.address}`,
      };
    });
    // // 6. Update chain info with currencies
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
