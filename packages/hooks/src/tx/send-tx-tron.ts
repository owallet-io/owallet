import {
  ChainGetter,
  CosmosMsgOpts,
  CosmwasmMsgOpts,
  Erc20MsgOpts,
  ObservableQueryBitcoinBalance,
  QueriesWrappedTron,
  SecretMsgOpts,
} from "@owallet/stores";
import { ObservableQueryBalances } from "@owallet/stores";
import { useMemoConfig } from "./memo";
import { useRecipientConfig } from "./recipient";
import { useAmountConfig } from "./amount";
import { useFeeTronConfig } from "./fee-tron";
import { useSendGasTronConfig } from "./send-gas-tron";

type MsgOpts = CosmosMsgOpts & SecretMsgOpts & CosmwasmMsgOpts & Erc20MsgOpts;

export const useSendTxTronConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sendMsgOpts: MsgOpts["send"],
  sender: string,
  queryBalances: ObservableQueryBalances,
  queriesStore: QueriesWrappedTron,
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
  const gasConfig = useSendGasTronConfig(
    chainGetter,
    chainId,
    amountConfig,
    sendMsgOpts
  );
  const feeConfig = useFeeTronConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances,
    queriesStore
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
