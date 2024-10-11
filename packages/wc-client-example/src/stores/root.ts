import {
  ChainStore,
  QueriesStore,
  AccountStore,
  CosmosAccount,
  CosmosQueries,
  QueriesWrappedTron,
  AccountWithAll,
} from "@owallet/stores";
import { IndexedDBKVStore } from "@owallet/common";
import { ChainInfo } from "@owallet/types";
import { EmbedChainInfos } from "../config";
import { getWCOWallet } from "../get-wc-owallet";
import { OWallet } from "@owallet/provider";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<QueriesWrappedTron>;
  public readonly accountStore: AccountStore<AccountWithAll>;
  constructor() {
    this.chainStore = new ChainStore<ChainInfo>(EmbedChainInfos);
    this.queriesStore = new QueriesStore(
      // Fix prefix key because there was a problem with storage being corrupted.
      // In the case of storage where the prefix key is "store_queries" or "store_queries_fix", we should not use it because it is already corrupted in some users.

      new IndexedDBKVStore("store_queries"),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      getWCOWallet,
      QueriesWrappedTron
    );

    const chainOpts = this.chainStore.chainInfos.map((chainInfo) => {
      if (chainInfo.chainId.startsWith("native-0x5afe")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 0,
              },
              erc20: {
                gas: 21000,
              },
            },
          },
        };
      }
      // In evm network, default gas for sending
      if (chainInfo.networkType.startsWith("evm")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 21000,
              },
              erc20: {
                gas: 21000,
              },
            },
          },
        };
      }
      // In osmosis, increase the default gas for sending
      if (chainInfo.chainId.startsWith("osmosis-")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 400000,
              },
              withdrawRewards: {
                gas: 400000,
              },
            },
          },
        };
      }

      if (chainInfo.chainId.startsWith("evmos_")) {
        return {
          chainId: chainInfo.chainId,
          msgOpts: {
            send: {
              native: {
                gas: 140000,
              },
            },
            withdrawRewards: {
              gas: 200000,
            },
          },
        };
      }

      return { chainId: chainInfo.chainId };
    });

    this.accountStore = new AccountStore(
      window,
      AccountWithAll,
      this.chainStore,
      this.queriesStore,
      {
        //@ts-ignore
        defaultOpts: {
          // When the unlock request sent from external webpage,
          // it will open the extension popup below the uri "/unlock".
          // But, in this case, if the prefetching option is true, it will redirect
          // the page to the "/unlock" with **interactionInternal=true**
          // because prefetching will request the unlock from the internal.
          // To prevent this problem, just check the first uri is "#/unlcok" and
          // if it is "#/unlock", don't use the prefetching option.
          prefetching: !window.location.href.includes("#/unlock"),
          suggestChain: false,
          autoInit: true,
          getOWallet: getWCOWallet,
        },
        chainOpts,
      }
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
