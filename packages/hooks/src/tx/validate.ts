import {
  IBaseAmountConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IMemoConfig,
  IRecipientConfig,
  ISenderConfig,
} from "./types";
import { IIBCChannelConfig } from "../ibc";

export interface TxConfigsValidateResult {
  interactionBlocked: boolean;
  error?: Error | string;
}

// CONTRACT: Use with `observer`
export const useTxConfigsValidate = (configs: {
  senderConfig?: ISenderConfig;
  recipientConfig?: IRecipientConfig;
  gasConfig?: IGasConfig;
  amountConfig?: IBaseAmountConfig;
  feeConfig?: IFeeConfig;
  memoConfig?: IMemoConfig;
  channelConfig?: IIBCChannelConfig;
  gasSimulator?: IGasSimulator;
  isIgnoringModularChain?: boolean;
}): TxConfigsValidateResult => {
  const error = (() => {
    if (configs.isIgnoringModularChain) {
      console.log("[skip] Ignoring modular chain, no validation error");
      return;
    }

    // Check for errors
    if (configs.senderConfig?.uiProperties.error) {
      console.log(
        "[skip] senderConfig error:",
        configs.senderConfig.uiProperties.error
      );
      return configs.senderConfig.uiProperties.error;
    }
    if (configs.recipientConfig?.uiProperties.error) {
      console.log(
        "[skip] recipientConfig error:",
        configs.recipientConfig.uiProperties.error
      );
      return configs.recipientConfig.uiProperties.error;
    }
    if (configs.gasConfig?.uiProperties.error) {
      console.log(
        "[skip] gasConfig error:",
        configs.gasConfig.uiProperties.error
      );
      return configs.gasConfig.uiProperties.error;
    }
    if (configs.amountConfig?.uiProperties.error) {
      console.log(
        "[skip] amountConfig error:",
        configs.amountConfig.amount[0]?.toDec().toString(),
        configs.amountConfig.uiProperties.error
      );
      return configs.amountConfig.uiProperties.error;
    }
    if (configs.feeConfig?.uiProperties.error) {
      console.log(
        "[skip] feeConfig error:",
        configs.feeConfig.uiProperties.error
      );
      return configs.feeConfig.uiProperties.error;
    }
    if (configs.memoConfig?.uiProperties.error) {
      console.log(
        "[skip] memoConfig error:",
        configs.memoConfig.uiProperties.error
      );
      return configs.memoConfig.uiProperties.error;
    }
    if (configs.channelConfig?.uiProperties.error) {
      console.log(
        "[skip] channelConfig error:",
        configs.channelConfig.uiProperties.error
      );
      return configs.channelConfig.uiProperties.error;
    }
    if (configs.gasSimulator?.uiProperties.error) {
      console.log(
        "[skip] gasSimulator error:",
        configs.gasSimulator.uiProperties.error
      );
      return configs.gasSimulator.uiProperties.error;
    }
  })();

  const interactionBlocked = (() => {
    if (configs.isIgnoringModularChain) {
      console.log("[skip] Ignoring modular chain, interaction not blocked");
      return false;
    }

    if (error) {
      console.log("[skip] Interaction blocked due to validation error");
      return true;
    }

    // Check for loading states
    if (configs.senderConfig?.uiProperties.loadingState === "loading-block") {
      console.log("[skip] senderConfig loading state: loading-block");
    }
    if (
      configs.recipientConfig?.uiProperties.loadingState === "loading-block"
    ) {
      console.log("[skip] recipientConfig loading state: loading-block");
    }
    if (configs.gasConfig?.uiProperties.loadingState === "loading-block") {
      console.log("[skip] gasConfig loading state: loading-block");
    }
    if (configs.amountConfig?.uiProperties.loadingState === "loading-block") {
      console.log("[skip] amountConfig loading state: loading-block");
    }
    if (configs.feeConfig?.uiProperties.loadingState === "loading-block") {
      console.log("[skip] feeConfig loading state: loading-block");
    }
    if (configs.memoConfig?.uiProperties.loadingState === "loading-block") {
      console.log("[skip] memoConfig loading state: loading-block");
    }
    if (configs.channelConfig?.uiProperties.loadingState === "loading-block") {
      console.log("[skip] channelConfig loading state: loading-block");
    }
    if (configs.gasSimulator?.uiProperties.loadingState === "loading-block") {
      console.log("[skip] gasSimulator loading state: loading-block");
    }

    if (
      configs.senderConfig?.uiProperties.loadingState === "loading-block" ||
      configs.recipientConfig?.uiProperties.loadingState === "loading-block" ||
      configs.gasConfig?.uiProperties.loadingState === "loading-block" ||
      configs.amountConfig?.uiProperties.loadingState === "loading-block" ||
      configs.feeConfig?.uiProperties.loadingState === "loading-block" ||
      configs.memoConfig?.uiProperties.loadingState === "loading-block" ||
      configs.channelConfig?.uiProperties.loadingState === "loading-block" ||
      configs.gasSimulator?.uiProperties.loadingState === "loading-block"
    ) {
      console.log("[skip] Interaction blocked due to loading states");
      return true;
    }

    console.log(
      "[skip] No errors or blocking loading states found, interaction not blocked"
    );
    return false;
  })();

  return {
    interactionBlocked,
    error,
  };
};
