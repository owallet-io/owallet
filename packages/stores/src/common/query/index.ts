import {
  action,
  autorun,
  computed,
  flow,
  makeObservable,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
  reaction,
} from "mobx";

import Axios, { AxiosInstance, CancelToken, CancelTokenSource } from "axios";
import { KVStore, toGenerator } from "@owallet/common";
import { DeepReadonly } from "utility-types";
import { HasMapStore } from "../map";
import EventEmitter from "eventemitter3";
import { QuerySharedContext } from "./context";

export type QueryOptions = {
  // millisec
  cacheMaxAge: number;
  // millisec
  fetchingInterval: number;

  data: { [key: string]: any };
};

export const defaultOptions: QueryOptions = {
  cacheMaxAge: 0,
  fetchingInterval: 0,
  data: null,
};

export type QueryError<E> = {
  status: number;
  statusText: string;
  message: string;
  data?: E;
};

export type QueryResponse<T> = {
  status: number;
  data: T;
  staled: boolean;
  timestamp: number;
  info?: TokenInfo;
};

type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: any;
};
class FlowCancelerError extends Error {
  constructor(m?: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FlowCancelerError.prototype);
  }
}
/**
 * Base of the observable query classes.
 * This recommends to use the Axios to query the response.
 */
export abstract class ObservableQuery<T = unknown, E = unknown> {
  protected static eventListener: EventEmitter = new EventEmitter();

  public static refreshAllObserved() {
    ObservableQuery.eventListener.emit("refresh");
  }

  public static refreshAllObservedIfError() {
    ObservableQuery.eventListener.emit("refresh", {
      ifError: true,
    });
  }

  @observable
  protected _url: string = "";

  @observable
  protected _data: { [key: string]: any } = null;

  @observable
  protected readonly sharedContext: QuerySharedContext;
  protected static suspectedResponseDatasWithInvalidValue: string[] = [
    "The network connection was lost.",
    "The request timed out.",
  ];

  protected options: QueryOptions;

  // Just use the oberable ref because the response is immutable and not directly adjusted.
  @observable.ref
  private _response?: Readonly<QueryResponse<T>> = undefined;

  @observable
  protected _isFetching: boolean = false;

  @observable.ref
  private _error?: Readonly<QueryError<E>> = undefined;

  @observable
  private _isStarted: boolean = false;

  private cancelToken?: CancelTokenSource;

  private observedCount: number = 0;

  // intervalId can be number or NodeJS's Timout object according to the environment.
  // If environment is browser, intervalId should be number.
  // If environment is NodeJS, intervalId should be NodeJS.Timeout.
  private intervalId: number | NodeJS.Timeout | undefined = undefined;

  @observable.ref
  protected _instance: AxiosInstance;

  protected constructor(
    protected readonly kvStore: KVStore,
    instance: AxiosInstance,
    url: string,
    options: Partial<QueryOptions> = {}
  ) {
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this._instance = instance;

    makeObservable(this);
    this.sharedContext = new QuerySharedContext(this.kvStore, {
      responseDebounceMs: 300,
    });
    onBecomeObserved(this, "_response", this.becomeObserved);
    onBecomeObserved(this, "_isFetching", this.becomeObserved);
    onBecomeObserved(this, "_error", this.becomeObserved);

    onBecomeUnobserved(this, "_response", this.becomeUnobserved);
    onBecomeUnobserved(this, "_isFetching", this.becomeUnobserved);
    onBecomeUnobserved(this, "_error", this.becomeUnobserved);
    this.setUrl(url, options?.data);
  }

  private becomeObserved = (): void => {
    if (this.observedCount === 0) {
      this.start();
    }
    this.observedCount++;
  };

  private becomeUnobserved = (): void => {
    this.observedCount--;
    if (this.observedCount === 0) {
      this.stop();
    }
  };

  public get isObserved(): boolean {
    return this.observedCount > 0;
  }

  @action
  private start() {
    if (!this._isStarted) {
      this._isStarted = true;
      this.onStart();
    }
  }

  @action
  private stop() {
    if (this._isStarted) {
      this.onStop();
      this._isStarted = false;
    }
  }

  public get isStarted(): boolean {
    return this._isStarted;
  }

  private readonly intervalFetch = () => {
    if (!this.isFetching) {
      this.fetch();
    }
  };

  protected onStart() {
    this.fetch();

    if (this.options.fetchingInterval > 0) {
      this.intervalId = setInterval(
        this.intervalFetch,
        this.options.fetchingInterval
      );
    }
    ObservableQuery.eventListener.addListener("refresh", this.refreshHandler);
  }

  protected onStop() {
    this.cancel();

    if (this.intervalId != null) {
      clearInterval(this.intervalId as NodeJS.Timeout);
    }
    ObservableQuery.eventListener.addListener("refresh", this.refreshHandler);
  }

