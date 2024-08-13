import { computed, makeObservable, override } from "mobx";
import {
  DenomHelper,
  getRpcByChainId,
  KVStore,
  MapChainIdToNetwork,
  urlTxHistory,
} from "@owallet/common";
import {
  ChainGetter,
  ObservableJsonGetQuery,
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
import { ResBalanceEvm } from "@owallet/types";

export class ObservableQueryErc20Balances extends ObservableJsonGetQuery<ResBalanceEvm> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly walletAddress: string
  ) {
    super(
      sharedContext,
      urlTxHistory,
      `raw-tx-history/all/balances?network=${MapChainIdToNetwork[chainId]}&address=${walletAddress}`
    );
  }

  protected canFetch(): boolean {
    return this.contractAddress?.length !== 0 && this.walletAddress !== "";
  }
}

export class ObservableQueryErc20BalancesInner extends ObservableQueryBalanceInner {
  protected readonly queryErc20Balances: ObservableQueryErc20Balances;

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

    this.queryErc20Balances = new ObservableQueryErc20Balances(
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
    yield this.queryErc20Balances.fetch();
  }

  @computed
  get balance(): CoinPretty {
    // const denom = this.denomHelper.denom;

    // const chainInfo = this.chainGetter.getChain(this.chainId);
    // const currency = chainInfo.currencies.find(
    //   (cur) => cur.coinMinimalDenom === denom
    // );

    // if (!currency) {
    //   throw new Error(`Unknown currency: ${denom}`);
    // }

    // if (
    //   !this.queryErc20Balances.response ||
    //   !this.queryErc20Balances.response.data
    // ) {
    //   return new CoinPretty(currency, new Int(0)).ready(false);
    // }

    // return new CoinPretty(
    //   currency,
    //   new Int(
    //     Web3.utils.hexToNumberString(this.queryErc20Balances.response.data)
    //   )
    // );
    return;
  }
  protected override onReceiveResponse(
    response: Readonly<QueryResponse<ResBalanceEvm>>
  ) {
    super.onReceiveResponse(response);
    console.log(response, "response");
    const chainInfo = this.chainGetter.getChain(this.chainId);
    const erc20Denoms = response.data.result
      .filter(
        (tokenBalance) =>
          tokenBalance.balance != null && BigInt(tokenBalance.balance) > 0
      )
      .map((tokenBalance) => `erc20:${tokenBalance.tokenAddress}`);
    if (erc20Denoms) {
      console.log(erc20Denoms, "erc20Denoms");
      // chainInfo.addUnknownDenoms(...erc20Denoms);
    }
  }
}

export class ObservableQueryErc20BalancesRegistry implements BalanceRegistry {
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

    return new ObservableQueryErc20BalancesInner(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      walletAddress
    );
  }
}
