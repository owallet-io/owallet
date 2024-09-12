import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { ObservableQueryCw20ContractInfo } from "./cw20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQueryCw20BalanceRegistry } from "./cw20-balance";
import { QueriesWrappedSecret } from "../secret-wasm";
import { OWallet } from "@owallet/types";
import { QuerySharedContext } from "src/common/query/context";

export interface HasCosmwasmQueries {
  cosmwasm: CosmwasmQueries;
}

export class QueriesWrappedCosmwasm
  extends QueriesWrappedSecret
  implements HasCosmwasmQueries
{
  public cosmwasm: CosmwasmQueries;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(sharedContext, chainId, chainGetter, apiGetter);

    this.cosmwasm = new CosmwasmQueries(
      this,
      sharedContext,
      chainId,
      chainGetter
    );
  }
}

export class CosmwasmQueries {
  public readonly querycw20ContractInfo: DeepReadonly<ObservableQueryCw20ContractInfo>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryCw20BalanceRegistry(sharedContext)
    );

    this.querycw20ContractInfo = new ObservableQueryCw20ContractInfo(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
