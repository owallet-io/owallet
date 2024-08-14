import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { AuthAccountTron } from "./types";
import { computed, makeObservable } from "mobx";
import { BaseAccount } from "@owallet/cosmos";
import { Int } from "@owallet/unit";

export class ObservableQueryAccountTronInner extends ObservableChainQuery<AuthAccountTron> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly walletAddress: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/api/accountv2?address=${walletAddress}`
    );

    makeObservable(this);
  }

  @computed
  get energyLimit(): Int {
    if (!this.response?.data?.bandwidth?.energyLimit) {
      return new Int(0);
    }
    return new Int(this.response.data.bandwidth.energyLimit);
  }

  @computed
  get energyRemaining(): Int {
    if (!this.response?.data?.bandwidth?.energyRemaining) {
      return new Int(0);
    }
    return new Int(this.response.data.bandwidth.energyRemaining);
  }

  @computed
  get bandwidthLimit(): Int {
    if (!this.response?.data?.bandwidth) {
      return new Int(0);
    }
    return new Int(this.response.data.bandwidth.netLimit).add(
      new Int(this.response.data.bandwidth.freeNetLimit)
    );
  }

  @computed
  get bandwidthRemaining(): Int {
    console.log(
      this.response?.data?.bandwidth,
      "this.response?.data?.bandwidth"
    );
    if (!this.response?.data?.bandwidth) {
      return new Int(0);
    }
    return new Int(this.response.data.bandwidth.netRemaining).add(
      new Int(this.response.data.bandwidth.freeNetRemaining)
    );
  }

  @computed
  get bandwidthNetRemaining(): Int {
    if (!this.response?.data?.bandwidth) {
      return new Int(0);
    }
    return new Int(this.response.data.bandwidth.netRemaining);
  }

  @computed
  get accountActivated(): boolean {
    console.log(this.response?.data, "this.response?.data");
    if (!this.response?.data?.activated) {
      return false;
    }
    return this.response.data.activated;
  }
}

export class ObservableQueryAccountTron extends ObservableChainQueryMap<AuthAccountTron> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (walletAddress) => {
      return new ObservableQueryAccountTronInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        walletAddress
      );
    });
  }

  getQueryWalletAddress(
    walletAddress: string
  ): ObservableQueryAccountTronInner {
    return this.get(walletAddress) as ObservableQueryAccountTronInner;
  }
}
