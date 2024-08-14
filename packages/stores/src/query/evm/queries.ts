import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { QueriesWrappedCosmwasm } from "../cosmwasm";
import { OWallet } from "@owallet/types";
import { ObservableQueryEvmBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import { ObservableQueryGasPrice } from "./gas-price";
import { ObservableQueryGas } from "./gas";
import { ObservableQueryErc20ContractInfo } from "./erc20-contract-info";

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
  public readonly queryErc20ContractInfo: DeepReadonly<ObservableQueryErc20ContractInfo>;

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
    this.queryErc20ContractInfo = new ObservableQueryErc20ContractInfo(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
