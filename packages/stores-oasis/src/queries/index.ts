import {
  QueriesSetBase,
  ChainGetter,
  QuerySharedContext,
} from "@owallet/stores";
import { ObservableQueryOasisAccountBalanceRegistry } from "./balance";
export interface OasisQueries {
  oasis: OasisQueriesImpl;
}

export const OasisQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => OasisQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        oasis: new OasisQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class OasisQueriesImpl {
  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    protected chainId: string,
    protected chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryOasisAccountBalanceRegistry(sharedContext)
    );
  }
}
