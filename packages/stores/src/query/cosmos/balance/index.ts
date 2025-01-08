import {
  API,
  DenomHelper,
  fetchRetry,
  KVStore,
  MapChainIdToNetwork,
} from "@owallet/common";
import { ChainGetter, QueryResponse } from "../../../common";
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
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryBalanceNative extends ObservableQueryBalanceInner {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly nativeBalances: ObservableQueryCosmosBalances
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

export class ObservableQueryCosmosBalances extends ObservableChainQuery<Balances> {
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
      `/cosmos/bank/v1beta1/balances/${bech32Address}?pagination.limit=1000`
    );

    this.bech32Address = bech32Address;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address?.length > 0;
  }

  @override
  *fetch() {
    if (!this.duplicatedFetchCheck) {
      // Because the native "bank" module's balance shares the querying result,
      // it is inefficient to fetching duplicately in the same loop.
      // So, if the fetching requests are in the same tick, this prevent to refetch the result and use the prior fetching.
      this.duplicatedFetchCheck = true;
      setTimeout(() => {
        this.duplicatedFetchCheck = false;
      }, 1);

      yield super.fetch();
    }
  }

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<Balances>>
  ) {
    super.onReceiveResponse(response);

    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (this.chainId === "Oraichain") {
      const allTokensAddress = response.data.balances
        .filter(
          (token) =>
            !!chainInfo.findCurrency(token.denom) === false &&
            MapChainIdToNetwork[chainInfo.chainId]
        )
        .map((coin) => {
          return `${new URLSearchParams(coin.denom)
            .toString()
            .replace("=", "")}`;
        })
        .join(",");
      fetchRetry(
        `https://oraicommon-staging.oraidex.io/api/v1/tokens/list/${allTokensAddress}`
      )
        .then((res) => {
          if (res?.length > 0) {
            const tokens = res.map((item, index) => {
              const { name, decimals, coinGeckoId, icon, denom } = item || {};
              return {
                coinImageUrl: icon,
                coinDenom: name,
                coinGeckoId: coinGeckoId,
                coinDecimals: decimals,
                coinMinimalDenom: denom,
              };
            });
            //@ts-ignore
            chainInfo.addCurrencies(...tokens);
          }
        })
        .catch((err) => {
          console.error(err, "Err");
          const allTokensAddress = response.data.balances
            .filter(
              (token) =>
                !!chainInfo.findCurrency(token.denom) === false &&
                MapChainIdToNetwork[chainInfo.chainId]
            )
            .map((coin) => {
              const str = `${
                MapChainIdToNetwork[chainInfo.chainId]
              }%2B${new URLSearchParams(coin.denom)
                .toString()
                .replace("=", "")}`;
              return str;
            });
          if (allTokensAddress?.length === 0) return;
          API.getMultipleTokenInfo({
            tokenAddresses: allTokensAddress.join(","),
          }).then((tokenInfos) => {
            if (!tokenInfos) return;
            const infoTokens = tokenInfos
              .filter(
                (token) => !!chainInfo.findCurrency(token.denom) === false
              )
              .map((tokeninfo) => {
                const infoToken = {
                  coinImageUrl: tokeninfo.imgUrl,
                  coinDenom: tokeninfo.abbr,
                  coinGeckoId: tokeninfo.coingeckoId,
                  coinDecimals: tokeninfo.decimal,
                  coinMinimalDenom: tokeninfo.denom,
                };
                return infoToken;
              });
            //@ts-ignore
            chainInfo.addCurrencies(...infoTokens);
          });
        });
    } else {
      const allTokensAddress = response.data.balances
        .filter(
          (token) =>
            !!chainInfo.findCurrency(token.denom) === false &&
            MapChainIdToNetwork[chainInfo.chainId]
        )
        .map((coin) => {
          const str = `${
            MapChainIdToNetwork[chainInfo.chainId]
          }%2B${new URLSearchParams(coin.denom).toString().replace("=", "")}`;
          return str;
        });
      if (allTokensAddress?.length === 0) return;
      API.getMultipleTokenInfo({
        tokenAddresses: allTokensAddress.join(","),
      }).then((tokenInfos) => {
        if (!tokenInfos) return;
        const infoTokens = tokenInfos
          .filter((token) => !!chainInfo.findCurrency(token.denom) === false)
          .map((tokeninfo) => {
            const infoToken = {
              coinImageUrl: tokeninfo.imgUrl,
              coinDenom: tokeninfo.abbr,
              coinGeckoId: tokeninfo.coingeckoId,
              coinDecimals: tokeninfo.decimal,
              coinMinimalDenom: tokeninfo.denom,
            };
            return infoToken;
          });
        //@ts-ignore
        chainInfo.addCurrencies(...infoTokens);
      });
    }
    const denoms = response.data.balances.map((coin) => coin.denom);
    chainInfo.addUnknownCurrencies(...denoms);
  }
}

export class ObservableQueryCosmosBalanceRegistry implements BalanceRegistry {
  protected nativeBalances: Map<string, ObservableQueryCosmosBalances> =
    new Map();

  readonly type: BalanceRegistryType = "cosmos";

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type !== "native") {
      return;
    }
    const networkType = chainGetter.getChain(chainId).networkType;
    if (networkType !== "cosmos") return;
    const key = `${chainId}/${bech32Address}`;

    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(
        key,
        new ObservableQueryCosmosBalances(
          this.sharedContext,
          chainId,
          chainGetter,
          bech32Address
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
