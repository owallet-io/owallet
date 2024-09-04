import { ObservableChainQuery } from "../../chain-query";
import { GovParamsDeposit, GovParamsTally, GovParamsVoting } from "./types";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryGovParamTally extends ObservableChainQuery<GovParamsTally> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, `/gov/parameters/tallying`);
  }
}

export class ObservableQueryGovParamVoting extends ObservableChainQuery<GovParamsVoting> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, `/gov/parameters/voting`);
  }
}

export class ObservableQueryGovParamDeposit extends ObservableChainQuery<GovParamsDeposit> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, `/gov/parameters/deposit`);
  }
}
