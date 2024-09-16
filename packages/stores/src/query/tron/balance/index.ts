import { DenomHelper } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";

import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../../balances";

import Web3 from "web3";
import { QuerySharedContext } from "src/common/query/context";
import { ObservableEvmChainJsonRpcQuery } from "../../../query/evm-contract/evm-chain-json-rpc";

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

    if (!this.response?.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }
    return new CoinPretty(
      currency,
      new Int(Web3.utils.hexToNumberString(this.response.data))
    );
  }
}

export class ObservableQueryTronBalances extends ObservableEvmChainJsonRpcQuery<string> {
  protected walletAddress: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "eth_getBalance", [
      walletAddress,
      "latest",
    ]);

    this.walletAddress = walletAddress;

    makeObservable(this);
  }

  protected canFetch(): boolean {
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

    if (denomHelper.type !== "native" || !Web3.utils.isAddress(walletAddress))
      return;
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
