import {
  QueriesSetBase,
  ChainGetter,
  QuerySharedContext,
} from "@owallet/stores";
import { ObservableQuerySvmAccountBalanceRegistry } from "./balance";
export interface SvmQueries {
  svm: SvmQueriesImpl;
}

export const SvmQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => SvmQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        svm: new SvmQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class SvmQueriesImpl {
  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    protected chainId: string,
    protected chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQuerySvmAccountBalanceRegistry(sharedContext)
    );
  }
}
