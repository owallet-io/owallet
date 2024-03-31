import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { OWallet } from "@owallet/types";
import { ObservableQueryTronBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import { QueriesWrappedBitcoin } from "../bitcoin";
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
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(kvStore, chainId, chainGetter, apiGetter);

    this.tron = new TronQueries(this, kvStore, chainId, chainGetter);
  }
}

export class TronQueries {
  // public readonly queryGasPrice: DeepReadonly<ObservableQueryGasPrice>;
  // public readonly queryGas: DeepReadonly<ObservableQueryGas>;
  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryTronBalanceRegistry(kvStore)
    );
    // this.queryGasPrice = new ObservableQueryGasPrice(
    //   kvStore,
    //   chainId,
    //   chainGetter
    // );
    // this.queryGas = new ObservableQueryGas(kvStore, chainId, chainGetter);
  }
}
