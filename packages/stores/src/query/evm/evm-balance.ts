import { Result } from './types';
import { KVStore } from '@owallet/common';
import { ObservableChainQuery, ObservableChainQueryMap } from '../chain-query';
import { ChainGetter, QueryResponse } from '../../common';
import { computed } from 'mobx';
import { CoinPretty, Int } from '@owallet/unit';
import { CancelToken } from 'axios';

export class ObservableQueryEvmBalanceInner extends ObservableChainQuery<Result> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly address: string
  ) {
    super(kvStore, chainId, chainGetter, '', {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 'evm-balance'
    });
  }

  protected canFetch(): boolean {
    return this.address.length !== 0;
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<Result>> {
    const response = await super.fetchResponse(cancelToken);

    const evmResult = response.data;

    if (!evmResult) {
      throw new Error('Failed to get the response from the contract');
    }

    return {
      data: evmResult,
      status: response.status,
      staled: false,
      timestamp: Date.now()
    };
  }

  @computed
  get balance(): CoinPretty | undefined {
    if (!this.response?.data) {
      return undefined;
    }

    const chainInfo = this.chainGetter.getChain(this._chainId);

    return new CoinPretty(
      chainInfo.stakeCurrency,
      new Int(BigInt(this.response.data.result).toString())
    );
  }
}

export class ObservableQueryEvmBalance extends ObservableChainQueryMap<Result> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (address: string) => {
      return new ObservableQueryEvmBalanceInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        address
      );
    });
  }

  getQueryBalance(address: string): ObservableQueryEvmBalanceInner {
    if (!address) return null;
    return this.get(address) as ObservableQueryEvmBalanceInner;
  }
}