  protected canFetch(): boolean {
    return true;
  }

  get isFetching(): boolean {
    return this._isFetching;
  }

  // Return the instance.
  // You can memorize this by using @computed if you need to override this.
  // NOTE: If this getter returns the different instance with previous instance.
  // It will be used in the latter fetching.
  @computed
  protected get instance(): DeepReadonly<AxiosInstance> {
    return this._instance;
  }

  @flow
  *fetch(): Generator<unknown, any, any> {
    // If not started, do nothing.
    if (!this.isStarted) {
      return;
    }

    if (!this.canFetch()) {
      return;
    }

    // If response is fetching, cancel the previous query.
    if (this.isFetching) {
      this.cancel();
    }

    this._isFetching = true;

    // If there is no existing response, try to load saved reponse.
    if (!this._response) {
      // const staledResponse = yield* toGenerator(this.loadStaledResponse());
      // if (staledResponse) {
      //   if (staledResponse.timestamp > Date.now() - this.options.cacheMaxAge) {
      //     this.setResponse(staledResponse);
      //   }
      // }
      this._isFetching = true;

      let satisfyCache = false;

      // When first load, try to load the last response from disk.
      // Use the last saved response if the last saved response exists and the current response hasn't been set yet.
      const promise = this.loadStabledResponse().then((value) => {
        satisfyCache = value;
      });
      if (this.options.cacheMaxAge <= 0) {
        // To improve performance, don't wait the loading to proceed if cache age not set.
      } else {
        yield promise;
        if (satisfyCache) {
          this._isFetching = false;
          return;
        }
      }
    } else {
      // // Make the existing response as staled.
      // this.setResponse({
      //   ...this._response,
      //   staled: true
      // });
      if (this.options.cacheMaxAge > 0) {
        if (this._response.timestamp > Date.now() - this.options.cacheMaxAge) {
          this._isFetching = false;
          return;
        }
      }

      this._isFetching = true;

      // Make the existing response as staled.
      this.setResponse({
        ...this._response,
        staled: true,
      });
    }

    this.cancelToken = Axios.CancelToken.source();

    try {
      let response = yield* toGenerator(
        this.fetchResponse(this.cancelToken.token)
      );
      if (
        response.data &&
        typeof response.data === "string" &&
        (response.data?.startsWith("stream was reset:") ||
          ObservableQuery.suspectedResponseDatasWithInvalidValue.includes(
            response.data
          ))
      ) {
        // In some devices, it is a http ok code, but a strange response is sometimes returned.
        // It's not that they can't query at all, it seems that they get weird response from time to time.
        // These causes are not clear.
        // To solve this problem, if this problem occurs, try the query again, and if that fails, an error is raised.
        if (this.cancelToken && this.cancelToken.token.reason) {
          // In this case, it is assumed that it is caused by cancel() and do nothing.
          return;
        }

        // Try to query again.
        response = yield* toGenerator(
          this.fetchResponse(this.cancelToken.token)
        );

        if (
          response.data &&
          typeof response.data === "string" &&
          (response.data.startsWith("stream was reset:") ||
            ObservableQuery.suspectedResponseDatasWithInvalidValue.includes(
              response.data
            ))
        ) {
          throw new Error(response.data);
        }
      }
      this.setResponse(response);
      // Clear the error if fetching succeeds.
      // this.setError(undefined);
      yield this.saveResponse(response);
      yield this.sharedContext.handleResponse(() => {
        this.setResponse(response);
        // Clear the error if fetching succeeds.
        this.setError(undefined);

        // Do not use finally block.
        // Because finally block is called after the next yield and it makes re-render.
        this._isFetching = false;
      });
    } catch (e: any) {
      // If canceld, do nothing.
      if (Axios.isCancel(e)) {
        return;
      }
      let fetchingProceedNext = false;
      if (e instanceof FlowCancelerError) {
        // When cancel for the next fetching, it behaves differently from other explicit cancels because fetching continues.
        if (e.message === "__fetching__proceed__next__") {
          fetchingProceedNext = true;
        }
        return;
      }
      // If error is from Axios, and get response.
      if (e.response) {
        const error: QueryError<E> = {
          status: e.response.status,
          statusText: e.response.statusText,
          message: e.response.statusText,
          data: e.response.data,
        };

        // this.setError(error);

        yield this.sharedContext.handleResponse(() => {
          this.setError(error);

          // Do not use finally block.
          // Because finally block is called after the next yield and it makes re-render.
          if (!fetchingProceedNext) {
            this._isFetching = false;
          }
        });
      } else if (e.request) {
        // if can't get the response.
        const error: QueryError<E> = {
          status: 0,
          statusText: "Failed to get response",
          message: "Failed to get response",
        };
        yield this.sharedContext.handleResponse(() => {
          this.setError(error);

          // Do not use finally block.
          // Because finally block is called after the next yield and it makes re-render.
          if (!fetchingProceedNext) {
            this._isFetching = false;
          }
        });
        // this.setError(error);
      } else {
        const error: QueryError<E> = {
          status: 0,
          statusText: e.message,
          message: e.message,
          data: e,
        };

        yield this.sharedContext.handleResponse(() => {
          this.setError(error);

          // Do not use finally block.
          // Because finally block is called after the next yield and it makes re-render.
          if (!fetchingProceedNext) {
            this._isFetching = false;
          }
        });
      }
    } finally {
      this._isFetching = false;
      this.cancelToken = undefined;
    }
  }

