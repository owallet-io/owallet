import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { QueriesWrappedCosmwasm } from "../cosmwasm";
import { OWallet } from "@owallet/types";
import { ObservableQueryEvmBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import { ObservableQueryGasPrice } from "./gas-price";
import { ObservableQueryGas } from "./gas";

export interface HasEvmQueries {
  evm: EvmQueries;
}

export class QueriesWrappedEvm
  extends QueriesWrappedCosmwasm
  implements HasEvmQueries
{
  public evm: EvmQueries;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(kvStore, chainId, chainGetter, apiGetter);

    this.evm = new EvmQueries(this, kvStore, chainId, chainGetter);
  }
}

export class EvmQueries {
  public readonly queryGasPrice: DeepReadonly<ObservableQueryGasPrice>;
  public readonly queryGas: DeepReadonly<ObservableQueryGas>;
  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEvmBalanceRegistry(kvStore)
    );
    this.queryGasPrice = new ObservableQueryGasPrice(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryGas = new ObservableQueryGas(kvStore, chainId, chainGetter);
  }
}
