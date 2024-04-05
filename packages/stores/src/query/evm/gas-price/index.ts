import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Block } from "@cosmjs/tendermint-rpc";
import { KVStore } from "@owallet/common";
import { ChainGetter, QueryResponse } from "../../../common";
import { computed, makeObservable } from "mobx";
import { Int } from "@owallet/unit";
import { CancelToken } from "axios";
import Web3 from "web3";

export class ObservableQueryGasPriceInner extends ObservableChainQuery<string> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, ``);

    makeObservable(this);
  }

  /**
   * Return the gas price.
   * If fetching is not completed or failed, return the 0 Int.
   */
  @computed
  get gasPrice(): Int {
    if (!this.response) {
      return new Int("0");
    }

    return new Int(this.response.data);
  }
  protected async fetchResponse(): Promise<QueryResponse<string>> {
    try {
      const web3 = new Web3(this.chainGetter.getChain(this.chainId).rpc);
      const gasPrice = await web3.eth.getGasPrice();
      return {
        status: 1,
        staled: false,
        data: gasPrice,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryGasPriceInner ~ fetchResponse ~ error:",
        error
      );
    }

    // console.log("🚀 ~ ObservableQueryGasPriceInner ~ fetchResponse ~ gasPrice:", gasPrice)
  }
}

export class ObservableQueryGasPrice extends ObservableChainQueryMap<string> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, () => {
      return new ObservableQueryGasPriceInner(
        this.kvStore,
        this.chainId,
        this.chainGetter
      );
    });
  }

  getGasPrice(): ObservableQueryGasPriceInner {
    return this.get(this.chainId) as ObservableQueryGasPriceInner;
  }
}
