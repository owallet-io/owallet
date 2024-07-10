import { Result } from "./types";
import {
  KVStore,
  MyBigInt,
  getKeyDerivationFromAddressType,
} from "@owallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { ChainGetter, QueryResponse } from "../../common";
import { computed } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import { CancelToken } from "axios";
import {
  getAddressTypeByAddress,
  getBaseDerivationPath,
} from "@owallet/bitcoin";
import { processBalanceFromUtxos } from "@owallet/bitcoin";
import { AddressBtcType } from "@owallet/types";
export class ObservableQueryBitcoinBalanceInner extends ObservableChainQuery<Result> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly address: string
  ) {
    super(kvStore, chainId, chainGetter, `/address/${address}/utxo`);
  }

  @computed
  get balance() {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!this.response?.data || !this.response?.data?.balance) {
      return new CoinPretty(
        chainInfo.stakeCurrency,
        new Int(new MyBigInt(0)?.toString())
      );
    }

    return new CoinPretty(
      chainInfo.stakeCurrency,
      new Int(new MyBigInt(this.response?.data?.balance)?.toString())
    );
  }

  protected canFetch(): boolean {
    return this.address?.length !== 0;
  }
  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<Result>> {
    const resApi = await super.fetchResponse(cancelToken);
    const addressType = getAddressTypeByAddress(this.address) as AddressBtcType;
    const keyDerivation = getKeyDerivationFromAddressType(addressType);
    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string,
      keyDerivationPath: keyDerivation,
    }) as string;
    const btcResult = processBalanceFromUtxos({
      address: this.address,
      utxos: resApi.data,
      path,
    });
    if (!btcResult) {
      throw new Error("Failed to get the response from bitcoin");
    }
    return {
      data: btcResult,
      status: 1,
      staled: false,
      timestamp: Date.now(),
    };
  }
}

export class ObservableQueryBitcoinBalance extends ObservableChainQueryMap<Result> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
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
  }
}
