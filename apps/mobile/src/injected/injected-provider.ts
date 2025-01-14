import { InjectedOWallet } from "@owallet/provider";
import { OWalletMode } from "@owallet/types";
import { OWalletLogoBase64 } from "@owallet/provider-extension/build/constants";

export class RNInjectedOWallet extends InjectedOWallet {
  static parseWebviewMessage(message: any): any {
    if (message && typeof message === "string") {
      try {
        return JSON.parse(message);
      } catch {
        // noop
      }
    }

    return message;
  }

  constructor(version: string, mode: OWalletMode) {
    super(
      version,
      mode,
      {
        addMessageListener: (fn: (e: any) => void) =>
          window.addEventListener("message", fn),
        removeMessageListener: (fn: (e: any) => void) =>
          window.removeEventListener("message", fn),
        postMessage: (message) => {
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        },
      },
      RNInjectedOWallet.parseWebviewMessage,
      {
        uuid: crypto.randomUUID(),
        name: "OWallet",
        rdns: "io.owallet",
        icon: `data:image/png;base64,${OWalletLogoBase64}`,
      }
    );
  }
}
