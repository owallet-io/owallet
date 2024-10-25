import { BtcAccountBase, BtcAccountStore } from "@owallet/stores-btc";
import { EthereumAccountStore } from "@owallet/stores-eth";
import { TrxAccountBase, TrxAccountStore } from "@owallet/stores-trx";
import { OasisAccountBase, OasisAccountStore } from "@owallet/stores-oasis";
import {
  AccountSetBase,
  AccountStore,
  ChainGetter,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
} from "@owallet/stores";

export class AllAccountStore {
  private accountGetters: {
    [key: string]: (
      chainId: string
    ) => BtcAccountBase | OasisAccountBase | TrxAccountBase | AccountSetBase;
  };

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly oasisAccountStore: OasisAccountStore,
    protected readonly baseAccountStore: AccountStore<
      [CosmosAccount, CosmwasmAccount, SecretAccount]
    >,
    protected readonly tronAccountStore: TrxAccountStore,
    protected readonly ethereumAccountStore: EthereumAccountStore,
    protected readonly btcAccountStore: BtcAccountStore
  ) {
    this.accountGetters = {
      oasis: (chainId) =>
        this.oasisAccountStore.getAccount(chainId) as OasisAccountBase,
      btc: (chainId) =>
        this.btcAccountStore.getAccount(chainId) as BtcAccountBase,
      tron: (chainId) =>
        this.tronAccountStore.getAccount(chainId) as TrxAccountBase,
      // Add more if needed
    };
  }
  getAccount(
    chainId: string
  ): BtcAccountBase | OasisAccountBase | TrxAccountBase | AccountSetBase {
    const chainInfo = this.chainGetter.getChain(chainId);
    // Iterate through the features to find the appropriate account getter
    for (const feature of chainInfo.features) {
      if (this.accountGetters[feature]) {
        return this.accountGetters[feature](chainId);
      }
    }
    // Default to base account store if no specific feature is matched
    return this.baseAccountStore.getAccount(chainId) as AccountSetBase;
  }
}
