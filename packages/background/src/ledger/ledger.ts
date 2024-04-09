import { LedgerAppType } from "@owallet/common";
import { LedgerInternal } from "./ledger-internal";

let callProxy: (method: string, args?: any[]) => Promise<any>;
let ledger: LedgerInternal = null;
let currentMode = null;
let ledgerType: LedgerAppType;
let initArgs = null;

export const ledgerProxy = async (
  method: string,
  args: any[] = []
): Promise<any> => {
  let response: any;

  if (!ledger && currentMode && method !== "init") {
    ledger = await LedgerInternal.init(currentMode, initArgs, ledgerType);
  }

  switch (method) {
    case "init":
      try {
        [currentMode, initArgs, ledgerType] = args;
        ledger = await LedgerInternal.init(currentMode, initArgs, ledgerType);
        response = true;
      } catch (error) {
        console.log("error ledgerProxy", error);

        response = false;
      }
      break;
    case "isWebHIDSupported":
      response = await LedgerInternal.isWebHIDSupported();
      break;
    default:
      try {
        response = await ledger[method]?.apply(ledger, args);
      } catch (error) {
        console.log("🚀 ~ file: ledger.ts:41 ~ error:", error);
      }
      break;
  }
  return response;
};
const isReactNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";

if (isReactNative) {
  callProxy = ledgerProxy;
} else {
  const channelDevice = new BroadcastChannel("device");

  callProxy = async (method: string, args: any[] = []): Promise<any> =>
    new Promise((resolve) => {
      let requestId = Date.now();
      const handler = ({ data }) => {
        if (data.requestId !== requestId) return;
        resolve(data.response);
        channelDevice.removeEventListener("message", handler);
      };
      channelDevice.addEventListener("message", handler);
      channelDevice.postMessage({ method, args, requestId });
    });
}

export class Ledger {
  static async init(
    mode: string,
    initArgs: any[] = [],
    type: LedgerAppType
  ): Promise<Ledger> {
    const resultInit = await callProxy("init", [mode, initArgs, type]);
    console.log("resultInit", resultInit);

    if (resultInit) return new Ledger();
    else throw new Error("Device state invalid!");
  }

  async getVersion(): Promise<{
    deviceLocked: boolean;
    major: number;
    version: string;
    testMode: boolean;
  }> {
    return await callProxy("getVersion");
  }

  async getPublicKey(path: number[] | string): Promise<Uint8Array> {
    return await callProxy("getPublicKey", [path]);
  }

  async sign(
    path: number[] | string,
    message: Uint8Array
  ): Promise<Uint8Array> {
    return await callProxy("sign", [path, message]);
  }

  async close(): Promise<void> {
    return await callProxy("close");
  }

  static async isWebHIDSupported(): Promise<boolean> {
    return await callProxy("isWebHIDSupported");
  }
}
