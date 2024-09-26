import { ObservableQuery, QueryOptions } from "./query";
import { QuerySharedContext } from "./context";
import { action, makeObservable, observable } from "mobx";
import { Hash } from "@owallet/crypto";
import { Buffer } from "buffer/";
import { HasMapStore } from "../map";
import { simpleFetch } from "@owallet/simple-fetch";

/**
 * Experimental implementation for json rpc.
 */
export class ObservableJsonPostQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  @observable.ref
  protected _data?: Object;

  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    url: string,
    data?: Object,
    options: Partial<QueryOptions> = {}
  ) {
    super(sharedContext, baseURL, url, options);

    this._data = data;

    makeObservable(this);
  }

  get data(): Object {
    return this.data;
  }

  @action
  protected setData(data?: Object) {
    this._data = data;
    this.fetch();
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: T }> {
    const result = await simpleFetch(this.baseURL, this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(this.data),
      signal: abortController.signal,
    });

    if (!result.data) {
      throw new Error("Unknown error");
    }

    return {
      headers: result.headers,
      data: result.data as T,
    };
  }

  protected override getCacheKey(): string {
    const paramsHash = Buffer.from(
      Hash.sha256(Buffer.from(JSON.stringify(this.data))).slice(0, 8)
    ).toString("hex");

    return `${super.getCacheKey()}-${this.url}-${paramsHash}`;
  }
}

export class ObservableJsonPostQueryMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableJsonPostQuery<T, E>> {
  constructor(creater: (key: string) => ObservableJsonPostQuery<T, E>) {
    super(creater);
  }
}
