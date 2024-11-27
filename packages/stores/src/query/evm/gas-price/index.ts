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
import { QuerySharedContext } from "src/common/query/context";
import {
  ObservableEvmChainJsonRpcQuery,
  ObservableEvmChainJsonRpcQueryMap,
} from "../../../query/evm-contract/evm-chain-json-rpc";

export class ObservableQueryGasPriceInner extends ObservableEvmChainJsonRpcQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, `eth_gasPrice`);

    makeObservable(this);
  }

  /**
   * Return the gas price.
   * If fetching is not completed or failed, return the 0 Int.
   */
  @computed
  get gasPrice(): Int {
    if (!this.response || isNaN(Number(this.response.data))) {
      return new Int("0");
    }
    return new Int(Web3.utils.hexToNumberString(this.response.data));
  }
}

export class ObservableQueryGasPrice extends ObservableEvmChainJsonRpcQueryMap<string> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, () => {
      return new ObservableQueryGasPriceInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter
      );
    });
  }

  getGasPrice(): ObservableQueryGasPriceInner {
    console.log(this.chainId, "this.chainId2");
    return this.get(this.chainId) as ObservableQueryGasPriceInner;
  }
}
