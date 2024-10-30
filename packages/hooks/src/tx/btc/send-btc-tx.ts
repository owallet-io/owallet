import { ChainGetter } from "@owallet/stores";
import { useSenderConfig } from "../sender";
import { useAmountConfig } from "../amount";
import { useRecipientConfig } from "../recipient";
import { QueriesStore } from "../internal";
import { useMemoConfig } from "../memo";
import { useBtcFeeConfig } from "./btc-fee";

export const useSendBtcTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  sender: string,
  options: {
    allowHexAddressToBech32Address?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
    };
    ens?: {
      chainId: string;
    };
    computeTerraClassicTax?: boolean;
  } = {}
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);

  const amountConfig = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig
  );

  const feeConfig = useBtcFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig
  );

  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useRecipientConfig(chainGetter, chainId, options);
  const memoConfig = useMemoConfig(chainGetter, chainId);
  return {
    senderConfig,
    amountConfig,
    feeConfig,
    memoConfig,
    recipientConfig,
  };
};
