import {
  ChainGetter,
  CosmosMsgOpts,
  CosmwasmMsgOpts,
  Erc20MsgOpts,
  ObservableQueryBitcoinBalance,
  QueriesWrappedBitcoin,
  SecretMsgOpts,
} from "@owallet/stores";
import { ObservableQueryBalances } from "@owallet/stores";
import { FeeConfig, useFeeConfig } from "./fee";
import { useMemoConfig } from "./memo";
import { useRecipientConfig } from "./recipient";
import { useSendGasConfig } from "./send-gas";
import { useAmountConfig } from "./amount";
import { FeeEvmConfig, useFeeEvmConfig } from "./fee-evm";
import { Int } from "@owallet/unit";
import { useEffect, useState } from "react";
import { useSendGasEvmConfig } from "./send-gas-evm";

type MsgOpts = CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts & Erc20MsgOpts;

export const useSendTxEvmConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sendMsgOpts: MsgOpts["send"],
  sender: string,
  queryBalances: ObservableQueryBalances,
  queriesStore: QueriesWrappedBitcoin,
  ensEndpoint?: string,
  queryBtcBalances?: ObservableQueryBitcoinBalance
) => {
  const recipientConfig = useRecipientConfig(chainGetter, chainId, ensEndpoint);
  const amountConfig = useAmountConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances,
    queryBtcBalances
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);

  const gasConfig = useSendGasEvmConfig(
    chainGetter,
    chainId,
    amountConfig,
    sendMsgOpts
  );

  const feeConfig = useFeeEvmConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances,
    amountConfig,
    gasConfig,
    true,
    queriesStore,
    memoConfig
  );
  // Due to the circular references between the amount config and gas/fee configs,
  // set the fee config of the amount config after initing the gas/fee configs.
  amountConfig.setFeeConfig(feeConfig);

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
  };
};
