import {
  ChainStore,
  QueriesStore,
  AccountStore,
  QueriesWithCosmos,
  AccountWithCosmos
} from '@owallet-wallet/stores';
import { IndexedDBKVStore } from '@owallet-wallet/common';
import { ChainInfo } from '@owallet-wallet/types';
import { getWCOWallet } from '../get-wc-owallet';
import { EmbedChainInfos } from '../config';

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<QueriesWithCosmos>;
  public readonly accountStore: AccountStore<AccountWithCosmos>;

  constructor() {
    this.chainStore = new ChainStore<ChainInfo>(EmbedChainInfos);

    this.queriesStore = new QueriesStore(
      new IndexedDBKVStore('store_queries'),
      this.chainStore,
      getWCOWallet,
      QueriesWithCosmos
    );

    this.accountStore = new AccountStore(
      window,
      AccountWithCosmos,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          prefetching: false,
          suggestChain: false,
          autoInit: true,
          getOWallet: getWCOWallet
        }
      }
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
