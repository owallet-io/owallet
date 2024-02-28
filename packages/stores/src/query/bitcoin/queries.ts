import { QueriesWithCosmosAndSecretAndCosmwasmAndEvm } from "./../evm/queries";
import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { DeepReadonly } from "utility-types";
import { OWallet } from "@owallet/types";
import { ObservableQueryBitcoinBalanceRegistry } from "./bitcoin-balance";
import { ObservableQueryBitcoinBalance } from "./bitcoin-query";

export interface HasBtcQueries {
  bitcoin: BitcoinQueries;
}

export class QueriesWithCosmosAndSecretAndCosmwasmAndEvmAndBitcoin
  extends QueriesWithCosmosAndSecretAndCosmwasmAndEvm
  implements HasBtcQueries
{
  public bitcoin: BitcoinQueries;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(kvStore, chainId, chainGetter, apiGetter);

    this.bitcoin = new BitcoinQueries(this, kvStore, chainId, chainGetter);
  }
}

export class BitcoinQueries {
  public readonly queryBitcoinBalance: DeepReadonly<ObservableQueryBitcoinBalance>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryBitcoinBalanceRegistry(kvStore)
    );

    // queryBitcoinBalance, we need to seperate native balance from cosmos as it is default implementation
    // other implementations will require corresponding templates
    this.queryBitcoinBalance = new ObservableQueryBitcoinBalance(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
