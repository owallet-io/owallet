import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { ObservableQueryErc20ContractInfo } from "./erc20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQueryErc20BalanceRegistry } from "./erc20-balance";

import { OWallet } from "@owallet/types";
import { QueriesWrappedEvm } from "../evm/queries";
import { ObservableQueryGasEvmContract } from "./gas";

export interface HasEvmContractQueries {
  evmContract: EvmContractQueries;
}

export class QueriesWrappedEvmContract
  extends QueriesWrappedEvm
  implements HasEvmContractQueries
{
  public evmContract: EvmContractQueries;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(kvStore, chainId, chainGetter, apiGetter);

    this.evmContract = new EvmContractQueries(
      this,
      kvStore,
      chainId,
      chainGetter
    );
  }
}

export class EvmContractQueries {
  public readonly queryErc20ContractInfo: DeepReadonly<ObservableQueryErc20ContractInfo>;
  public readonly queryGas: DeepReadonly<ObservableQueryGasEvmContract>;
  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryErc20BalanceRegistry(kvStore)
    );

    this.queryErc20ContractInfo = new ObservableQueryErc20ContractInfo(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryGas = new ObservableQueryGasEvmContract(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
