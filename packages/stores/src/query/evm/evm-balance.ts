import { Result } from './types';
import {
  ChainIdEnum,
  KVStore,
  MyBigInt,
  OasisBalance,
  addressToPublicKey,
  getOasisNic,
  parseRpcBalance
} from '@owallet/common';
import { ObservableChainQuery, ObservableChainQueryMap } from '../chain-query';
import { ChainGetter, QueryResponse } from '../../common';
import { computed } from 'mobx';
import { CoinPretty, Int } from '@owallet/unit';
import { CancelToken } from 'axios';

export class ObservableQueryEvmBalanceInner extends ObservableChainQuery<Result | OasisBalance> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, protected readonly address: string) {
    console.log('🚀 ~ ObservableQueryEvmBalanceInner ~ constructor ~ chainId:', chainId, address);
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
  protected async getOasisBalance() {
    try {
      const chainInfo = this.chainGetter.getChain(this._chainId);
      const nic = getOasisNic(chainInfo.raw.grpc);
      const publicKey = await addressToPublicKey(this.address);
      const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
      const grpcBalance = parseRpcBalance(account);
      console.log('🚀 ~ ObservableQueryEvmBalanceInner ~ getOasisBalance ~ grpcBalance:', grpcBalance);
      return grpcBalance;
    } catch (error) {
      console.log('🚀 ~ ObservableQueryEvmBalanceInner ~ getOasisBalance ~ error:', error);
    }
  }
  protected async fetchResponse(cancelToken: CancelToken): Promise<QueryResponse<Result | OasisBalance>> {
    const response = await super.fetchResponse(cancelToken);

    if (this._chainId === ChainIdEnum.OasisNative) {
      const oasisRs = await this.getOasisBalance();
      console.log('🚀 ~ ObservableQueryEvmBalanceInner ~ fetchResponse ~ oasisRs:', oasisRs);
      return {
        data: oasisRs,
        status: response.status,
        staled: false,
        timestamp: Date.now()
      };
    }
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
    const chainInfo = this.chainGetter.getChain(this._chainId);
    if (!this.response?.data) {
      return undefined;
    }
    if (this.chainId === ChainIdEnum.OasisNative) {
      return new CoinPretty(
        chainInfo.stakeCurrency,
        new Int(new MyBigInt((this.response.data as OasisBalance).available).toString())
      );
    }
    return new CoinPretty(
      chainInfo.stakeCurrency,
      new Int(new MyBigInt((this.response.data as Result).result).toString())
    );
  }
}

export class ObservableQueryEvmBalance extends ObservableChainQueryMap<Result | OasisBalance> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (address: string) => {
      return new ObservableQueryEvmBalanceInner(this.kvStore, this.chainId, this.chainGetter, address);
    });
  }

  getQueryBalance(address: string): ObservableQueryEvmBalanceInner {
    if (!address) return null;
    return this.get(address) as ObservableQueryEvmBalanceInner;
  }
}
