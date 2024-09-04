import { ObservableQuery } from "../../../common";
import { KVStore } from "@owallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "src/common/query/context";

export type SifchainLiquidityAPYResult = { rate: number };

export class ObservableQuerySifchainLiquidityAPY extends ObservableQuery<SifchainLiquidityAPYResult> {
  protected readonly chainId: string;

  constructor(sharedContext: QuerySharedContext, chainId: string) {
    // const instance = Axios.create({
    //   baseURL: "https://data.sifchain.finance/",
    //   adapter: "fetch",
    // });

    super(
      sharedContext,
      "https://data.sifchain.finance/",
      `beta/validator/stakingRewards`
    );

    this.chainId = chainId;
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.chainId?.startsWith("sifchain");
  }

  @computed
  get liquidityAPY(): number {
    if (this.response) {
      return Number(this.response.data.rate) * 100;
    }

    return 0;
  }
}
