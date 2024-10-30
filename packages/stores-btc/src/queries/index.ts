import {
  QueriesSetBase,
  ChainGetter,
  QuerySharedContext,
} from "@owallet/stores";
import { ObservableQueryBtcAccountBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import { ObservableQueryBtcFeeHistory } from "./fee-history";
import { ObservableQueryBtcUtxos } from "./utxos";
export interface BtcQueries {
  bitcoin: BtcQueriesImpl;
}

export const BtcQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => BtcQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        bitcoin: new BtcQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class BtcQueriesImpl {
  public readonly queryBtcUtxos: DeepReadonly<ObservableQueryBtcUtxos>;
  public readonly queryBtcFeeHistory: DeepReadonly<ObservableQueryBtcFeeHistory>;
  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    protected chainId: string,
    protected chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryBtcAccountBalanceRegistry(sharedContext)
    );
    this.queryBtcUtxos = new ObservableQueryBtcUtxos(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryBtcFeeHistory = new ObservableQueryBtcFeeHistory(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
