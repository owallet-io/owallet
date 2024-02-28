import { QueriesSetBase } from '../queries';
import { ChainGetter } from '../../common';
import { KVStore } from '@owallet/common';
import { QueriesWrappedCosmwasm } from '../cosmwasm';
import { OWallet } from '@owallet/types';
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

<<<<<<< HEAD
  constructor(base: QueriesSetBase, kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    base.queryBalances.addBalanceRegistry(new ObservableQueryEvmBalanceRegistry(kvStore));
=======
  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryErc20BalanceRegistry(kvStore)
    );

    // queryEvmBalance, we need to seperate native balance from cosmos as it is default implementation
    // other implementations will require corresponding templates
    this.queryEvmBalance = new ObservableQueryEvmBalance(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryErc20ContractInfo = new ObservableQueryErc20ContractInfo(
      kvStore,
      chainId,
      chainGetter
    );
>>>>>>> ceb3375639cc212dfe62b239f681cb0520a738c4
  }
}
