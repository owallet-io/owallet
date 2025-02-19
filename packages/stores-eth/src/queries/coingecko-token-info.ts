import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QueryResponse,
  QuerySharedContext,
} from "@owallet/stores";
import { makeObservable } from "mobx";
import { ITokenInfoRes } from "@owallet/types";
import { Network } from "@owallet/common";
export class ObservableQueryCoingeckoTokenInfoInner extends ObservableQuery<ITokenInfoRes> {
  constructor(
    sharedContext: QuerySharedContext,
    coingeckoAPIBaseURL: string,
    coingeckoAPIURI: string,
    protected readonly coingeckoChainId: string,
    contractAddress: string
  ) {
    super(
      sharedContext,
      coingeckoAPIBaseURL,
      coingeckoAPIURI
        .replace("{coingeckoChainId}", coingeckoChainId)
        .replace("{contractAddress}", contractAddress)
    );

    makeObservable(this);
  }

  get symbol(): string | undefined {
    return this.response?.data?.data?.abbr?.toUpperCase();
  }

  get decimals(): number | undefined {
    return this.response?.data?.data?.decimal;
  }

  get coingeckoId(): string | undefined {
    return this.response?.data?.data?.coingeckoId;
  }

  get logoURI(): string | undefined {
    return this.response?.data?.data?.imgUrl;
  }
}

export class ObservableQueryCoingeckoTokenInfo extends HasMapStore<
  ObservableQueryCoingeckoTokenInfoInner | undefined
> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly coingeckoAPIBaseURL: string,
    protected readonly coingeckoAPIURI: string
  ) {
    const coingeckoChainId = coingeckoChainIdMap[chainId];

    super((contractAddress: string) => {
      if (coingeckoChainId != null) {
        return new ObservableQueryCoingeckoTokenInfoInner(
          this.sharedContext,
          coingeckoAPIBaseURL,
          coingeckoAPIURI,
          coingeckoChainId,
          contractAddress
        );
      }
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryCoingeckoTokenInfoInner | undefined {
    return this.get(contractAddress) as ObservableQueryCoingeckoTokenInfoInner;
  }
}

const coingeckoChainIdMap: Record<string, string> = {
  "eip155:1": Network.ETHEREUM,
  "eip155:56": Network.BINANCE_SMART_CHAIN,
  "eip155:10": "optimistic-ethereum",
  "eip155:137": "polygon-pos",
  "eip155:8453": "base",
  "eip155:42161": "arbitrum-one",
};
