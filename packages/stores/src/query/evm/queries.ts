import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { QueriesWrappedCosmwasm } from "../cosmwasm";
import { OWallet } from "@owallet/types";
import { ObservableQueryEvmBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import { ObservableQueryGasPrice } from "./gas-price";
import { ObservableQueryGas } from "./gas";
import { QuerySharedContext } from "src/common/query/context";

export interface HasEvmQueries {
  evm: EvmQueries;
}

export class QueriesWrappedEvm
  extends QueriesWrappedCosmwasm
  implements HasEvmQueries
{
  public evm: EvmQueries;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(sharedContext, chainId, chainGetter, apiGetter);

    this.evm = new EvmQueries(this, sharedContext, chainId, chainGetter);
  }
}

export class EvmQueries {
  public readonly queryGasPrice: DeepReadonly<ObservableQueryGasPrice>;
  public readonly queryGas: DeepReadonly<ObservableQueryGas>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEvmBalanceRegistry(sharedContext)
    );
    this.queryGasPrice = new ObservableQueryGasPrice(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryGas = new ObservableQueryGas(sharedContext, chainId, chainGetter);
  }
}
