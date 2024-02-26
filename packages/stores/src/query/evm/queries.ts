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

  constructor(base: QueriesSetBase, kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    base.queryBalances.addBalanceRegistry(new ObservableQueryEvmBalanceRegistry(kvStore));
  }
}
