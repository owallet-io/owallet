import { IFeeTronConfig } from "./types";
import { TxChainSetter } from "./chain";
import {
  ChainGetter,
  CoinPrimitive,
  QueriesWrappedTron,
} from "@owallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { Coin, CoinPretty, DecUtils, Int } from "@owallet/unit";
import { Currency } from "@owallet/types";
import { useState } from "react";
import { ObservableQueryBalances } from "@owallet/stores";
import { InsufficientFeeError, NotLoadedFeeError } from "./errors";
import { StdFee } from "@cosmjs/launchpad";

export class FeeTronConfig extends TxChainSetter implements IFeeTronConfig {
  @observable.ref
  protected queryBalances: ObservableQueryBalances;

  @observable
  protected _sender: string;

  @observable
  protected _manualFee: CoinPrimitive | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    queryBalances: ObservableQueryBalances,
    protected readonly queryStore: QueriesWrappedTron
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;

    this.queryBalances = queryBalances;
    makeObservable(this);
  }

  @action
  setQueryBalances(queryBalances: ObservableQueryBalances) {
    this.queryBalances = queryBalances;
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  @action
  setManualFee(fee: CoinPrimitive) {
    this._manualFee = fee;
  }

  get feeCurrencies(): Currency[] {
    return this.chainInfo.feeCurrencies;
  }

  get feeCurrency(): Currency | undefined {
    return this.chainInfo.feeCurrencies[0];
  }

  @computed
  get fee(): CoinPretty | undefined {
    if (!this.feeCurrency) {
      return undefined;
    }

    const feePrimitive = this.getFeePrimitive();
    if (!feePrimitive) {
      return undefined;
    }

    return new CoinPretty(this.feeCurrency, new Int(feePrimitive.amount));
  }

  getFeePrimitive(): CoinPrimitive | undefined {
    try {
      // If there is no fee currency, just return with empty fee amount.
      if (!this.feeCurrency) {
        return undefined;
      }

      if (this._manualFee) {
        return this._manualFee;
      }
      // If fee is not set, just return with empty fee amount.
      return undefined;
    } catch (error) {
      console.log("Error in getFeePrimitive:", error);
    }
  }
  toStdFee(): StdFee {
    const amount = this.getFeePrimitive();
    if (!amount) {
      return {
        gas: null,
        amount: [],
      };
    }

    return {
      gas: null,
      amount: [amount],
    };
  }
  getError(): Error | undefined {
    try {
      const fee = this.getFeePrimitive();
      if (!fee) {
        return new NotLoadedFeeError("invalid fee");
      }
      const need = new Coin(fee.denom, new Int(fee.amount));

      if (need.amount.gt(new Int(0))) {
        const bal = this.queryBalances
          .getQueryBech32Address(this._sender)
          .balances.find((bal) => {
            return bal.currency.coinMinimalDenom === need.denom;
          });
        if (!bal) {
          return new InsufficientFeeError("insufficient fee");
        } else if (!bal.response && !bal.error) {
          // If fetching balance doesn't have the response nor error,
          // assume it is not loaded from KVStore(cache).
          return new NotLoadedFeeError(
            `${bal.currency.coinDenom} is not loaded yet`
          );
        } else if (
          bal.balance
            .toDec()
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                bal.currency.coinDecimals
              )
            )
            .truncate()
            .lt(need.amount)
        ) {
          return new InsufficientFeeError("insufficient fee");
        }
      }
    } catch (error) {
      console.log("Error on get fees: ", error);
    }
  }
}

export const useFeeTronConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  queryBalances: ObservableQueryBalances,
  queryStore: QueriesWrappedTron
) => {
  const [config] = useState(
    () =>
      new FeeTronConfig(chainGetter, chainId, sender, queryBalances, queryStore)
  );
  config.setChain(chainId);
  config.setQueryBalances(queryBalances);
  config.setSender(sender);
  return config;
};
