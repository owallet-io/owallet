import { GasConfig } from "./gas";
import { DenomHelper } from "@owallet/common";
import {
  ChainGetter,
  CosmosMsgOpts,
  SecretMsgOpts,
  CosmwasmMsgOpts,
  Erc20MsgOpts,
} from "@owallet/stores";
import { IAmountConfig } from "./types";
import { useState } from "react";
import { action, makeObservable, observable } from "mobx";
import { GasEvmConfig } from "./gas-evm";

type MsgOpts = CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts & Erc20MsgOpts;

export class SendGasEvmConfig extends GasEvmConfig {
  @observable.ref
  protected sendMsgOpts: MsgOpts["send"];

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly amountConfig: IAmountConfig,
    sendMsgOpts: MsgOpts["send"]
  ) {
    super(chainGetter, initialChainId);

    this.sendMsgOpts = sendMsgOpts;

    makeObservable(this);
  }

  @action
  setSendMsgOpts(opts: MsgOpts["send"]) {
    this.sendMsgOpts = opts;
  }

  get gas(): number {
    // If gas not set manually, assume that the tx is for MsgSend.
    // And, set the default gas according to the currency type.
    if (this._gasRaw == null && this.amountConfig.sendCurrency) {
      const denomHelper = new DenomHelper(
        this.amountConfig.sendCurrency.coinMinimalDenom
      );

      switch (denomHelper.type) {
        case "secret20":
          return this.sendMsgOpts.secret20.gas;
        case "cw20":
          return this.sendMsgOpts.cw20.gas;
        case "erc20":
          return this.sendMsgOpts.erc20.gas;
        default:
          return this.sendMsgOpts.native.gas;
      }
    }

    return super.gas;
  }
}

export const useSendGasEvmConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  amountConfig: IAmountConfig,
  sendMsgOpts: MsgOpts["send"]
) => {
  const [gasConfig] = useState(
    () => new SendGasEvmConfig(chainGetter, chainId, amountConfig, sendMsgOpts)
  );
  gasConfig.setChain(chainId);
  gasConfig.setSendMsgOpts(sendMsgOpts);

  return gasConfig;
};
