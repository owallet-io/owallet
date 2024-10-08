import { makeObservable, observable, runInAction } from "mobx";
import { KVStore, MultiGet } from "@owallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryBalances } from "./balances";
import { ChainGetter } from "../common";
import { OWallet } from "@owallet/types";
import { QuerySharedContext } from "../common/query/context";
import { ObservableSimpleQuery } from "./simple";

export class QueriesSetBase {
  public readonly queryBalances: DeepReadonly<ObservableQueryBalances>;
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryBalances = new ObservableQueryBalances(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}

export class QueriesStore<QueriesSet extends QueriesSetBase> {
  @observable.shallow
  protected queriesMap: Map<string, QueriesSet> = new Map();
  public readonly sharedContext: QuerySharedContext;
  public readonly simpleQuery: ObservableSimpleQuery;

  constructor(
    protected readonly kvStore: KVStore | (KVStore & MultiGet),
    protected readonly chainGetter: ChainGetter,
    protected readonly options: {
      responseDebounceMs?: number;
    },
    protected readonly apiGetter: () => Promise<OWallet | undefined>,
    protected readonly queriesCreator: new (
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter,
      apiGetter: () => Promise<OWallet | undefined>
    ) => QueriesSet
  ) {
    this.sharedContext = new QuerySharedContext(kvStore, {
      responseDebounceMs: this.options.responseDebounceMs ?? 0,
    });

    this.simpleQuery = new ObservableSimpleQuery(this.sharedContext);

    makeObservable(this);
  }

  get(chainId: string): DeepReadonly<QueriesSet> {
    if (!this.queriesMap.has(chainId)) {
      const queries = new this.queriesCreator(
        this.sharedContext,
        chainId,
        this.chainGetter,
        this.apiGetter
      );
      runInAction(() => {
        this.queriesMap.set(chainId, queries);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesMap.get(chainId)! as DeepReadonly<QueriesSet>;
  }
}
