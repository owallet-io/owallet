import { DenomHelper } from '@owallet/common';
import {
  ChainGetter,
  IObservableQueryBalanceImpl,
  ObservableEvmChainJsonRpcQuery,
  ObservableQuery,
  QuerySharedContext
} from '@owallet/stores';
import { AppCurrency } from '@owallet/types';
import { CoinPretty, Int } from '@owallet/unit';
import { computed, makeObservable, override } from 'mobx';

export class ObservableQueryTrxAccountBalanceImpl
  extends ObservableQuery<string, any>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly bech32Address: string,
    protected readonly nativeBalances: ObservableQueryTronBalances
  ) {
    super(sharedContext, null, null, null);

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If ethereum hex address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find(cur => cur.coinMinimalDenom === denom);
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(BigInt(this.response.data)));
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
  }

  protected override async fetchResponse(abortController: AbortController): Promise<{ headers: any; data: any }> {
    return {
      headers: {},
      data: {}
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${this.bech32Address}-${this.denomHelper.denom}`;
  }
}

export class ObservableQueryTronBalances extends ObservableEvmChainJsonRpcQuery<string> {
  protected walletAddress: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(sharedContext: QuerySharedContext, chainId: string, chainGetter: ChainGetter, walletAddress: string) {
    super(sharedContext, chainId, chainGetter, 'eth_getBalance', [walletAddress, 'latest']);

    this.walletAddress = walletAddress;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.walletAddress?.length > 0;
  }

  @override
  *fetch() {
    if (!this.duplicatedFetchCheck) {
      // it is inefficient to fetching duplicately in the same loop.
      // So, if the fetching requests are in the same tick, this prevent to refetch the result and use the prior fetching.
      this.duplicatedFetchCheck = true;
      setTimeout(() => {
        this.duplicatedFetchCheck = false;
      }, 1);

      yield super.fetch();
    }
  }
}
