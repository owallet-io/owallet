import {
  CosmosChainId,
  CosmosWallet,
  EvmResponse,
  EvmWallet,
  TokenItemType,
} from "@oraichain/oraidex-common";
import { UniversalSwapHandler } from "./handler";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";

export const swapOraichainToOraichain = async (data: {
  cosmosWallet: CosmosWallet;
  fromAmount: number;
  simulateAmount: string;
  fromToken: TokenItemType;
  toToken: TokenItemType;
  simulatePrice: string;
  userSlippage: number;
}): Promise<ExecuteResult> => {
  const {
    cosmosWallet,
    fromAmount,
    fromToken,
    toToken,
    simulatePrice,
    userSlippage,
    simulateAmount,
  } = data;
  const sender = await cosmosWallet.getKeplrAddr("Oraichain");
  const handler = new UniversalSwapHandler(
    {
      sender: { cosmos: sender },
      fromAmount,
      simulateAmount,
      originalFromToken: fromToken,
      originalToToken: toToken,
      simulatePrice,
      userSlippage,
    },
    { cosmosWallet }
  );
  return handler.swap();
};

export const swapOraichainToCosmos = async (data: {
  cosmosWallet: CosmosWallet;
  fromAmount: number;
  fromToken: TokenItemType;
  toToken: TokenItemType;
  simulateAmount: string;
  simulatePrice: string;
  userSlippage: number;
}) => {
  const {
    cosmosWallet,
    fromAmount,
    fromToken,
    toToken,
    simulatePrice,
    userSlippage,
    simulateAmount,
  } = data;
  const cosmos = await cosmosWallet.getKeplrAddr(
    fromToken.chainId as CosmosChainId
  );
  const handler = new UniversalSwapHandler(
    {
      sender: { cosmos },
      fromAmount,
      originalFromToken: fromToken,
      originalToToken: toToken,
      simulatePrice,
      simulateAmount,
      userSlippage,
    },
    { cosmosWallet }
  );
  return handler.swapAndTransferToOtherNetworks("oraichain-to-cosmos");
};

export const swapOraichainToEvm = async (data: {
  cosmosWallet: CosmosWallet;
  evmWallet: EvmWallet;
  fromAmount: number;
  fromToken: TokenItemType;
  toToken: TokenItemType;
  simulateAmount: string;
  simulatePrice: string;
  userSlippage: number;
}) => {
  const {
    evmWallet,
    cosmosWallet,
    fromAmount,
    fromToken,
    toToken,
    simulatePrice,
    userSlippage,
    simulateAmount,
  } = data;
  const cosmos = await cosmosWallet.getKeplrAddr(
    fromToken.chainId as CosmosChainId
  );
  const evm = await evmWallet.getEthAddress();
  const tron = evmWallet.tronWeb?.defaultAddress?.base58;
  const handler = new UniversalSwapHandler(
    {
      sender: { cosmos, evm, tron },
      fromAmount,
      originalFromToken: fromToken,
      originalToToken: toToken,
      simulatePrice,
      simulateAmount,
      userSlippage,
    },
    { cosmosWallet, evmWallet }
  );
  return handler.swapAndTransferToOtherNetworks("oraichain-to-evm");
};

// TODO: Support swapping from other cosmos based networks 1 step
export const swapCosmosToOraichain = async () => {};

export const swapEvmToOraichain = async (data: {
  cosmosWallet: CosmosWallet;
  evmWallet: EvmWallet;
  fromAmount: number;
  fromToken: TokenItemType;
  toToken: TokenItemType;
  simulateAmount: string;
  simulatePrice: string;
  userSlippage: number;
}): Promise<EvmResponse> => {
  // the params and logic are the same, so we reuse it
  const {
    evmWallet,
    cosmosWallet,
    fromAmount,
    fromToken,
    toToken,
    simulatePrice,
    userSlippage,
    simulateAmount,
  } = data;
  const cosmos = await cosmosWallet.getKeplrAddr(
    fromToken.chainId as CosmosChainId
  );
  const evm = await evmWallet.getEthAddress();
  const tron = evmWallet.tronWeb?.defaultAddress?.base58;
  const handler = new UniversalSwapHandler(
    {
      sender: { cosmos, evm, tron },
      fromAmount,
      originalFromToken: fromToken,
      originalToToken: toToken,
      simulatePrice,
      simulateAmount,
      userSlippage,
    },
    { cosmosWallet, evmWallet }
  );
  return handler.processUniversalSwap() as Promise<EvmResponse>;
};