  public get response() {
    return this._response;
  }

  public get error() {
    return this._error;
  }

  @action
  protected setResponse(response: Readonly<QueryResponse<T>>) {
    this._response = response;
  }

  @action
  protected setError(error: QueryError<E> | undefined) {
    this._error = error;
  }

  public cancel(): void {
    if (this.cancelToken) {
      this.cancelToken.cancel();
    }
  }

  /**
   * Wait the response and return the response without considering it is staled or fresh.
   */
  waitResponse(): Promise<Readonly<QueryResponse<T>> | undefined> {
    if (!this.isFetching) {
      return Promise.resolve(this.response);
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (!this.isFetching) {
          resolve(this.response);
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  /**
   * Wait the response and return the response until it is fetched.
   */
  waitFreshResponse(): Promise<Readonly<QueryResponse<T>> | undefined> {
    let onceCoerce = false;
    // Make sure that the fetching is tracked to force to be fetched.
    const reactionDisposer = reaction(
      () => this.isFetching,
      () => {
        if (!onceCoerce) {
          this.fetch();
          onceCoerce = true;
        }
      },
      {
        fireImmediately: true,
      }
    );

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (!this.isFetching) {
          resolve(this.response);
          if (reactionDisposer) {
            reactionDisposer();
          }
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  protected readonly refreshHandler = (data: any) => {
    const ifError = data?.ifError;
    if (ifError) {
      if (this.error) {
        this.fetch();
      }
    } else {
      this.fetch();
    }
  };

  get url(): string {
    return this._url;
  }

  @action
  protected setUrl(url: string, data: { [key: string]: any } = null) {
    let reFetch = false;
    if (this._url !== url) {
      this._url = url;
      reFetch = true;
    }
    if (this._data !== data) {
      this._data = data;
      reFetch = true;
    }
    if (reFetch) {
      this.fetch();
    }
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<T>> {
    // may be post method in case of ethereum
    const result = this.options.data
      ? await this.instance.post<T>(this.url, this.options.data, {
          cancelToken,
        })
      : await this.instance.get<T>(this.url, {
          cancelToken,
        });

    return {
      data: result.data,
      status: result.status,
      staled: false,
      timestamp: Date.now(),
    };
  }

  protected getCacheKey(): string {
    return `${this.instance.name}-${
      this.instance.defaults.baseURL
    }${this.instance.getUri({
      url: this.url,
      params: this.options.data,
    })}`;
  }

  protected async saveResponse(
    response: Readonly<QueryResponse<T>>
  ): Promise<void> {
    const key = this.getCacheKey();

    // await this.kvStore.set(key, response);
    // const key = this.getCacheKey();
    await this.sharedContext.saveResponse(key, response);
  }

  protected async loadStabledResponse(): Promise<boolean> {
    // const key = this.getCacheKey();
    // const response = await this.kvStore.get<QueryResponse<T>>(key);
    // if (response) {
    //   return {
    //     ...response,
    //     staled: true
    //   };
    // }
    // return undefined;
    return new Promise<boolean>((resolve) => {
      this.sharedContext.loadStore<QueryResponse<T>>(
        this.getCacheKey(),
        (res) => {
          if (res.status === "rejected") {
            console.warn("Failed to get the last response from disk.");
            resolve(false);
          } else {
            const staledResponse = res.value;
            if (staledResponse && !this._response) {
              if (
                this.options.cacheMaxAge <= 0 ||
                staledResponse.timestamp > Date.now() - this.options.cacheMaxAge
              ) {
                const response = {
                  ...staledResponse,
                  staled: true,
                  local: true,
                };
                // this.onReceiveResponse(response);
                this.setResponse(response);
                resolve(true);
                return;
              }
            }
            resolve(false);
          }
        }
      );
    });
  }
}

export class ObservableQueryMap<T = unknown, E = unknown> extends HasMapStore<
  ObservableQuery<T, E>
> {
  constructor(creater: (key: string) => ObservableQuery<T, E>) {
    super(creater);
  }
}
