import { Result } from './types';
import { DenomHelper, KVStore, MyBigInt } from '@owallet/common';
import { ObservableChainQuery, ObservableChainQueryMap } from '../chain-query';
import { ChainGetter, QueryResponse, StoreUtils } from '../../common';
import { action, computed, makeObservable, override } from 'mobx';
import { CoinPretty, Int } from '@owallet/unit';
import { CancelToken } from 'axios';
import { getBaseDerivationPath } from '@owallet/bitcoin';
import {
  getScriptHash,
  getBalanceFromUtxos,
  getKeyPair,
  getAddress,
  getCoinNetwork
} from '@owallet/bitcoin';
import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner
} from '../balances';
import { Currency } from '@owallet/types';
export class ObservableQueryBitcoinBalanceInner extends ObservableChainQuery<Result> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly address: string
  ) {
    super(kvStore, chainId, chainGetter, '', {
      jsonrpc: '2.0',
      method: 'btc_getBalance',
      params: [address, 'latest'],
      id: 'btc-balance'
    });
  }

  @computed
  get balance() {
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:31 ~ ObservableQueryBitcoinBalanceInner ~ getbalance ~ this.response:',
      this.response
    );
    if (!this.response?.data) {
      return undefined;
    }
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:29 ~ ObservableQueryBitcoinBalanceInner ~ gettestBalance ~ this.response?.data:',
      this.response?.data
    );
    return null;
  }
  // @action
  // async ferchBalance() {
  //   const chainInfo = this.chainGetter.getChain(this.chainId);

  //   const path = getBaseDerivationPath({
  //     selectedCrypto: this.chainId as string
  //   }) as string;
  //   console.log(
  //     '🚀 ~ file: bitcoin-balance.ts:30 ~ ObservableQueryBitcoinBalanceInner ~ balance ~ path:',
  //     path
  //   );
  //   const scriptHash = getScriptHash(
  //     this.address,
  //     getCoinNetwork(this.chainId)
  //   );
  //   const res = await getBalanceFromUtxos({
  //     addresses: [{ address: this.address, path, scriptHash }],
  //     changeAddresses: [],
  //     selectedCrypto: this.chainId
  //   });
  //   console.log(
  //     '🚀 ~ file: bitcoin-balance.ts:63 ~ ObservableQueryBitcoinBalanceInner ~ ferchBalance ~ res:',
  //     res
  //   );
  //   this.setResponse({
  //     ...res,
  //     timestamp: Date.now(),
  //     staled: true
  //   });
  //   // if (!res.data.balance) {
  //   //   console.log('Balance is 0');
  //   //   return Promise.resolve(
  //   //     new CoinPretty(
  //   //       chainInfo.stakeCurrency,
  //   //       new Int(new MyBigInt(0).toString())
  //   //     )
  //   //   );
  //   // }
  //   // return Promise.resolve(
  //   //   new CoinPretty(
  //   //     chainInfo.stakeCurrency,
  //   //     new Int(new MyBigInt(res.data?.balance).toString())
  //   //   )
  //   // );
  // }
  // @computed
  // async balances(): Promise<
  //   {
  //     balance: CoinPretty;
  //   }[]
  // > {
  //   const balances: {
  //     balance: CoinPretty;
  //   }[] = [];
  //   balances.push({ balance: await this.balance() });

  //   return balances;
  // }
  protected canFetch(): boolean {
    return this.address.length !== 0;
  }
  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<Result>> {
    console.log('da vao day');
    const res = await super.fetchResponse(cancelToken);
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:108 ~ ObservableQueryBitcoinBalanceInner ~ res:',
      res
    );
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string
    }) as string;
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:30 ~ ObservableQueryBitcoinBalanceInner ~ balance ~ path:',
      path
    );
    const scriptHash = getScriptHash(
      this.address,
      getCoinNetwork(this.chainId)
    );
    const response = await getBalanceFromUtxos({
      addresses: [{ address: this.address, path, scriptHash }],
      changeAddresses: [],
      selectedCrypto: this.chainId
    });
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:112 ~ ObservableQueryBitcoinBalanceInner ~ response:',
      response
    );
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

export class ObservableQueryBitcoinBalance extends ObservableChainQueryMap<Result> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (address: string) => {
      return new ObservableQueryBitcoinBalanceInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        address
      );
    });
  }

  getQueryBalance(address: string): ObservableQueryBitcoinBalanceInner {
    if (!address) return null;
    return this.get(address) as ObservableQueryBitcoinBalanceInner;
    // return this.get(address) as ObservableQueryBitcoinBalanceInner;
  }
}
export class ObservableQueryBtcBalances extends ObservableChainQuery<Result> {
  protected bech32Address: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(kvStore, chainId, chainGetter, `bitcoin/balances/${bech32Address}`);

    this.bech32Address = bech32Address;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }
  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<Result>> {
    console.log('da vao day');
    const res = await super.fetchResponse(cancelToken);
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:108 ~ ObservableQueryBitcoinBalanceInner ~ res:',
      res
    );
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string
    }) as string;
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:30 ~ ObservableQueryBitcoinBalanceInner ~ balance ~ path:',
      path
    );
    const scriptHash = getScriptHash(
      this.bech32Address,
      getCoinNetwork(this.chainId)
    );
    const response = await getBalanceFromUtxos({
      addresses: [{ address: this.bech32Address, path, scriptHash }],
      changeAddresses: [],
      selectedCrypto: this.chainId
    });
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:112 ~ ObservableQueryBitcoinBalanceInner ~ response:',
      response
    );
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
  // @override
  // *fetch() {
  //   if (!this.duplicatedFetchCheck) {
  //     // Because the native "bank" module's balance shares the querying result,
  //     // it is inefficient to fetching duplicately in the same loop.
  //     // So, if the fetching requests are in the same tick, this prevent to refetch the result and use the prior fetching.
  //     this.duplicatedFetchCheck = true;
  //     setTimeout(() => {
  //       this.duplicatedFetchCheck = false;
  //     }, 1);

  //     yield super.fetch();
  //   }
  // }

  // protected setResponse(response: Readonly<QueryResponse<Result>>) {
  //   super.setResponse(response);

  //   const chainInfo = this.chainGetter.getChain(this.chainId);
  //   // Attempt to register the denom in the returned response.
  //   // If it's already registered anyway, it's okay because the method below doesn't do anything.
  //   // Better to set it as an array all at once to reduce computed.
  //   // const denoms = response.data.result.map((coin) => coin.denom);
  //   // chainInfo.addUnknownCurrencies(...denoms);
  // }
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
    console.log('fetch kkkkkkkkkk');
    yield this.nativeBalances.fetch();
  }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.nativeBalances.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    console.log(
      '🚀 ~ file: bitcoin-balance.ts:280 ~ ObservableQueryBitcoinBalanceNative ~ getbalance ~ this.nativeBalances.response:',
      this.nativeBalances.response
    );
    // return StoreUtils.getBalanceFromCurrency(
    //   currency,
    //   this.nativeBalances.response.data.result
    // );
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
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:347 ~ ObservableQueryBitcoinBalanceRegistry ~ denomHelper:',
      denomHelper
    );

    if (denomHelper.type !== 'native') {
      return;
    }

    const key = `${chainId}/${bech32Address}`;
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:354 ~ ObservableQueryBitcoinBalanceRegistry ~ this.nativeBalances:',
      this.nativeBalances
    );
    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(
        key,
        new ObservableQueryBtcBalances(
          this.kvStore,
          chainId,
          chainGetter,
          bech32Address
        )
      );
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
