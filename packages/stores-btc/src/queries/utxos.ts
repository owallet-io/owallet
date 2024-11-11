import { computed, makeObservable } from "mobx";
import { BtcBalances, Utxos, UtxosWithNonWitness } from "./types";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QuerySharedContext,
} from "@owallet/stores";

export class ObservableQueryBtcUtxosInner extends ObservableChainQuery<
  Utxos[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly btcAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, `/address/${btcAddress}/utxo`);

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If btc address is empty, it will always fail, so don't need to fetch it.
    return this.btcAddress.length > 0;
  }

  @computed
  get utxos(): Utxos[] {
    return this.response?.data || [];
  }
}

export class ObservableQueryBtcUtxos extends ObservableChainQueryMap<Utxos[]> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (btcAddress) => {
      return new ObservableQueryBtcUtxosInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        btcAddress
      );
    });
  }

  getQueryBtcAddress(btcAddress: string): ObservableQueryBtcUtxosInner {
    return this.get(btcAddress) as ObservableQueryBtcUtxosInner;
  }
}
