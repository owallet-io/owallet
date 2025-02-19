import { computed, makeObservable } from "mobx";
import {
  ChainGetter,
  ObservableChainQuery,
  QuerySharedContext,
} from "@owallet/stores";

import { IFeeHistory } from "./types";

export class ObservableQueryBtcFeeHistory extends ObservableChainQuery<IFeeHistory> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "/fee-estimates");

    makeObservable(this);
  }

  get feeHistory(): IFeeHistory | undefined {
    return this.response?.data;
  }
}
