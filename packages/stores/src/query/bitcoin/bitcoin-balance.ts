import { Result } from './types';
import { DenomHelper, KVStore, MyBigInt } from '@owallet/common';
import { ObservableChainQuery, ObservableChainQueryMap } from '../chain-query';
import { ChainGetter, QueryResponse, StoreUtils } from '../../common';
import { action, computed, makeObservable, override } from 'mobx';
import { CoinPretty, Int } from '@owallet/unit';
import { CancelToken } from 'axios';
import { getBaseDerivationPath } from '@owallet/bitcoin';
import { getScriptHash, getBalanceFromUtxos, getCoinNetwork } from '@owallet/bitcoin';
import { BalanceRegistry, BalanceRegistryType, ObservableQueryBalanceInner } from '../balances';
import { Currency } from '@owallet/types';

export class ObservableQueryBtcBalances extends ObservableChainQuery<Result> {
  protected bech32Address: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, bech32Address: string) {
    super(kvStore, chainId, chainGetter, `/addrs/${bech32Address}/full`);

    this.bech32Address = bech32Address;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }
  protected async fetchResponse(cancelToken: CancelToken): Promise<QueryResponse<Result>> {
    const resApi = await super.fetchResponse(cancelToken);
    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string,
      keyDerivationPath: '84'
    }) as string;
    const scriptHash = getScriptHash(this.bech32Address, getCoinNetwork(this.chainId));
    const response = await getBalanceFromUtxos({
      addresses: [{ address: this.bech32Address, path, scriptHash }],
      changeAddresses: [],
      selectedCrypto: this.chainId
    });

    const btcResult = response.data;
    if (!btcResult) {
      throw new Error('Failed to get the response from bitcoin');
    }

    return {
      data: btcResult,
      status: 1,
      staled: false,
      timestamp: Date.now()
    };
  }
}
export class ObservableQueryBitcoinBalanceNative extends ObservableQueryBalanceInner {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly nativeBalances: ObservableQueryBtcBalances
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
    return true;
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

    if (
      !this.nativeBalances.response?.data ||
      !this.nativeBalances.response?.data?.balance ||
      currency.coinDenom !== 'BTC'
    ) {
      return new CoinPretty(currency, new Int(new MyBigInt(0)?.toString()));
    }
    return new CoinPretty(currency, new Int(new MyBigInt(this.response?.data?.balance)?.toString()));
  }
}
export class ObservableQueryBitcoinBalanceRegistry implements BalanceRegistry {
  protected nativeBalances: Map<string, ObservableQueryBtcBalances> = new Map();
  readonly type: BalanceRegistryType = 'bitcoin';

  constructor(protected readonly kvStore: KVStore) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);

    if (denomHelper.type !== 'native') {
      return;
    }

    const key = `${chainId}/${bech32Address}`;
    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(key, new ObservableQueryBtcBalances(this.kvStore, chainId, chainGetter, bech32Address));
    }

    return new ObservableQueryBitcoinBalanceNative(
      this.kvStore,
      chainId,
      chainGetter,
      denomHelper,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.nativeBalances.get(key)!
    );
  }
}
