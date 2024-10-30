import {
  DefaultGasPriceStep,
  FeeType,
  IAmountConfig,
  IBaseAmountConfig,
  IBtcFeeConfig,
  IMemoConfig,
  IRecipientConfig,
  ISenderConfig,
  UIProperties,
} from "../types";
import { TxChainSetter } from "../chain";
import { ChainGetter } from "@owallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { Currency, FeeCurrency, StdBtcFee } from "@owallet/types";
import { computedFn } from "mobx-utils";
import { useState } from "react";
import { InsufficientFeeError } from "../errors";
import { QueriesStore } from "../internal";
import { estimateFeeByFeeRate } from "@owallet/common";

export class BtcFeeConfig extends TxChainSetter implements IBtcFeeConfig {
  @observable.ref
  protected _fee:
    | {
        type: FeeType;
        currency: Currency;
      }
    | CoinPretty[]
    | undefined = undefined;

  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig,
    protected readonly amountConfig: IAmountConfig,
    protected readonly recipientConfig: IRecipientConfig,
    protected readonly memoConfig: IMemoConfig
  ) {
    super(chainGetter, initialChainId);
    makeObservable(this);
  }

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }

  get type(): FeeType | "manual" {
    if (!this.fee) {
      return "manual";
    }

    if ("type" in this.fee) {
      return this.fee.type;
    }

    return "manual";
  }

  @computed
  protected get fee():
    | {
        type: FeeType;
        currency: Currency;
      }
    | CoinPretty[]
    | undefined {
    if (!this._fee) {
      return undefined;
    }

    if ("type" in this._fee) {
      const coinMinimalDenom = this._fee.currency.coinMinimalDenom;
      const feeCurrency = this.chainGetter
        .getChain(this.chainId)
        .feeCurrencies.find((cur) => cur.coinMinimalDenom === coinMinimalDenom);
      const currency = this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(coinMinimalDenom);

      return {
        type: this._fee.type,
        currency: {
          ...feeCurrency,
          ...currency,
        },
      };
    }

    return this._fee.map((coin) => {
      const coinMinimalDenom = coin.currency.coinMinimalDenom;
      const feeCurrency = this.chainGetter
        .getChain(this.chainId)
        .feeCurrencies.find((cur) => cur.coinMinimalDenom === coinMinimalDenom);
      const currency = this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(coinMinimalDenom);

      return new CoinPretty(
        {
          ...feeCurrency,
          ...currency,
        },
        coin.toCoin().amount
      );
    });
  }

  @action
  setFee(
    fee:
      | {
          type: FeeType;
          currency: Currency;
        }
      | CoinPretty
      | CoinPretty[]
      | undefined
  ): void {
    if (fee && "type" in fee) {
      // Destruct it to ensure ref update.
      this._fee = {
        ...fee,
      };
    } else if (fee) {
      if ("length" in fee) {
        this._fee = fee;
      } else {
        //@ts-ignore
        this._fee = [fee];
      }
    } else {
      this._fee = undefined;
    }
  }

  @computed
  get selectableFeeCurrencies(): FeeCurrency[] {
    const res: FeeCurrency[] = [];

    for (const feeCurrency of this.chainInfo.feeCurrencies) {
      const cur = this.chainInfo.findCurrency(feeCurrency.coinMinimalDenom);
      if (cur) {
        res.push({
          ...feeCurrency,
          ...cur,
        });
      }
    }

    return res;
  }

  toStdFee(): StdBtcFee {
    const primitive = this.getFeePrimitive();

    return {
      amount: primitive.map((p) => {
        return {
          amount: p.amount,
          denom: p.currency.coinMinimalDenom,
        };
      }),
    };
  }

  @computed
  get fees(): CoinPretty[] {
    const primitives = this.getFeePrimitive();

    return primitives.map((p) => {
      return new CoinPretty(p.currency, p.amount);
    });
  }

  getFeePrimitive(): {
    amount: string;
    currency: FeeCurrency;
  }[] {
    let res: {
      amount: string;
      currency: FeeCurrency;
    }[] = [];

    // If there is no fee currency, just return with empty fee amount.
    if (!this.fee) {
      res = [];
    } else if ("type" in this.fee) {
      res = [
        {
          amount: this.getFeeTypePrettyForFeeCurrency(
            this.fee.currency,
            this.fee.type
          ).toCoin().amount,
          currency: this.fee.currency,
        },
      ];
    }

    return res;
  }

  readonly getFeeTypePrettyForFeeCurrency = computedFn(
    (feeCurrency: FeeCurrency, feeType: FeeType) => {
      // //TODO: need update gas
      // const gas = 1;
      const gasPrice = this.getGasPriceForFeeCurrency(feeCurrency, feeType);
      // console.log(gasPrice,"gasPrice");
      // const feeAmount = gasPrice.mul(new Dec(gas));
      // console.log(feeAmount?.toString())
      // console.log(this?.amountConfig?.amount?.[0]?.toCoin()?.amount,"this.amountConfig.amount[0].toCoin().amount")
      const utxos = [
        {
          txid: "9ede3b7747a705aa9fe723c5d6da7ea639b2e3ae072f828d2e72ca7bbc8c68bc",
          vout: 1,
          status: {
            confirmed: true,
            block_height: 824380,
            block_hash:
              "000000000000000000022d1e6fc0b8efd24dd48bc87a1c35150d3ff95bbd180e",
            block_time: 1704400656,
          },
          value: 7032,
        },
      ];
      // console.log(this.amount[0]
      //     .toDec()
      //     .mul(DecUtils.getTenExponentN(this.amount[0].currency.coinDecimals)),"amount")
      // const queryOsmosis = this.queriesStore.get(this.chainId);
      const amountData = new Dec(this.amountConfig.amountNotSubFee || 0).mul(
        DecUtils.getTenExponentN(feeCurrency.coinDecimals)
      );
      const fee = estimateFeeByFeeRate(
        utxos,
        Number(gasPrice.roundUp().toString()),
        {
          message: this.memoConfig.memo,
          recipient: this.recipientConfig.recipient,
          amount: Number(amountData.roundUp().toString()),
        }
      );
      // console.log(fee,"fee btc");
      const feeAmount = new Dec(fee);
      return new CoinPretty(feeCurrency, feeAmount.roundUp()).maxDecimals(
        feeCurrency.coinDecimals
      );
    }
  );
  readonly getGasPriceForFeeCurrency = computedFn(
    (feeCurrency: FeeCurrency, feeType: FeeType): Dec => {
      return this.populateGasPriceStep(feeCurrency, feeType);
    }
  );
  protected populateGasPriceStep(
    feeCurrency: FeeCurrency,
    feeType: FeeType
  ): Dec {
    const gasPriceStep = feeCurrency.gasPriceStep ?? DefaultGasPriceStep;
    let gasPrice = new Dec(0);
    switch (feeType) {
      case "low": {
        gasPrice = new Dec(gasPriceStep.low);
        break;
      }
      case "average": {
        gasPrice = new Dec(gasPriceStep.average);
        break;
      }
      case "high": {
        gasPrice = new Dec(gasPriceStep.high);
        break;
      }
      default: {
        throw new Error(`Unknown fee type: ${feeType}`);
      }
    }

    return gasPrice;
  }

  @computed
  get uiProperties(): UIProperties {
    if (this.disableBalanceCheck) {
      return {};
    }

    const fee = this.getFeePrimitive();
    if (!fee) {
      return {};
    }

    const needs = fee.slice();

    for (let i = 0; i < needs.length; i++) {
      const need = needs[i];

      if (new Int(need.amount).lte(new Int(0))) {
        continue;
      }

      const bal = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.senderConfig.value)
        .balances.find(
          (bal) =>
            bal.currency.coinMinimalDenom === need.currency.coinMinimalDenom
        );

      if (!bal) {
        return {
          warning: new Error(
            `Can't parse the balance for ${need.currency.coinMinimalDenom}`
          ),
        };
      }

      if (bal.error) {
        return {
          warning: new Error("Failed to fetch balance"),
        };
      }

      if (!bal.response) {
        return {
          loadingState: "loading-block",
        };
      }

      if (new Int(bal.balance.toCoin().amount).lt(new Int(need.amount))) {
        return {
          error: new InsufficientFeeError("Insufficient fee"),
          loadingState: bal.isFetching ? "loading" : undefined,
        };
      }
    }

    return {};
  }
}

export const useBtcFeeConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  senderConfig: ISenderConfig,
  amountConfig: IAmountConfig,
  recipientConfig: IRecipientConfig,
  memoConfig: IMemoConfig
) => {
  const [config] = useState(
    () =>
      new BtcFeeConfig(
        chainGetter,
        queriesStore,
        chainId,
        senderConfig,
        amountConfig,
        recipientConfig,
        memoConfig
      )
  );
  config.setChain(chainId);
  return config;
};
