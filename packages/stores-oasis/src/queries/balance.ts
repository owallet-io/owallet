import { DenomHelper, parseRpcBalance } from "@owallet/common";
import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  ObservableQuery,
  QuerySharedContext,
} from "@owallet/stores";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { CoinPretty, Int } from "@owallet/unit";
import { computed, makeObservable } from "mobx";
// import { OasisAccountBase } from "../account";
// import {simpleFetch} from "@owallet/simple-fetch";
import { Buffer } from "buffer";
import { Hash } from "@owallet/crypto";
import * as oasis from "@oasisprotocol/client";
import { staking } from "@oasisprotocol/client";

// import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";

export class ObservableQueryOasisAccountBalanceImpl
  extends ObservableQuery<string, any>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly bech32Address: string
  ) {
    super(
      sharedContext,
      null,
      null,
      null
      //     [
      //   ethereumHexAddress,
      //   "latest",
      // ]
    );

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If ethereum hex address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find(
      (cur) => cur.coinMinimalDenom === denom
    );
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(BigInt(this.response.data)));
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: any }> {
    // const result = await simpleFetch<{
    //   jsonrpc: "2.0";
    //   result?: T;
    //   id: string;
    //   error?: {
    //     code?: number;
    //     message?: string;
    //   };
    // }>(this.baseURL, this.url, {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     jsonrpc: "2.0",
    //     id: "1",
    //     method: this.method,
    //     params: this.params,
    //   }),
    //   signal: abortController.signal,
    // });
    //
    // if (result.data.error && result.data.error.message) {
    //   throw new Error(result.data.error.message);
    // }
    //
    // if (!result.data.result) {
    //   throw new Error("Unknown error");
    // }
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const nic = new oasis.client.NodeInternal(chainInfo.grpc);
    const publicKey = await staking.addressFromBech32(
      "oasis1qp60c29kd0r8mx6hhs96a8sp0fsmftxqkcnt7vyk"
    );
    const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
    const grpcBalance = parseRpcBalance(account);
    console.log(grpcBalance, "grpcBalance");
    const result = "";
    // return {
    //   headers: result.headers,
    //   data: result.data.result,
    // };
    return;
  }

  protected override getCacheKey(): string {
    // const paramsHash = Buffer.from(
    //     Hash.sha256(Buffer.from(JSON.stringify(this.params))).slice(0, 8)
    // ).toString("hex");
    //
    // return `${super.getCacheKey()}-${this.method}-${paramsHash}`;
    return "";
  }
}

export class ObservableQueryOasisAccountBalanceRegistry
  implements BalanceRegistry
{
  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter<ChainInfo>,
    address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    const chainInfo = chainGetter.getChain(chainId);
    console.log(chainId, "chainId oasis");
    if (!chainInfo.features.includes("oasis")) return;
    // const isHexAddress =
    //   OasisAccountBase.isOasisHexAddressWithChecksum(address);
    // if (
    //   denomHelper.type !== "native" ||
    //   !isHexAddress ||
    //   chainInfo.evm == null
    // ) {
    //   return;
    // }

    return new ObservableQueryOasisAccountBalanceImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      address
    );
  }
}
