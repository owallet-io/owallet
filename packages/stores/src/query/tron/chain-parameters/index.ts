import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { ChainParameters } from "./types";
import { computed, makeObservable } from "mobx";
import { Int } from "@owallet/unit";

export class ObservableQueryChainParameterTronInner extends ObservableChainQuery<ChainParameters> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/api/chainparameters`);

    makeObservable(this);
  }

  // @computed
  // get energyLimit(): Int {
  //   if (!this.response?.data?.bandwidth?.energyLimit) {
  //     return new Int(0);
  //   }
  //   return new Int(this.response.data.bandwidth.energyLimit);
  // }
  // @computed
  // get energyRemaining(): Int {
  //   if (!this.response?.data?.bandwidth?.energyRemaining) {
  //     return new Int(0);
  //   }
  //   return new Int(this.response.data.bandwidth.energyRemaining);
  // }
  // @computed
  // get bandwidthLimit(): Int {
  //   if (!this.response?.data?.bandwidth?.netLimit) {
  //     return new Int(0);
  //   }
  //   return new Int(this.response.data.bandwidth.netLimit).add(
  //     new Int(this.response.data.bandwidth.freeNetLimit)
  //   );
  // }
  // @computed
  // get bandwidthRemaining(): Int {
  //   if (!this.response?.data?.bandwidth?.netRemaining) {
  //     return new Int(0);
  //   }
  //   return new Int(this.response.data.bandwidth.netRemaining).add(
  //     new Int(this.response.data.bandwidth.freeNetRemaining)
  //   );
  // }
  // @computed
  // get accountActivated(): boolean {
  //   if (!this.response?.data?.activated) {
  //     return false;
  //   }
  //   return this.response.data.activated;
  // }
}

export class ObservableQueryChainParameterTron extends ObservableChainQueryMap<ChainParameters> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (walletAddress) => {
      return new ObservableQueryChainParameterTronInner(
        this.kvStore,
        this.chainId,
        this.chainGetter
      );
    });
  }

  getQueryChainParameters(
    walletAddress: string
  ): ObservableQueryChainParameterTronInner {
    return this.get(walletAddress) as ObservableQueryChainParameterTronInner;
  }
}
