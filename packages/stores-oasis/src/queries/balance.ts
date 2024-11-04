import { DenomHelper, parseRpcBalance } from '@owallet/common';
import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  ObservableQuery,
  QuerySharedContext
} from '@owallet/stores';
import { AppCurrency, ChainInfo } from '@owallet/types';
import { CoinPretty, Int } from '@owallet/unit';
import { computed, makeObservable } from 'mobx';
import * as oasis from '@oasisprotocol/client';
import { staking } from '@oasisprotocol/client';

export class ObservableQueryOasisAccountBalanceImpl
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

  protected override async fetchResponse(abortController: AbortController): Promise<{ headers: any; data: any }> {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const nic = new oasis.client.NodeInternal(chainInfo.grpc);
    const publicKey = await staking.addressFromBech32(this.bech32Address);
    const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
    const grpcBalance = parseRpcBalance(account);
    return {
      headers: {},
      data: grpcBalance.available
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${this.bech32Address}-${this.denomHelper.denom}`;
  }
}

export class ObservableQueryOasisAccountBalanceRegistry implements BalanceRegistry {
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
    if (!chainInfo.features.includes('oasis') || denomHelper.type !== 'native') return;
    return new ObservableQueryOasisAccountBalanceImpl(this.sharedContext, chainId, chainGetter, denomHelper, address);
  }
}
