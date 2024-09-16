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
export class ObservableJsonGetQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    url: string,
    options: Partial<QueryOptions> = {}
  ) {
    super(sharedContext, baseURL, url, options);

    makeObservable(this);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: T }> {
    const result = await simpleFetch(this.baseURL, this.url, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
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
}

export class ObservableJsonGetQueryMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableJsonGetQuery<T, E>> {
  constructor(creater: (key: string) => ObservableJsonGetQuery<T, E>) {
    super(creater);
  }
}
