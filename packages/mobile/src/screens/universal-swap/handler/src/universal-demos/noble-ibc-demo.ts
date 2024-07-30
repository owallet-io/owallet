import "dotenv/config";
import { CosmosWalletImpl } from "./offline-wallet";
import { UniversalSwapHandler } from "../handler";
import {
  USDC_CONTRACT,
  cosmosTokens,
  generateError,
  toAmount,
} from "@oraichain/oraidex-common";

const nobleUsdcToOraiUsdc = async (chainId: "noble-1" | "Oraichain") => {
  const wallet = new CosmosWalletImpl(process.env.MNEMONIC);
  const sender = await wallet.getKeplrAddr(chainId);
  const fromAmount = 0.000001;

  let originalFromToken = cosmosTokens.find(
    (t) => t.chainId === "noble-1" && t.denom === "uusdc"
  );
  let originalToToken = cosmosTokens.find(
    (t) =>
      t.chainId === "Oraichain" &&
      t.contractAddress &&
      t.contractAddress === USDC_CONTRACT
  );
  // if we bridge from Oraichain -> Noble then we reverse order
  if (chainId === "Oraichain") {
    const temp = originalFromToken;
    originalFromToken = originalToToken;
    originalToToken = temp;
  }
  if (!originalFromToken)
    throw generateError("Could not find original from token");
  if (!originalToToken) throw generateError("Could not find original to token");
  const universalHandler = new UniversalSwapHandler(
    {
      originalFromToken,
      originalToToken,
      sender: { cosmos: sender },
      fromAmount,
      simulateAmount: toAmount(fromAmount, originalToToken.decimals).toString(),
    },
    { cosmosWallet: wallet, swapOptions: { ibcInfoTestMode: true } }
  );

  try {
    const result = await universalHandler.processUniversalSwap();
  } catch (error) {
    console.log("error: ", error);
  }
};

(() => {
  if (process.env.FORWARD) return nobleUsdcToOraiUsdc("noble-1");
  return nobleUsdcToOraiUsdc("Oraichain");
})();
