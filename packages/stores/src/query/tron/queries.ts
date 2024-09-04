import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { OWallet } from "@owallet/types";
import { ObservableQueryTronBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import { QueriesWrappedBitcoin } from "../bitcoin";
import { ObservableQueryAccountTron } from "./account";
import { ObservableQueryChainParameterTron } from "./chain-parameters";
import { ObservableQueryTriggerConstantContract } from "./trigger-constant-contract";
import { QuerySharedContext } from "src/common/query/context";
// import { ObservableQueryGasPrice } from "./gas-price";
// import { ObservableQueryGas } from "./gas";

export interface HasTronQueries {
  tron: TronQueries;
}

export class QueriesWrappedTron
  extends QueriesWrappedBitcoin
  implements HasTronQueries
{
  public tron: TronQueries;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(sharedContext, chainId, chainGetter, apiGetter);

    this.tron = new TronQueries(this, sharedContext, chainId, chainGetter);
  }
}

export class TronQueries {
  public readonly queryAccount: DeepReadonly<ObservableQueryAccountTron>;
  public readonly queryChainParameter: DeepReadonly<ObservableQueryChainParameterTron>;
  public readonly queryTriggerConstantContract: DeepReadonly<ObservableQueryTriggerConstantContract>;
  // public readonly queryGasPrice: DeepReadonly<ObservableQueryGasPrice>;
  // public readonly queryGas: DeepReadonly<ObservableQueryGas>;
  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryTronBalanceRegistry(sharedContext)
    );
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
    this.queryTriggerConstantContract =
      new ObservableQueryTriggerConstantContract(
        sharedContext,
        chainId,
        chainGetter
      );
    // this.queryGas = new ObservableQueryGas(sharedContext, chainId, chainGetter);
  }
}
