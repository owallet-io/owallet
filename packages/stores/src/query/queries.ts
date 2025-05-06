import { makeObservable, observable, runInAction } from "mobx";
import { DeepReadonly, UnionToIntersection } from "utility-types";
import { ObservableQueryBalances } from "./balances";
import {
  IObject,
  mergeStores,
  mergeStoresSingle,
  ChainedFunctionifyTuple,
  QuerySharedContext,
} from "../common";
import { ChainGetter } from "../chain";
import { KVStore, MultiGet } from "@owallet/common";
import { ObservableSimpleQuery } from "./simple";

export interface QueriesSetBase {
  readonly queryBalances: DeepReadonly<ObservableQueryBalances>;
}

export const createQueriesSetBase = (
  sharedContext: QuerySharedContext,
  chainId: string,
  chainGetter: ChainGetter
): QueriesSetBase => {
  return {
    queryBalances: new ObservableQueryBalances(
      sharedContext,
      chainId,
      chainGetter
    ),
  };
};

// eslint-disable-next-line @typescript-eslint/ban-types
export interface IQueriesStore<T extends IObject = {}> {
  get(chainId: string): DeepReadonly<QueriesSetBase & T>;

  simpleQuery: ObservableSimpleQuery;
}

export class QueriesStore<Injects extends Array<IObject>> {
  @observable.shallow
  protected queriesMap: Map<
    string,
    QueriesSetBase & UnionToIntersection<Injects[number]>
  > = new Map();

  protected readonly queriesCreators: ChainedFunctionifyTuple<
    QueriesSetBase,
    // kvStore: KVStore,
    // chainId: string,
    // chainGetter: ChainGetter
    [QuerySharedContext, string, ChainGetter],
    Injects
  >;

  public readonly sharedContext: QuerySharedContext;

  public readonly simpleQuery: ObservableSimpleQuery;

  constructor(
    protected readonly kvStore: KVStore | (KVStore & MultiGet),
    protected readonly chainGetter: ChainGetter,
    protected readonly options: {
      responseDebounceMs?: number;
    },
    ...queriesCreators: ChainedFunctionifyTuple<
      QueriesSetBase,
      // kvStore: KVStore,
      // chainId: string,
      // chainGetter: ChainGetter
      [QuerySharedContext, string, ChainGetter],
      Injects
    >
  ) {
    this.sharedContext = new QuerySharedContext(kvStore, {
      responseDebounceMs: this.options.responseDebounceMs ?? 0,
    });
    this.queriesCreators = queriesCreators;

    this.simpleQuery = new ObservableSimpleQuery(this.sharedContext);

    makeObservable(this);
  }

  get(
    chainId: string
  ): DeepReadonly<QueriesSetBase & UnionToIntersection<Injects[number]>> {
    if (!this.queriesMap.has(chainId)) {
      const queriesSetBase = createQueriesSetBase(
        this.sharedContext,
        chainId,
        this.chainGetter
      );
      runInAction(() => {
        // Apply type assertion to the base store
        let merged = queriesSetBase as QueriesSetBase & IObject;
        const params = [this.sharedContext, chainId, this.chainGetter] as [
          QuerySharedContext,
          string,
          ChainGetter
        ];

        // Iterate through each creator and apply it individually
        for (let i = 0; i < this.queriesCreators.length; i++) {
          merged = mergeStoresSingle(
            merged,
            params,
            this.queriesCreators[i] as any
          );
        }

        this.queriesMap.set(
          chainId,
          merged as QueriesSetBase & UnionToIntersection<Injects[number]>
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesMap.get(chainId)! as DeepReadonly<
      QueriesSetBase & UnionToIntersection<Injects[number]>
    >;
  }
}
