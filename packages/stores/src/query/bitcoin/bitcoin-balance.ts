import { Result } from './types';
import { KVStore, MyBigInt } from '@owallet/common';
import { ObservableChainQuery, ObservableChainQueryMap } from '../chain-query';
import { ChainGetter, QueryResponse } from '../../common';
import { computed } from 'mobx';
import { CoinPretty, Int } from '@owallet/unit';
import { CancelToken } from 'axios';
import {
  getScriptHash,
  getBalanceFromUtxos,
  getKeyPair,
  getAddress,
  getCoinNetwork
} from '@owallet/bitcoin';
export class ObservableQueryBitcoinBalanceInner {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly address: string
  ) {
    // super(kvStore, chainId, chainGetter, '', {
    //   jsonrpc: '2.0',
    //   method: 'eth_getBalance',
    //   params: [address, 'latest'],
    //   id: 'evm-balance'
    // });
  }

  //   protected canFetch(): boolean {
  //     return this.address.length !== 0;
  //   }

  //   protected async fetchResponse(
  //     cancelToken: CancelToken
  //   ): Promise<QueryResponse<Result>> {
  //     const response = await super.fetchResponse(cancelToken);

  //     const evmResult = response.data;

  //     if (!evmResult) {
  //       throw new Error('Failed to get the response from the contract');
  //     }

  //     return {
  //       data: evmResult,
  //       status: response.status,
  //       staled: false,
  //       timestamp: Date.now()
  //     };
  //   }

  async balance(): Promise<Number> {
    // return 10;
    // if (!this.response?.data) {
    //   return undefined;
    // }

    const path = `m/84'/1'/0'/0/0`;
    // console.log("🚀 ~ file: bitcoin-balance.ts:66 ~ ObservableQueryBitcoinBalanceInner ~ getbalance ~ address:", address)
    const scriptHash = getScriptHash(
      this.address,
      getCoinNetwork(this.chainId)
    );
    console.log(
      '🚀 ~ file: bitcoin-balance.ts:71 ~ ObservableQueryBitcoinBalanceInner ~ getbalance ~ scriptHash:',
      scriptHash
    );
    return getBalanceFromUtxos({
      addresses: [{ address: this.address, path, scriptHash }],
      changeAddresses: [],
      selectedCrypto: this.chainId
    }).then((res) => {
      if (!res.data.balance) {
        console.log('Balance is 0');
        return Promise.resolve(0);
      }
      return Promise.resolve(res.data?.balance);
    });
    //
    // getBalanceFromUtxos({
    //   addresses: [{ address: this.address, path, scriptHash }],
    //   changeAddresses: [],
    //   selectedCrypto
    // })
    //   .then((res) => {
    //     console.log(
    //       '🚀 ~ file: bitcoin-balance.ts:61 ~ ObservableQueryBitcoinBalanceInner ~ getbalance ~ res:',
    //       res
    //     );
    //     if (!res.data.balance) {
    //       console.log('Balance is 0');
    //       return;
    //     }
    //   })
    //   .catch((err) => console.log(err, 'kakakaa'));

    // if (!res.data.balance) {
    //   console.log('Balance is 0');
    //   return;
    // }

    // const chainInfo = this.chainGetter.getChain(this.chainId);

    // return new CoinPretty(chainInfo.stakeCurrency, '100.283674');
  }
}

export class ObservableQueryBitcoinBalance {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {}

  getQueryBalance(address: string): ObservableQueryBitcoinBalanceInner {
    if (!address) throw Error('Not Found address bitcoin for query balance');
    return new ObservableQueryBitcoinBalanceInner(
      this.kvStore,
      this.chainId,
      this.chainGetter,
      address
    );
    // return this.get(address) as ObservableQueryBitcoinBalanceInner;
  }
}
