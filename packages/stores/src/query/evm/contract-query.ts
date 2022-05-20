import { ObservableChainQuery } from '../chain-query';
import { KVStore } from '@owallet/common';
import { ChainGetter } from '../../common';
import { CancelToken } from 'axios';
import { QueryResponse } from '../../common';

export class ObservableEvmContractChainQuery<
  T
> extends ObservableChainQuery<T> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected data: { [key: string]: any }
  ) {
    super(kvStore, chainId, chainGetter, '', data);
  }

  protected canFetch(): boolean {
    return this.contractAddress.length !== 0;
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<T>> {
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
}
