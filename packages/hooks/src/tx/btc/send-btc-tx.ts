import { ChainGetter } from "@owallet/stores";
import { useSenderConfig } from "../sender";
import { useAmountConfig } from "../amount";
import { useRecipientConfig } from "../recipient";
import { QueriesStore } from "../internal";
import { useFeeConfig } from "../fee";
import { useGasConfig } from "../gas";
import { useMemoConfig } from "../memo";

export const useSendBtcTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  sender: string,
  initialGas: number,
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

  const gasConfig = useGasConfig(chainGetter, chainId, initialGas);
  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig,
    options
  );

  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useRecipientConfig(chainGetter, chainId, options);
  const memoConfig = useMemoConfig(chainGetter, chainId);
  return {
    senderConfig,
    amountConfig,
    gasConfig,
    feeConfig,
    memoConfig,
    recipientConfig,
  };
};
