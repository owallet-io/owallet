import { SpendableBalances } from "./types";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { CoinPretty } from "@owallet/unit";
import { computed } from "mobx";
import { QuerySharedContext } from "../../../common";

export class ObservableChainQuerySpendableBalances extends ObservableChainQuery<SpendableBalances> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/bank/v1beta1/spendable_balances/${address}`
    );
  }

  @computed
  get balances(): CoinPretty[] {
    if (!this.response) {
      return [];
    }

    const res: CoinPretty[] = [];

    const chainInfo = this.chainGetter.getChain(this.chainId);

    for (const bal of this.response.data.balances) {
      const currency = chainInfo.findCurrency(bal.denom);
      if (currency) {
        res.push(new CoinPretty(currency, bal.amount));
      }
    }

    return res;
  }
}

export class ObservableQuerySpendableBalances extends ObservableChainQueryMap<SpendableBalances> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (denom: string) => {
      return new ObservableChainQuerySpendableBalances(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        denom
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableChainQuerySpendableBalances {
    return this.get(bech32Address) as ObservableChainQuerySpendableBalances;
  }
}
