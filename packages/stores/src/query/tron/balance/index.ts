import { DenomHelper, getRpcByChainId, KVStore } from "@owallet/common";
import { ChainGetter, CoinPrimitive, QueryResponse } from "../../../common";
import { computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import { StoreUtils } from "../../../common";
import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../../balances";
import { ObservableChainQuery } from "../../chain-query";
import { Balances } from "./types";
import Web3 from "web3";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryBalanceNative extends ObservableQueryBalanceInner {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly nativeBalances: ObservableQueryTronBalances
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      // No need to set the url
      "",
      denomHelper
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return false;
  }

  get isFetching(): boolean {
    return this.nativeBalances.isFetching;
  }

  get error() {
    return this.nativeBalances.error;
  }

  get response() {
    return this.nativeBalances.response;
  }

  @override
  *fetch() {
    yield this.nativeBalances.fetch();
  }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.nativeBalances.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return StoreUtils.getBalanceFromCurrency(
      currency,
      this.nativeBalances.response.data.balances
    );
  }
}

export class ObservableQueryTronBalances extends ObservableChainQuery<Balances> {
  protected walletAddress: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "");

    this.walletAddress = walletAddress;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.walletAddress?.length > 0;
  }

  @override
  *fetch() {
    if (!this.duplicatedFetchCheck) {
      // it is inefficient to fetching duplicately in the same loop.
      // So, if the fetching requests are in the same tick, this prevent to refetch the result and use the prior fetching.
      this.duplicatedFetchCheck = true;
      setTimeout(() => {
        this.duplicatedFetchCheck = false;
      }, 1);

      yield super.fetch();
    }
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{
    data: Balances;
    headers: any;
  }> {
    const { headers } = await super.fetchResponse(abortController);
    try {
      const web3 = new Web3(
        getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
      );
      const ethBalance = await web3.eth.getBalance(this.walletAddress);

      const denomNative = this.chainGetter.getChain(this.chainId).stakeCurrency
        .coinMinimalDenom;
      const balances: CoinPrimitive[] = [
        {
          amount: ethBalance,
          denom: denomNative,
        },
      ];

      const data = {
        balances,
      };
      return {
        headers,
        data,
      };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryTronBalances ~ fetchResponse ~ error:",
        error
      );
    }
  }
}

export class ObservableQueryTronBalanceRegistry implements BalanceRegistry {
  protected nativeBalances: Map<string, ObservableQueryTronBalances> =
    new Map();

  readonly type: BalanceRegistryType = "evm";

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);

    if (denomHelper.type !== "native") {
      return;
    }
    const networkType = chainGetter.getChain(chainId).networkType;
    if (networkType !== "evm") return;
    const key = `tron-${chainId}/${walletAddress}`;

    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(
        key,
        new ObservableQueryTronBalances(
          this.sharedContext,
          chainId,
          chainGetter,
          walletAddress
        )
      );
    }
    return new ObservableQueryBalanceNative(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.nativeBalances.get(key)!
    );
  }
}
