import { ethers } from 'ethers';

import { QueriesSetBase } from '../queries';
import { ChainGetter } from '../../common';
import { KVStore } from '@owallet/common';
import { ObservableQueryErc20ContractInfo } from './erc20-contract-info';
import { DeepReadonly } from 'utility-types';
import { ObservableQueryErc20BalanceRegistry } from './erc20-balance';
import { QueriesWithCosmosAndSecretAndCosmwasm } from '../cosmwasm';
import { OWallet } from '@owallet/types';
import { ObservableQueryEvmBalanceRegistry } from './balance';

export interface HasEvmQueries {
  evm: EvmQueries;
}

export class QueriesWithCosmosAndSecretAndCosmwasmAndEvm
  extends QueriesWithCosmosAndSecretAndCosmwasm
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
  public readonly queryerc20ContractInfo: DeepReadonly<ObservableQueryErc20ContractInfo>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEvmBalanceRegistry(kvStore)
    );

    base.queryBalances.addBalanceRegistry(
      new ObservableQueryErc20BalanceRegistry(kvStore)
    );

    this.queryerc20ContractInfo = new ObservableQueryErc20ContractInfo(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
