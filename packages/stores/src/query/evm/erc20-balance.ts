import { computed, makeObservable, override } from "mobx";
import { DenomHelper, KVStore, MyBigInt } from "@owallet/common";
import { ChainGetter } from "../../common";
import { CoinPretty, Int } from "@owallet/unit";
import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../balances";
import { Result } from "./types";
import { ObservableEvmContractChainQuery } from "./contract-query";
import { ERC20Currency } from "@owallet/types";

export class ObservableQueryErc20Balance extends ObservableEvmContractChainQuery<Result> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly address: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: contractAddress,
          data: `0x70a08231000000000000000000000000${address.replace(
            "0x",
            ""
          )}`,
        },
        "latest",
      ],
      id: "erc20-balance",
    });
  }

  protected canFetch(): boolean {
    return super.canFetch() && this.address !== "";
  }
}

export class ObservableQueryErc20BalanceInner extends ObservableQueryBalanceInner {
  protected readonly queryErc20Balance: ObservableQueryErc20Balance;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      // No need to set the url at initial.
      "",
      denomHelper
    );

    makeObservable(this);

    this.queryErc20Balance = new ObservableQueryErc20Balance(
      kvStore,
      chainId,
      chainGetter,
      denomHelper.contractAddress,
      address
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
    try {
      const denom = this.denomHelper.denom;

      const chainInfo = this.chainGetter.getChain(this.chainId);
      const currency = chainInfo.currencies.find(
        (cur) => cur.coinMinimalDenom === denom
      );

      // TODO: Infer the currency according to its denom (such if denom is `uatom` -> `Atom` with decimal 6)?
      if (!currency) {
        throw new Error(`Unknown currency: ${denom}`);
      }

      if (!this.queryErc20Balance.response?.data) {
        return new CoinPretty(currency, new Int(0)).ready(false);
      }

      return new CoinPretty(
        currency,
        new Int(
          new MyBigInt(this.queryErc20Balance.response.data.result).toString()
        )
      );
    } catch (error) {
      console.log("Error when query erc20 balance: ", error);
    }
  }
}

export class ObservableQueryErc20BalanceRegistry implements BalanceRegistry {
  readonly type: BalanceRegistryType = "erc20";

  constructor(protected readonly kvStore: KVStore) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string,
    currency?: ERC20Currency
  ): ObservableQueryBalanceInner | undefined {
    try {
      const denomHelper = new DenomHelper(minimalDenom);
      if (
        bech32Address &&
        (denomHelper.type === "erc20" || currency?.type === "erc20")
      ) {
        const result = new ObservableQueryErc20BalanceInner(
          this.kvStore,
          chainId,
          chainGetter,
          denomHelper,
          bech32Address
        );
        return result;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
