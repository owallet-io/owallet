// import {
//   RNInjectedOWallet,
//   // RNInjectedEthereum,
//   // RNInjectedTronWeb,
//   // RNInjectedBitcoin,
// } from "./injected-provider";
// import { init } from "./init";
//
// // TODO: Set the OWallet version properly
// const owallet = new RNInjectedOWallet("0.9.21", "mobile-web");
// // const ethereum = new RNInjectedEthereum("0.9.21", "mobile-web");
// // const tronWeb = new RNInjectedTronWeb("0.9.21", "mobile-web");
// // const bitcoin = new RNInjectedBitcoin("0.9.21", "mobile-web");
// init(
//   owallet,
//   // ethereum,
//   // tronWeb,
//   // bitcoin,
//   (chainId: string) => owallet.getOfflineSigner(chainId),
//   (chainId: string) => owallet.getEnigmaUtils(chainId)
// );

import { RNInjectedOWallet } from "./injected-provider";
import { injectOWalletToWindow } from "@owallet/provider";

// TODO: Set the OWallet version properly
const owallet = new RNInjectedOWallet("0.9.21", "mobile-web");
injectOWalletToWindow(owallet);

window.addEventListener(
  "message",
  (e: { data: { type: string; origin: string } }) => {
    if (e.data.type !== "allow-temp-blocklist-url") {
      return;
    }

    // @ts-ignore
    if (window.ReactNativeWebView) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          message: e.data.type,
          origin: e.data.origin,
        })
      );
    }
  }
);
