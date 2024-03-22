import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { KVStore } from "@owallet/common";
import { ChainGetter, QueryResponse } from "../../../common";
import { computed, makeObservable } from "mobx";
import Web3 from "web3";
import ERC20_ABI from "../erc20";
type GasEvmRequest = {
  to: string;
  from: string;
  amount: string;
  contract_address: string;
};
export class ObservableQueryGasEvmContractInner extends ObservableChainQuery<number> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly paramGas: GasEvmRequest
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
    if (!this.response?.data) {
      //TODO: default gas for eth is 21000
      return 21000;
    }
    return this.response.data;
  }
  protected async fetchResponse(): Promise<QueryResponse<number>> {
    try {
      const web3 = new Web3(this.chainGetter.getChain(this.chainId).rest);
      const { from, to, contract_address, amount } = this.paramGas;
      console.log(
        "🚀 ~ ObservableQueryGasEvmContractInner ~ fetchResponse ~ this.paramGas:",
        this.paramGas
      );
      if (!to || !from || !amount || !contract_address) return;
      const tokenInfo = new web3.eth.Contract(
        // @ts-ignore
        ERC20_ABI,
        contract_address
      );
      const estimateGas = await tokenInfo.methods
        .transfer(to, Web3.utils.toWei(amount))
        .estimateGas({
          from: from,
        });
      console.log(
        "🚀 ~ ObservableQueryGasEvmContractInner ~ fetchResponse ~ estimateGas:",
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
        "🚀 ~ ObservableQueryGasEvmContractInner ~ fetchResponse ~ error:",
        error
      );
    }
  }
  protected getCacheKey(): string {
    return `${this.instance.name}-${
      this.instance.defaults.baseURL
    }-gas-evm-contract-native-${this.chainId}-${JSON.stringify(this.paramGas)}`;
  }
}

export class ObservableQueryGasEvmContract extends ObservableChainQueryMap<number> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (data) => {
      return new ObservableQueryGasEvmContractInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        JSON.parse(data)
      );
    });
  }

  getGas(data: GasEvmRequest): ObservableQueryGasEvmContractInner {
    return this.get(JSON.stringify(data)) as ObservableQueryGasEvmContractInner;
  }
}
