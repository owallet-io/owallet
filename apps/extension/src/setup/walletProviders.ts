//@ts-nocheck
import { OWallet, Ethereum, TronWeb, Bitcoin } from "@owallet/provider";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import manifest from "../manifest.json";

export const initializeWalletProviders = () => {
  const owallet = new OWallet(
    manifest.version,
    "core",
    new InExtensionMessageRequester()
  );

  const ethereum = new Ethereum(
    manifest.version,
    "core",
    "",
    new InExtensionMessageRequester()
  );

  const tronWeb = new TronWeb(
    manifest.version,
    "core",
    "0x2b6653dc",
    new InExtensionMessageRequester()
  );

  const bitcoin = new Bitcoin(
    manifest.version,
    "core",
    new InExtensionMessageRequester()
  );

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
