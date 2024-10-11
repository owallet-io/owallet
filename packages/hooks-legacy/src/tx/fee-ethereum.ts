import { IFeeEthereumConfig, IGasConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@owallet/stores";
import { action, makeObservable, observable } from "mobx";
import { useState } from "react";

export class FeeEthereumConfig
  extends TxChainSetter
  implements IFeeEthereumConfig
{
  /*
   This field is used to handle the value from the input more flexibly.
   We use string because there is no guarantee that only number is input in input component.
   If the user has never set it, undefined is also allowed to indicate that it is a default value.
   */
  @observable
  protected _feeRaw: string | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialFee?: number
  ) {
    super(chainGetter, initialChainId);

    this._feeRaw = initialFee?.toString() || undefined;

    makeObservable(this);
  }

  get feeRaw(): string {
    if (this._feeRaw == null) {
      return this.fee.toString();
    }

    return this._feeRaw;
  }

  get fee(): number {
    // If the gasRaw is undefined,
    // it means that the user never input something yet.
    // In this case, it should be handled as gas is 0.
    // But, it can be overridden on the child class if it is needed.
    if (this._feeRaw == null) {
      return 0;
    }

    const r = parseInt(this._feeRaw);
    return Number.isNaN(r) ? 0 : r;
  }

  @action
  setFee(fee: string) {
    if (fee.startsWith(".")) {
      fee = "0" + fee;
    }

    this._feeRaw = fee;
    return;
    // if (typeof fee === 'number') {
    //   this._feeRaw = Math.floor(fee).toString();
    //   return;
    // }

    // // this._feeRaw = fee;
    // // return;

    // if (fee === '') {
    //   this._feeRaw = fee;
    //   return;
    // }

    // // Gas must not be floated.
    // if (typeof fee === 'string') {
    //   if (!Number.isNaN(Number.parseInt(fee))) {
    //     return;
    //   }
    //   this._feeRaw = fee;
    //   return;
    // }
  }

  getError(): Error | undefined {
    if (this._feeRaw === "") {
      return new Error("Fee not set");
    }

    if (this._feeRaw && Number.isNaN(this._feeRaw)) {
      return new Error("Fee is not valid number");
    }

    if (!Number.isInteger(this.fee)) {
      return new Error("Fee is not integer");
    }

    if (this.fee < 0) {
      return new Error("Fee should be greater or equal to 0");
    }
    return;
  }
}

export const useFeeEthereumConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  initialGas?: number
) => {
  const [txConfig] = useState(
    () => new FeeEthereumConfig(chainGetter, chainId, initialGas)
  );
  txConfig.setChain(chainId);

  return txConfig;
};
