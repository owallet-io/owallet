import { Result } from './types';
import { KVStore, MyBigInt, getKeyDerivationFromAddressType } from '@owallet/common';
import { ObservableChainQuery, ObservableChainQueryMap } from '../chain-query';
import { ChainGetter, QueryResponse } from '../../common';
import { computed } from 'mobx';
import { CoinPretty, Int } from '@owallet/unit';
import { CancelToken } from 'axios';
import { getBaseDerivationPath } from '@owallet/bitcoin';
import { getScriptHash, getBalanceFromUtxos, getCoinNetwork } from '@owallet/bitcoin';
import { AddressBtcType } from '@owallet/types';

export class ObservableQueryBitcoinBalanceInner extends ObservableChainQuery<Result> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly address: string,
    protected readonly addressType: AddressBtcType
  ) {
    super(kvStore, chainId, chainGetter, `/addrs/${address}/full`);
  }

  @computed
  get balance() {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!this.response?.data || !this.response?.data?.balance) {
      return new CoinPretty(chainInfo.stakeCurrency, new Int(new MyBigInt(0)?.toString()));
    }

    return new CoinPretty(chainInfo.stakeCurrency, new Int(new MyBigInt(this.response?.data?.balance)?.toString()));
  }

  protected canFetch(): boolean {
    return this.address.length !== 0;
  }
  protected async fetchResponse(cancelToken: CancelToken): Promise<QueryResponse<Result>> {
    const resApi = await super.fetchResponse(cancelToken);
    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string,
      keyDerivationPath: getKeyDerivationFromAddressType(this.addressType)
    }) as string;

    const scriptHash = getScriptHash(this.address, getCoinNetwork(this.chainId));

    const response = await getBalanceFromUtxos({
      addresses: [{ address: this.address, path, scriptHash }],
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

export class ObservableQueryBitcoinBalance extends ObservableChainQueryMap<Result> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (address: string, addressType: AddressBtcType) => {
      return new ObservableQueryBitcoinBalanceInner(this.kvStore, this.chainId, this.chainGetter, address, addressType);
    });
  }

  getQueryBalance(
    address: string,
    addressType: AddressBtcType = AddressBtcType.Bech32
  ): ObservableQueryBitcoinBalanceInner {
    if (!address) return null;
    return this.get(address, addressType) as ObservableQueryBitcoinBalanceInner;
  }
}
