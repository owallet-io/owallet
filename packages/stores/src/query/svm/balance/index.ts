import {
  _getBalancesSolana,
  addressToPublicKey,
  API,
  ChainIdEnum,
  DenomHelper,
  getOasisNic,
  MapChainIdToNetwork,
  Network,
  parseRpcBalance,
  TOKEN_PROGRAM_ID,
} from "@owallet/common";
import { ChainGetter, ObservableQuery, QueryResponse } from "../../../common";
import { computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";

import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../../balances";
import { QuerySharedContext } from "src/common/query/context";
import { ObservableEvmChainJsonRpcQuery } from "../../evm-contract/evm-chain-json-rpc";

const tokenNative = "11111111111111111111111111111111";

export class ObservableQueryBalanceNative extends ObservableQueryBalanceInner {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly nativeBalances: ObservableQuerySvmBalances
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
    const denom = this.denomHelper.denom.replace("spl:", "");
    if (!this.nativeBalances.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }
    const tokenInfos = (this.response.data as any)?.wallet.balances.tokens
      .edges;
    if (!tokenInfos?.length) return;

    const token = tokenInfos.find((item, index) => {
      if (denom === "sol") {
        return item.node.token === tokenNative;
      }
      return item.node.token === denom;
    });
    if (!token) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }
    return new CoinPretty(currency, new Int(token.node.amount));
  }
}

export class ObservableQuerySvmBalances extends ObservableEvmChainJsonRpcQuery<string> {
  protected walletAddress: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "svm_getBalance", [
      walletAddress,
      "latest",
    ]);
    this.walletAddress = walletAddress;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.walletAddress?.length > 0;
  }

  @override
  *fetch() {
    yield super.fetch();
  }

  protected onReceiveResponse(_: Readonly<QueryResponse<string>>) {
    super.onReceiveResponse(_);
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const tokenInfos = (_.data as any)?.wallet.balances.tokens.edges;
    if (!tokenInfos?.length) return;

    // // 5. Map token metadata to currencies
    const allTokenAddress = tokenInfos.filter(
      (item, index) => item.node.tokenListEntry.address !== tokenNative
    );
    if (!allTokenAddress?.length) return;
    const tokenAddresses = allTokenAddress
      .map((item, index) => {
        return `${Network.SOLANA}%2B${item.node.tokenListEntry.address}`;
      })
      .join(",");
    API.getMultipleTokenInfo({
      tokenAddresses: tokenAddresses,
    })
      .then((tokenInfosAll) => {
        const currencyInfo = allTokenAddress.map((item) => {
          const coinGeckoId = tokenInfosAll.find(
            (token) => token.contractAddress == item.node.tokenListEntry.address
          );
          return {
            coinImageUrl: item.node.tokenListEntry.logo,
            coinDenom: item.node.tokenListEntry.symbol,
            coinGeckoId:
              coinGeckoId?.coingeckoId || item.node.tokenListEntry.coingeckoId,
            coinDecimals: item.node.tokenListEntry.decimals,
            coinMinimalDenom: `spl:${item.node.tokenListEntry.address}`,
          };
        });
        // // 6. Update chain info with currencies
        chainInfo.addCurrencies(...currencyInfo);
      })
      .catch((e) => {
        const currencyInfo = allTokenAddress.map((item) => {
          return {
            coinImageUrl: item.node.tokenListEntry.logo,
            coinDenom: item.node.tokenListEntry.symbol,
            coinGeckoId: item.node.tokenListEntry.coingeckoId,
            coinDecimals: item.node.tokenListEntry.decimals,
            coinMinimalDenom: `spl:${item.node.tokenListEntry.address}`,
          };
        });
        // // 6. Update chain info with currencies
        chainInfo.addCurrencies(...currencyInfo);
      });
  }

  async fetchSplBalances() {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (await _getBalancesSolana(
      this.walletAddress,
      chainInfo.chainId.replace("solana:", "")
    )) as any;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: any }> {
    const data = await this.fetchSplBalances();
    return {
      data: data,
      headers: null,
    };
  }
}

export class ObservableQuerySvmBalanceRegistry implements BalanceRegistry {
  protected nativeBalances: Map<string, ObservableQuerySvmBalances> = new Map();

  readonly type: BalanceRegistryType = "svm";

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (!chainId.startsWith("solana:")) return;
    const key = `svm-${chainId}/${walletAddress}`;

    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(
        key,
        new ObservableQuerySvmBalances(
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
