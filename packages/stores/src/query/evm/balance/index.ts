import { DenomHelper, KVStore, Web3Provider } from '@owallet/common';
import { ChainGetter, CoinPrimitive, QueryResponse } from '../../../common';
import { computed, makeObservable, override } from 'mobx';
import { CoinPretty, Int } from '@owallet/unit';
import { StoreUtils } from '../../../common';
import { BalanceRegistry, BalanceRegistryType, ObservableQueryBalanceInner } from '../../balances';
import { ObservableChainQuery } from '../../chain-query';
import { Balances } from './types';
import { CancelToken } from 'axios';

export class ObservableQueryBalanceNative extends ObservableQueryBalanceInner {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly nativeBalances: ObservableQueryEvmBalances
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      // No need to set the url
      '',
      denomHelper
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return false;
  }

  get isFetching(): boolean {
    return this.nativeBalances.isFetching;
  }

  get error() {
    return this.nativeBalances.error;
  }

  get response() {
    return this.nativeBalances.response;
  }

  @override
  *fetch() {
    yield this.nativeBalances.fetch();
  }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.nativeBalances.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return StoreUtils.getBalanceFromCurrency(currency, this.nativeBalances.response.data.balances);
  }
}

export class ObservableQueryEvmBalances extends ObservableChainQuery<Balances> {
  protected walletAddress: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, walletAddress: string) {
    super(kvStore, chainId, chainGetter, '');

    this.walletAddress = walletAddress;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.walletAddress.length > 0;
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

  //   protected setResponse(response: Readonly<QueryResponse<Balances>>) {
  //     super.setResponse(response);

  //     const chainInfo = this.chainGetter.getChain(this.chainId);
  //     // Attempt to register the denom in the returned response.
  //     // If it's already registered anyway, it's okay because the method below doesn't do anything.
  //     // Better to set it as an array all at once to reduce computed.
  //     const denoms = response.data.balances.map((coin) => coin.denom);
  //     chainInfo.addUnknownCurrencies(...denoms);
  //   }
  protected async fetchResponse(cancelToken: CancelToken): Promise<QueryResponse<Balances>> {
    const web3 = Web3Provider(this.chainGetter.getChain(this.chainId).rest);
    const ethBalance = await web3.eth.getBalance(this.walletAddress);
    console.log('🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ ethBalance:', ethBalance);
    const denomNative = this.chainGetter.getChain(this.chainId).stakeCurrency.coinMinimalDenom;
    console.log('🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ denomNative:', denomNative);
    const balances: CoinPrimitive[] = [
      {
        amount: ethBalance,
        denom: denomNative
      }
    ];

    const data = {
      balances
    };
    console.log('🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ data:', data);

    return {
      status: 1,
      staled: false,
      data,
      timestamp: Date.now()
    };
  }
  protected getCacheKey(): string {
    return `${this.instance.name}-${this.instance.defaults.baseURL}-balance-evm-native-${this.chainId}-${this.walletAddress}`;
  }
}

export class ObservableQueryEvmBalanceRegistry implements BalanceRegistry {
  protected nativeBalances: Map<string, ObservableQueryEvmBalances> = new Map();

  readonly type: BalanceRegistryType = 'erc20';

  constructor(protected readonly kvStore: KVStore) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    console.log('🚀 ~ ObservableQueryEvmBalanceRegistry ~ minimalDenom:', minimalDenom);
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type !== 'native') {
      return;
    }

    const key = `${chainId}/${walletAddress}`;

    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(key, new ObservableQueryEvmBalances(this.kvStore, chainId, chainGetter, walletAddress));
    }

    return new ObservableQueryBalanceNative(
      this.kvStore,
      chainId,
      chainGetter,
      denomHelper,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.nativeBalances.get(key)!
    );
  }
}
