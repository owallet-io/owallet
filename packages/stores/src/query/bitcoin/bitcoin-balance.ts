import { Result } from "./types";
import {
  DenomHelper,
  KVStore,
  MyBigInt,
  getKeyDerivationFromAddressType,
} from "@owallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { ChainGetter, QueryResponse, StoreUtils } from "../../common";
import { action, computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import { CancelToken } from "axios";
import {
  getAddressTypeByAddress,
  getBaseDerivationPath,
  processBalanceFromUtxos,
} from "@owallet/bitcoin";
import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../balances";
import { AddressBtcType, Currency } from "@owallet/types";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryBtcBalances extends ObservableChainQuery<Result> {
  protected bech32Address: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/address/${bech32Address}/utxo`
    );

    this.bech32Address = bech32Address;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address?.length > 0;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: Result }> {
    const { headers, data } = await super.fetchResponse(abortController);
    const addressType = getAddressTypeByAddress(
      this.bech32Address
    ) as AddressBtcType;
    const keyDerivation = getKeyDerivationFromAddressType(addressType);
    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string,
      keyDerivationPath: keyDerivation,
    }) as string;
    const btcResult = processBalanceFromUtxos({
      address: this.bech32Address,
      utxos: data,
      path,
    });
    if (!btcResult) {
      throw new Error("Failed to get the response from bitcoin");
    }
    return {
      headers,
      data: btcResult,
    };
  }
}

export class ObservableQueryBitcoinBalanceNative extends ObservableQueryBalanceInner {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly nativeBalances: ObservableQueryBtcBalances
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
    return true;
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

    if (
      !this.nativeBalances.response?.data ||
      !this.nativeBalances.response?.data?.balance
      // ||
      // currency.coinDenom !== "BTC"
    ) {
      return new CoinPretty(currency, new Int(new MyBigInt(0)?.toString()));
    }
    return new CoinPretty(
      currency,
      new Int(new MyBigInt(this.response?.data?.balance)?.toString())
    );
  }
}

export class ObservableQueryBitcoinBalanceRegistry implements BalanceRegistry {
  protected nativeBalances: Map<string, ObservableQueryBtcBalances> = new Map();
  readonly type: BalanceRegistryType = "bitcoin";

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (!chainId.includes("bitcoin")) return;
    if (denomHelper.type !== "native") {
      return;
    }

    const key = `${chainId}/${bech32Address}`;
    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(
        key,
        new ObservableQueryBtcBalances(
          this.sharedContext,
          chainId,
          chainGetter,
          bech32Address
        )
      );
    }

    return new ObservableQueryBitcoinBalanceNative(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.nativeBalances.get(key)!
    );
  }
}
