// import {
//   InjectedOWallet,
//   InjectedEthereum,
//   InjectedTronWebOWallet,
//   InjectedBitcoin,
// } from "@owallet/provider";
// import {
//   OWalletMode,
//   EthereumMode,
//   BitcoinMode,
//   TronWeb,
// } from "@owallet/types";
//
// export class RNInjectedEthereum extends InjectedEthereum {
//   static parseWebviewMessage(message: any): any {
//     if (message && typeof message === "string") {
//       try {
//         return JSON.parse(message);
//       } catch (err) {
//         console.log("err: ", err);
//         // alert(`parseWebviewMessage err`);
//         // alert(err.message);
//         // noop
//       }
//     }
//
//     return message;
//   }
//
//   protected override async requestMethod(
//     method: string,
//     args: any[]
//   ): Promise<any> {
//     const result = await super.requestMethod(method, args);
//     if (method === "wallet_switchEthereumChain") {
//       this.chainId = result;
//     }
//     return result;
//   }
//
//   constructor(version: string, mode: EthereumMode) {
//     super(
//       version,
//       mode,
//       {
//         addMessageListener: (fn: (e: any) => void) => {
//           window.addEventListener("message", fn);
//         },
//         removeMessageListener: (fn: (e: any) => void) =>
//           window.removeEventListener("message", fn),
//         postMessage: (message) => {
//           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//           // @ts-ignore
//           window.ReactNativeWebView.postMessage(JSON.stringify(message));
//         },
//       },
//       RNInjectedEthereum.parseWebviewMessage
//     );
//   }
// }
// export class RNInjectedBitcoin extends InjectedBitcoin {
//   static parseWebviewMessage(message: any): any {
//     if (message && typeof message === "string") {
//       try {
//         return JSON.parse(message);
//       } catch {
//         // noop
//       }
//     }
//
//     return message;
//   }
//
//   constructor(version: string, mode: BitcoinMode) {
//     super(
//       version,
//       mode,
//       {
//         addMessageListener: (fn: (e: any) => void) =>
//           window.addEventListener("message", fn),
//         removeMessageListener: (fn: (e: any) => void) =>
//           window.removeEventListener("message", fn),
//         postMessage: (message) => {
//           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//           // @ts-ignore
//           window.ReactNativeWebView.postMessage(JSON.stringify(message));
//         },
//       },
//       RNInjectedBitcoin.parseWebviewMessage
//     );
//   }
// }
//
// export class RNInjectedOWallet extends InjectedOWallet {
//   static parseWebviewMessage(message: any): any {
//     if (message && typeof message === "string") {
//       try {
//         return JSON.parse(message);
//       } catch {
//         // noop
//       }
//     }
//
//     return message;
//   }
//
//   constructor(version: string, mode: OWalletMode) {
//     super(
//       version,
//       mode,
//       {
//         addMessageListener: (fn: (e: any) => void) =>
//           window.addEventListener("message", fn),
//         removeMessageListener: (fn: (e: any) => void) =>
//           window.removeEventListener("message", fn),
//         postMessage: (message) => {
//           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//           // @ts-ignore
//           window.ReactNativeWebView.postMessage(JSON.stringify(message));
//         },
//       },
//       RNInjectedOWallet.parseWebviewMessage
//     );
//   }
// }
//
// export class RNInjectedTronWeb extends InjectedTronWebOWallet {
//   static trx: { sign: (transaction: object) => Promise<object> };
//
//   protected override async requestMethod(
//     method: keyof TronWeb | string,
//     args: any[]
//   ): Promise<any> {
//     const result = await super.requestMethod(method, args);
//     if (method === "tron_requestAccounts") {
//       this.defaultAddress = result;
//     }
//     return result;
//   }
//
//   static parseWebviewMessage(message: any): any {
//     if (message && typeof message === "string") {
//       try {
//         return JSON.parse(message);
//       } catch {
//         // noop
//       }
//     }
//
//     return message;
//   }
//
//   constructor(version: string, mode: OWalletMode) {
//     super(
//       version,
//       mode,
//       {
//         addMessageListener: (fn: (e: any) => void) =>
//           window.addEventListener("message", fn),
//         removeMessageListener: (fn: (e: any) => void) =>
//           window.removeEventListener("message", fn),
//         postMessage: (message) => {
//           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//           // @ts-ignore
//           window.ReactNativeWebView.postMessage(JSON.stringify(message));
//         },
//       },
//       RNInjectedTronWeb.parseWebviewMessage
//     );
//     RNInjectedTronWeb.trx = {
//       sign: async (transaction: object): Promise<object> => {
//         return await this.requestMethod("sign", [transaction]);
//       },
//     };
//   }
// }
import { InjectedOWallet } from "@owallet/provider";
import { OWalletMode } from "@owallet/types";

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
      RNInjectedOWallet.parseWebviewMessage
    );
  }
}
