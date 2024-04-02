import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import {
  ITriggerConstantContract,
  ITriggerConstantContractReq,
  Transaction,
} from "./types";
import { computed, makeObservable } from "mobx";
import { Int } from "@owallet/unit";

export class ObservableQueryTriggerConstantContractInner extends ObservableChainQuery<ITriggerConstantContract> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly data: ITriggerConstantContractReq
  ) {
    console.log(data, chainGetter.getChain(chainId).raw.grpc, "datakaka");
    super(
      kvStore,
      chainId,
      chainGetter,
      `/walletsolidity/triggerconstantcontract`,
      data,
      chainGetter.getChain(chainId).raw.grpc
    );
    makeObservable(this);
  }
  @computed
  get energyEstimate(): Int {
    if (!this.response?.data?.energy_used) {
      return new Int(0);
    }
    return new Int(this.response.data.energy_used);
  }
  @computed
  get transaction(): Transaction {
    if (!this.response?.data?.transaction) {
      return;
    }
    return this.response.data.transaction;
  }
}

export class ObservableQueryTriggerConstantContract extends ObservableChainQueryMap<ITriggerConstantContract> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (data) => {
      const triggerConstantContract = JSON.parse(data);
      return new ObservableQueryTriggerConstantContractInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        triggerConstantContract
      );
    });
  }

  queryTriggerConstantContract(
    data: ITriggerConstantContractReq
  ): ObservableQueryTriggerConstantContractInner {
    return this.get(
      JSON.stringify(data)
    ) as ObservableQueryTriggerConstantContractInner;
  }
}
