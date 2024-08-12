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
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryTriggerConstantContractInner extends ObservableChainQuery<ITriggerConstantContract> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly data: ITriggerConstantContractReq
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/walletsolidity/triggerconstantcontract`
      // data,
      // chainGetter.getChain(chainId).rpc
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
    return this.response?.data?.transaction;
  }
}

export class ObservableQueryTriggerConstantContract extends ObservableChainQueryMap<ITriggerConstantContract> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (data) => {
      const triggerConstantContract = JSON.parse(data);
      return new ObservableQueryTriggerConstantContractInner(
        this.sharedContext,
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
