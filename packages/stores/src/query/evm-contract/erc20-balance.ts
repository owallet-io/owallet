import { computed, makeObservable, override } from "mobx";
import { DenomHelper, getRpcByChainId, KVStore } from "@owallet/common";
import {
  ChainGetter,
  ObservableJsonRPCQuery,
  QueryResponse,
} from "../../common";
import { CoinPretty, Int } from "@owallet/unit";
import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../balances";
import { Erc20ContractBalance, Erc20RpcBalance } from "./types";
import ERC20_ABI from "human-standard-token-abi";
import { ObservableChainQuery } from "../chain-query";
import Web3 from "web3";
import { erc20ContractInterface } from "./constant";
import { CancelToken } from "axios";
import { QuerySharedContext } from "src/common/query/context";
import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";

export class ObservableQueryErc20Balance extends ObservableEvmChainJsonRpcQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly walletAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "", [
      {
        to: contractAddress,
        data: erc20ContractInterface.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
      },
      "latest",
    ]);
  }

  protected canFetch(): boolean {
    return this.contractAddress?.length !== 0 && this.walletAddress !== "";
  }

  // protected async fetchResponse(cancelToken:CancelToken): Promise<
  //   QueryResponse<Erc20ContractBalance>
  // > {

  //   if (!Web3.utils.isAddress(this.walletAddress)) return;
  //   try {
  //     const web3 = new Web3(
  //       getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
  //     );
  //     // @ts-ignore
  //     const contract = new web3.eth.Contract(ERC20_ABI, this.contractAddress);

  //     const balance = await contract.methods
  //       .balanceOf(this.walletAddress)
  //       .call();

  //     if (!balance) {
  //       throw new Error("Failed to get the response from the contract");
  //     }
  //     const data: Erc20ContractBalance = {
  //       balance: balance,
  //     };
  //     console.log("🚀 ~ ObservableQueryErc20Balance ~ data:", data);

  //     return {
  //       data,
  //       status: 1,
  //       staled: false,
  //       timestamp: Date.now(),
  //     };
  //   } catch (error) {
  //     console.log("🚀 ~ ObservableQueryErc20Balance ~ error:", error);
  //   }
  // }
}

export class ObservableQueryErc20BalanceInner extends ObservableQueryBalanceInner {
  protected readonly queryErc20Balance: ObservableQueryErc20Balance;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly walletAddress: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      // No need to set the url at initial.
      "",
      denomHelper
    );

    makeObservable(this);

    this.queryErc20Balance = new ObservableQueryErc20Balance(
      sharedContext,
      chainId,
      chainGetter,
      denomHelper.contractAddress,
      walletAddress
    );
  }

  // This method doesn't have the role because the fetching is actually exeucnted in the `ObservableQueryErc20Balance`.
  protected canFetch(): boolean {
    return false;
  }

  @override
  *fetch() {
    yield this.queryErc20Balance.fetch();
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

    if (
      !this.queryErc20Balance.response ||
      !this.queryErc20Balance.response.data
    ) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(
      currency,
      new Int(
        Web3.utils.hexToNumberString(this.queryErc20Balance.response.data)
      )
    );
  }
}

export class ObservableQueryErc20BalanceRegistry implements BalanceRegistry {
  readonly type: BalanceRegistryType = "erc20";

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);

    if (denomHelper.type !== "erc20" || !Web3.utils.isAddress(walletAddress))
      return;

    return new ObservableQueryErc20BalanceInner(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      walletAddress
    );
  }
}
