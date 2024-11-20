import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { QueriesWrappedCosmwasm } from "../cosmwasm";
import { OWallet } from "@owallet/types";
import { ObservableQuerySvmBalanceRegistry } from "./balance";
import { QuerySharedContext } from "src/common/query/context";
import { QueriesWrappedTron } from "../tron";

export interface HasSvmQueries {
  svm: SvmQueries;
}

export class QueriesWrappedSvm
  extends QueriesWrappedTron
  implements HasSvmQueries
{
  public svm: SvmQueries;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(sharedContext, chainId, chainGetter, apiGetter);

    this.svm = new SvmQueries(this, sharedContext, chainId, chainGetter);
  }
}

export class SvmQueries {
  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQuerySvmBalanceRegistry(sharedContext)
    );
  }
}
