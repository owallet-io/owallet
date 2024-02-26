import { QueriesSetBase } from '../queries';
import { ChainGetter } from '../../common';
import { KVStore } from '@owallet/common';
import { ObservableQueryErc20ContractInfo } from './erc20-contract-info';
import { DeepReadonly } from 'utility-types';
import { ObservableQueryErc20BalanceRegistry } from './erc20-balance';
import { QueriesWrappedCosmwasm } from '../cosmwasm';
import { OWallet } from '@owallet/types';
import { ObservableQueryEvmBalance } from './evm-balance';
import { ObservableQueryEvmBalanceRegistry } from './balance';

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
  public readonly queryErc20ContractInfo: DeepReadonly<ObservableQueryErc20ContractInfo>;
  public readonly queryEvmBalance: DeepReadonly<ObservableQueryEvmBalance>;

  constructor(base: QueriesSetBase, kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    console.log('add balance');
    base.queryBalances.addBalanceRegistry(new ObservableQueryEvmBalanceRegistry(kvStore));

    // queryEvmBalance, we need to seperate native balance from cosmos as it is default implementation
    // other implementations will require corresponding templates
    this.queryEvmBalance = new ObservableQueryEvmBalance(kvStore, chainId, chainGetter);

    this.queryErc20ContractInfo = new ObservableQueryErc20ContractInfo(kvStore, chainId, chainGetter);
  }
}
