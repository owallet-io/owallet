import {
  DefaultGasPriceStep,
  FeeType,
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IMemoConfig,
} from "./types";
import { TxChainSetter } from "./chain";
import {
  ChainGetter,
  CoinPrimitive,
  ObservableQueryBitcoinBalance,
  QueriesWrappedBitcoin,
} from "@owallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@owallet/unit";
import { Currency } from "@owallet/types";
import { computedFn } from "mobx-utils";
import { StdFee } from "@cosmjs/launchpad";
import { useState } from "react";
import { ObservableQueryBalances } from "@owallet/stores";
import { InsufficientFeeError, NotLoadedFeeError } from "./errors";

export class FeeEvmConfig extends TxChainSetter implements IFeeConfig {
  @observable.ref
  protected queryBalances: ObservableQueryBalances;

  @observable
  protected _sender: string;

  @observable
  protected _feeType: FeeType | undefined = undefined;

  @observable
  protected _manualFee: CoinPrimitive | undefined = undefined;

  @observable
  protected _autoFeeByGas: CoinPrimitive | undefined = undefined;

  /**
   * `additionAmountToNeedFee` indicated that the fee config should consider the amount config's amount
   *  when checking that the fee is sufficient to send tx.
   *  If this value is true and if the amount + fee is not sufficient to send tx, it will return error.
   *  Else, only consider the fee without addition the amount.
   * @protected
   */
  @observable
  protected additionAmountToNeedFee: boolean = true;

  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    queryBalances: ObservableQueryBalances,
    protected readonly amountConfig: IAmountConfig,
    protected readonly gasConfig: IGasConfig,
    additionAmountToNeedFee: boolean = true,
    protected readonly queryStore: QueriesWrappedBitcoin,
    protected readonly memoConfig?: IMemoConfig
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
    // this._senderEvm = senderEvm;

    this.queryBalances = queryBalances;
    // this.queryEvmBalances = queryEvmBalances;
    this.additionAmountToNeedFee = additionAmountToNeedFee;

    makeObservable(this);
  }

  @action
  setAdditionAmountToNeedFee(additionAmountToNeedFee: boolean) {
    this.additionAmountToNeedFee = additionAmountToNeedFee;
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
  setFeeType(feeType: FeeType | undefined) {
    this._feeType = feeType;
    this._manualFee = undefined;
    this._autoFeeByGas = undefined;
  }

  get isManual(): boolean {
    return this.feeType === undefined;
  }

  get feeType(): FeeType | undefined {
    return this._feeType;
  }

  @action
  setManualFee(fee: CoinPrimitive) {
    this._manualFee = fee;
    this._feeType = undefined;
    this._autoFeeByGas = undefined;
  }

  get feeCurrencies(): Currency[] {
    return this.chainInfo.feeCurrencies;
  }

  get feeCurrency(): Currency | undefined {
    return this.chainInfo.feeCurrencies[0];
  }

  toStdFee(): StdFee {
    const amount = this.getFeePrimitive();
    if (!amount) {
      return {
        gas: this.gasConfig.gas.toString(),
        amount: [],
      };
    }

    return {
      gas: this.gasConfig.gas.toString(),
      amount: [amount],
    };
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
      if (this.feeType) {
        return this.getFeeTypePrimitive(this.feeType);
      }

      return this.getAutoFeeGasPrimitive();

      // If fee is not set, just return with empty fee amount.
      return undefined;
    } catch (error) {
      console.log("Error in getFeePrimitive:", error);
    }
  }
  protected getAutoFeeGasPrimitive(): CoinPrimitive {
    try {
      if (!this.feeCurrency) {
        throw new Error("Fee currency not set");
      }
      const { gasPrice } = this.queryStore.evm.queryGasPrice.getGasPrice();
      const feeAmount = gasPrice.toDec().mul(new Dec(this.gasConfig.gas));

      console.log(
        "🚀 ~ FeeEvmConfig ~ getAutoFeeGasPrimitive ~ feeAmount:",
        feeAmount
      );
      return {
        denom: this.feeCurrency.coinMinimalDenom,
        amount: feeAmount.roundUp().toString(),
      };
    } catch (error) {
      console.log("Error in getAutoFeeGasPrimitive:", error);
    }
  }
  protected getFeeTypePrimitive(feeType: FeeType): CoinPrimitive {
    try {
      if (!this.feeCurrency) {
        throw new Error("Fee currency not set");
      }

      const gasPriceStep = this.chainInfo.stakeCurrency.gasPriceStep
        ? this.chainInfo.stakeCurrency.gasPriceStep
        : DefaultGasPriceStep;
      const gasPrice = new Dec(gasPriceStep[feeType].toString());
      const feeAmount = gasPrice.mul(new Dec(this.gasConfig.gas));
      return {
        denom: this.feeCurrency.coinMinimalDenom,
        amount: feeAmount.roundUp().toString(),
      };
    } catch (error) {
      console.log("Error in getFeeTypePrimitive:", error);
    }
  }

  readonly getFeeTypePretty = computedFn((feeType: FeeType) => {
    if (!this.feeCurrency) {
      throw new Error("Fee currency not set");
    }

    const feeTypePrimitive = this.getFeeTypePrimitive(feeType);

    const feeCurrency = this.feeCurrency;

    return new CoinPretty(
      feeCurrency,
      new Int(feeTypePrimitive.amount)
    ).maxDecimals(feeCurrency.coinDecimals);
  });

  getError(): Error | undefined {
    try {
      if (this.gasConfig.getError()) {
        return this.gasConfig.getError();
      }

      if (this.disableBalanceCheck) {
        return undefined;
      }

      const fee = this.getFeePrimitive();
      if (!fee) {
        return undefined;
      }

      const amount = this.amountConfig.getAmountPrimitive();

      let need: Coin;
      if (this.additionAmountToNeedFee && fee && fee.denom === amount.denom) {
        need = new Coin(
          fee.denom,
          new Int(fee.amount).add(new Int(amount.amount))
        );
      } else {
        need = new Coin(fee.denom, new Int(fee.amount));
      }

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

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }
}

export const useFeeEvmConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  queryBalances: ObservableQueryBalances,
  amountConfig: IAmountConfig,
  gasConfig: IGasConfig,
  additionAmountToNeedFee: boolean = true,
  queryStore: QueriesWrappedBitcoin,
  memoConfig?: IMemoConfig
) => {
  const [config] = useState(
    () =>
      new FeeEvmConfig(
        chainGetter,
        chainId,
        sender,
        queryBalances,
        amountConfig,
        gasConfig,
        additionAmountToNeedFee,
        queryStore,
        memoConfig
      )
  );
  config.setChain(chainId);
  config.setQueryBalances(queryBalances);
  config.setSender(sender);
  config.setAdditionAmountToNeedFee(additionAmountToNeedFee);
  return config;
};
