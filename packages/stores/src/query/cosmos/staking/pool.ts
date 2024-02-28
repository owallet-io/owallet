import { ObservableChainQuery } from "../../chain-query";
import { StakingPool } from "./types";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";

export class ObservableQueryStakingPool extends ObservableChainQuery<StakingPool> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/cosmos/staking/v1beta1/pool");
  }
}
