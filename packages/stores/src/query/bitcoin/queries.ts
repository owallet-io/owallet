import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@owallet/common";
import { DeepReadonly } from "utility-types";
import { OWallet } from "@owallet/types";
import { ObservableQueryBitcoinBalanceRegistry } from "./bitcoin-balance";
import { ObservableQueryBitcoinBalance } from "./bitcoin-query";
import { QueriesWrappedEvmContract } from "../evm-contract";
import { QuerySharedContext } from "src/common/query/context";

export interface HasBtcQueries {
  bitcoin: BitcoinQueries;
}

export class QueriesWrappedBitcoin
  extends QueriesWrappedEvmContract
  implements HasBtcQueries
{
  public bitcoin: BitcoinQueries;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<OWallet | undefined>
  ) {
    super(sharedContext, chainId, chainGetter, apiGetter);

    this.bitcoin = new BitcoinQueries(
      this,
      sharedContext,
      chainId,
      chainGetter
    );
  }
}

export class BitcoinQueries {
  public readonly queryBitcoinBalance: DeepReadonly<ObservableQueryBitcoinBalance>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryBitcoinBalanceRegistry(sharedContext)
    );

    // queryBitcoinBalance, we need to seperate native balance from cosmos as it is default implementation
    // other implementations will require corresponding templates
    this.queryBitcoinBalance = new ObservableQueryBitcoinBalance(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
