import {
  addressToPublicKey,
  API,
  ChainIdEnum,
  DenomHelper,
  getOasisNic,
  MapChainIdToNetwork,
  parseRpcBalance,
} from "@owallet/common";
import { ChainGetter, ObservableQuery } from "../../../common";
import { computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";

import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../../balances";

import Web3 from "web3";
import { QuerySharedContext } from "src/common/query/context";
import { Connection, PublicKey } from "@solana/web3.js";
import { ObservableChainQuery } from "../../chain-query";

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
    return new CoinPretty(
      currency,
      new Int(Web3.utils.hexToNumberString(this.response.data))
    );
  }
}

export class ObservableQuerySvmBalances extends ObservableChainQuery<string> {
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
  ): Promise<{ headers: any; data: any }> {
    const { data, headers } = await super.fetchResponse(abortController);
    // if (this.chainId === ChainIdEnum.Oasis) {
    //   const oasisBalance = await this.getOasisBalance();
    //   return {
    //     data: Number(oasisBalance.available)
    //       ? Web3.utils.numberToHex(Number(oasisBalance.available))
    //       : "0x1",
    //     headers: null,
    //   };
    // }
    // this.fetchAllErc20();
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const connection = new Connection(chainInfo.rpc, "confirmed");

    const publicKey = new PublicKey(this.walletAddress);
    const lamports = await connection.getBalance(publicKey);
    console.log(lamports, "lamports");
    return {
      data: lamports,
      headers,
    };
  }

  // protected async fetchAllErc20() {
  //   const chainInfo = this.chainGetter.getChain(this.chainId);
  //   // Attempt to register the denom in the returned response.
  //   // If it's already registered anyway, it's okay because the method below doesn't do anything.
  //   // Better to set it as an array all at once to reduce computed.
  //   if (!MapChainIdToNetwork[chainInfo.chainId]) return;
  //   const response = await API.getAllBalancesSvm({
  //     address: this.walletAddress,
  //     network: MapChainIdToNetwork[chainInfo.chainId],
  //   });
  //
  //   if (!response.result) return;
  //
  //   const allTokensAddress = response.result
  //     .filter(
  //       (token) =>
  //         !!chainInfo.currencies.find(
  //           (coin) =>
  //             new DenomHelper(
  //               coin.coinMinimalDenom
  //             ).contractAddress?.toLowerCase() !==
  //             token.tokenAddress?.toLowerCase()
  //         ) && MapChainIdToNetwork[chainInfo.chainId]
  //     )
  //     .map((coin) => {
  //       const str = `${
  //         MapChainIdToNetwork[chainInfo.chainId]
  //       }%2B${new URLSearchParams(coin.tokenAddress)
  //         .toString()
  //         .replace("=", "")}`;
  //       return str;
  //     });
  //
  //   if (allTokensAddress?.length === 0) return;
  //
  //   const tokenInfos = await API.getMultipleTokenInfo({
  //     tokenAddresses: allTokensAddress.join(","),
  //   });
  //   const infoTokens = tokenInfos
  //     .filter(
  //       (item, index, self) =>
  //         index ===
  //           self.findIndex((t) => t.contractAddress === item.contractAddress) &&
  //         chainInfo.currencies.findIndex(
  //           (item2) =>
  //             new DenomHelper(
  //               item2.coinMinimalDenom
  //             ).contractAddress.toLowerCase() ===
  //             item.contractAddress.toLowerCase()
  //         ) < 0
  //     )
  //     .map((tokeninfo) => {
  //       const infoToken = {
  //         coinImageUrl: tokeninfo.imgUrl,
  //         coinDenom: tokeninfo.abbr,
  //         coinGeckoId: tokeninfo.coingeckoId,
  //         coinDecimals: tokeninfo.decimal,
  //         coinMinimalDenom: `erc20:${tokeninfo.contractAddress}:${tokeninfo.name}`,
  //         contractAddress: tokeninfo.contractAddress,
  //       };
  //       return infoToken;
  //     });
  //
  //   //@ts-ignore
  //   chainInfo.addCurrencies(...infoTokens);
  // }
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

    // if (denomHelper.type !== "native") return;
    // const networkType = chainGetter.getChain(chainId).networkType;
    // if (networkType !== "evm") return;
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
