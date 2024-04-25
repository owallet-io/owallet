import "dotenv/config";
import { CosmosWalletImpl } from "./offline-wallet";
import { UniversalSwapHandler } from "../handler";
import {
  CoinGeckoId,
  KWT_BSC_CONTRACT,
  USDC_CONTRACT,
  cosmosTokens,
  flattenTokens,
  generateError,
  getTokenOnOraichain,
  toAmount,
} from "@oraichain/oraidex-common";

const cosmosToOraichain = async (
  chainId: "cosmoshub-4" | "osmosis-1" | "injective-1",
  toTokenCoingeckoId: CoinGeckoId
) => {
  const wallet = new CosmosWalletImpl(process.env.MNEMONIC);
  const sender = await wallet.getKeplrAddr(chainId);
  const fromAmount = 0.001;
  console.log("sender: ", sender);
  const originalFromToken = cosmosTokens.find((t) => t.chainId === chainId);

  const originalToToken = getTokenOnOraichain(toTokenCoingeckoId);

  if (!originalFromToken)
    throw generateError("Could not find original from token");
  if (!originalToToken) throw generateError("Could not find original to token");
  console.log({
    originalToToken,
    originalFromToken,
  });

  const universalHandler = new UniversalSwapHandler(
    {
      originalFromToken,
      originalToToken,
      sender: { cosmos: sender },
      fromAmount,
      simulateAmount: toAmount(fromAmount, originalToToken.decimals).toString(),
    },
    { cosmosWallet: wallet }
  );

  try {
    const result = await universalHandler.processUniversalSwap();
    console.log("result: ", result);
  } catch (error) {
    console.trace("error: ", error);
  }
};

(() => {
  cosmosToOraichain("injective-1", "tether");
})();
