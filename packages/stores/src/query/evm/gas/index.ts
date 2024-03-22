import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainIdEnum, KVStore } from "@owallet/common";
import { ChainGetter, QueryResponse } from "../../../common";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import Web3 from "web3";

type GasRequest = {
  to: string;
  from: string;
};
export class ObservableQueryGasInner extends ObservableChainQuery<number> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly paramGas: GasRequest
  ) {
    super(kvStore, chainId, chainGetter, ``);
    makeObservable(this);
  }

  /**
   * Return the gas price.
   * If fetching is not completed or failed, return the 0 Int.
   */
  @computed
  get gas(): number {
    if (this.chainId === ChainIdEnum.Oasis) {
      return 0;
    }
    if (!this.response?.data) {
      //TODO: default gas for eth is 21000
      return 21000;
    }
    return this.response.data;
  }
  protected async fetchResponse(): Promise<QueryResponse<number>> {
    try {
      const web3 = new Web3(this.chainGetter.getChain(this.chainId).rest);

      if (!this.paramGas.to || !this.paramGas.from) return;
      const estimateGas = await web3.eth.estimateGas({
        to: this.paramGas.to,
        from: this.paramGas.from,
      });
      console.log(
        "🚀 ~ ObservableQueryGasInner ~ fetchResponse ~ estimateGas:",
        estimateGas
      );

      return {
        status: 1,
        staled: false,
        data: estimateGas,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryGasInner ~ fetchResponse ~ error:",
        error
      );
      throw Error(error);
    }
  }
  protected getCacheKey(): string {
    return `${this.instance.name}-${
      this.instance.defaults.baseURL
    }-gas-evm-native-${this.chainId}-${JSON.stringify(this.paramGas)}`;
  }
}

export class ObservableQueryGas extends ObservableChainQueryMap<number> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (data) => {
      return new ObservableQueryGasInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        JSON.parse(data)
      );
    });
  }

  getGas(data: GasRequest): ObservableQueryGasInner {
    return this.get(JSON.stringify(data)) as ObservableQueryGasInner;
  }
}
