import { DenomHelper } from '@owallet/common';
import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  ObservableEvmChainJsonRpcQuery,
  ObservableQuery,
  QuerySharedContext
} from '@owallet/stores';
import { AppCurrency, ChainInfo } from '@owallet/types';
import { CoinPretty, Int } from '@owallet/unit';
import { computed, makeObservable, override } from 'mobx';
import Web3 from 'web3';

export class ObservableQueryTrxAccountBalanceImpl
  extends ObservableQuery<string, any>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly bech32Address: string
  ) {
    super(sharedContext, '', '');

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

export class ObservableQueryTrxAccountBalanceRegistry implements BalanceRegistry {
  protected nativeBalances: Map<string, ObservableQueryTronBalances> = new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter<ChainInfo>,
    address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    const chainInfo = chainGetter.getChain(chainId);

    if (denomHelper.type !== 'native' || !Web3.utils.isAddress(address)) return;
    if (!chainInfo.evm) return;
    const key = `tron-${chainId}/${address}`;

    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(key, new ObservableQueryTronBalances(this.sharedContext, chainId, chainGetter, address));
    }

    return new ObservableQueryTrxAccountBalanceImpl(this.sharedContext, chainId, chainGetter, denomHelper, address);
  }
}
