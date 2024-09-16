import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainIdEnum, KVStore } from "@owallet/common";
import { ChainGetter, QueryResponse } from "../../../common";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import Web3 from "web3";
import { QuerySharedContext } from "src/common/query/context";
import {
  ObservableEvmChainJsonRpcQuery,
  ObservableEvmChainJsonRpcQueryMap,
} from "../../../query/evm-contract/evm-chain-json-rpc";

type GasRequest = {
  to: string;
  from: string;
};
export class ObservableQueryGasInner extends ObservableEvmChainJsonRpcQuery<number> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly paramGas: GasRequest
  ) {
    super(sharedContext, chainId, chainGetter, `eth_estimateGas`, [
      {
        to: paramGas.to,
        from: paramGas.from,
      },
    ]);
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
    return Web3.utils.hexToNumber(this.response.data);
  }
}

export class ObservableQueryGas extends ObservableEvmChainJsonRpcQueryMap<number> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (data) => {
      return new ObservableQueryGasInner(
        this.sharedContext,
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
