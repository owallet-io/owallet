import {
  QueriesSetBase,
  ChainGetter,
  QuerySharedContext,
} from "@owallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryAccountTron } from "./account";
import { ObservableQueryChainParameterTron } from "./chain-parameters";
export interface TrxQueries {
  tron: TrxQueriesImpl;
}

export const TrxQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => TrxQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        tron: new TrxQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class TrxQueriesImpl {
  public readonly queryAccount: DeepReadonly<ObservableQueryAccountTron>;
  public readonly queryChainParameter: DeepReadonly<ObservableQueryChainParameterTron>;
  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    protected chainId: string,
    protected chainGetter: ChainGetter
  ) {
    // base.queryBalances.addBalanceRegistry(new ObservableQueryTrxAccountBalanceRegistry(sharedContext));
    this.queryAccount = new ObservableQueryAccountTron(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryChainParameter = new ObservableQueryChainParameterTron(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
