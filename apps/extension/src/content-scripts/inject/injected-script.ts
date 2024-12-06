import { InjectedOWallet } from "@owallet/provider";
import { injectOWalletToWindow } from "@owallet/provider";

import manifest from "../../manifest.json";

const owallet = new InjectedOWallet(manifest.version, "extension");

injectOWalletToWindow(owallet);

window.addEventListener("beforeunload", () => {
  owallet.__core__webpageClosed();
});
