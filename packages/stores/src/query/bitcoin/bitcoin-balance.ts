import { Result } from './types';
import { KVStore, MyBigInt } from '@owallet/common';
import { ObservableChainQuery, ObservableChainQueryMap } from '../chain-query';
import { ChainGetter, QueryResponse } from '../../common';
import { computed } from 'mobx';
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
export class ObservableQueryBitcoinBalanceInner {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly address: string
  ) {}
  @computed
  async balance(): Promise<CoinPretty | undefined> {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string
    }) as string;
    console.log("🚀 ~ file: bitcoin-balance.ts:30 ~ ObservableQueryBitcoinBalanceInner ~ balance ~ path:", path)
    const scriptHash = getScriptHash(
      this.address,
      getCoinNetwork(this.chainId)
    );
    const res = await getBalanceFromUtxos({
      addresses: [{ address: this.address, path, scriptHash }],
      changeAddresses: [],
      selectedCrypto: this.chainId
    });

    if (!res.data.balance) {
      console.log('Balance is 0');
      return Promise.resolve(
        new CoinPretty(
          chainInfo.stakeCurrency,
          new Int(new MyBigInt(0).toString())
        )
      );
    }
    return Promise.resolve(
      new CoinPretty(
        chainInfo.stakeCurrency,
        new Int(new MyBigInt(res.data?.balance).toString())
      )
    );
  }
  @computed
  async balances(): Promise<
    {
      balance: CoinPretty;
    }[]
  > {
    const balances: {
      balance: CoinPretty;
    }[] = [];
    balances.push({ balance: await this.balance() });

    return balances;
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
