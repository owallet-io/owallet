import { ObservableQuery } from "../common";
import { KVStore, fetchAdapter } from "@owallet/common";
import Axios, { AxiosInstance } from "axios";
import { override } from "mobx";
import { ChainGetter } from "../common";
import { HasMapStore } from "../common";
import { AddressBtcType } from "@owallet/types";

export class ObservableChainQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  // Chain Id should not be changed after creation.
  protected readonly _chainId: string;
  protected readonly _beta: boolean | undefined;
  protected readonly chainGetter: ChainGetter;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    url: string,
    data?: { [key: string]: any },
    protected readonly baseURL?: string
  ) {
    const chainInfo = chainGetter.getChain(chainId);

    const instance = Axios.create({
      ...{
        baseURL: baseURL ? baseURL : chainInfo.rest,
      },
      ...chainInfo.restConfig,
      adapter: fetchAdapter,
    });

    super(kvStore, instance, url, data ? { data } : null);

    this._chainId = chainId;
    this._beta = chainInfo.beta;
    this.chainGetter = chainGetter;
  }

  @override
  protected get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    return Axios.create({
      ...{
        baseURL: this.baseURL ? this.baseURL : chainInfo.rest,
      },
      ...chainInfo.restConfig,
    });
  }

  get chainId(): string {
    return this._chainId;
  }

  get beta(): boolean {
    return this._beta ?? false;
  }
}

export class ObservableChainQueryMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableChainQuery<T, E>> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creater: (key: string) => ObservableChainQuery<T, E>
  ) {
    super(creater);
  }
}
