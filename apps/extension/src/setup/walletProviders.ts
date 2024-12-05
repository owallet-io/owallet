//@ts-nocheck
import { OWallet } from "@owallet/provider";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import manifest from "../manifest.json";

export const initializeWalletProviders = () => {
  const owallet = new OWallet(
    manifest.version,
    "core",
    new InExtensionMessageRequester()
  );

  const ethereum = owallet.ethereum;

  const tronWeb = owallet.tron;

  const bitcoin = owallet.bitcoin;

  // Assign to window object
  window.owallet = owallet;
  window.eth_owallet = ethereum;
  window.ethereum = ethereum;
  window.tronWeb = tronWeb;
  window.tronLink = tronWeb;
  window.tronWeb_owallet = tronWeb;
  window.tronLink_owallet = tronWeb;
  window.bitcoin = bitcoin;
};
