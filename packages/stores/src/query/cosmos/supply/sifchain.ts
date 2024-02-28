import { ObservableQuery } from "../../../common";
import { KVStore } from "@owallet/common";
import { fetchAdapter } from "@owallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";

export type SifchainLiquidityAPYResult = { rate: number };

export class ObservableQuerySifchainLiquidityAPY extends ObservableQuery<SifchainLiquidityAPYResult> {
  protected readonly chainId: string;

  constructor(kvStore: KVStore, chainId: string) {
    const instance = Axios.create({
      baseURL: "https://data.sifchain.finance/",
      adapter: fetchAdapter,
    });

    super(kvStore, instance, `beta/validator/stakingRewards`);

    this.chainId = chainId;
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.chainId.startsWith("sifchain");
  }

  @computed
  get liquidityAPY(): number {
    if (this.response) {
      return Number(this.response.data.rate) * 100;
    }

    return 0;
  }
}
