import "./polyfill/crypto";
import { chainInfos } from "@oraichain/oraidex-common";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
// polyfill
Tendermint37Client.detectVersion = () => {};
Tendermint37Client.prototype.status = function () {
  const chainInfo = chainInfos.find(
    (chain) => chain.networkType === "cosmos" && chain.rpc === this.client.url
  );
  return {
    nodeInfo: {
      network: chainInfo.chainId,
      version: "",
    },
  };
};

if (typeof __dirname === "undefined") global.__dirname = "/";
if (typeof __filename === "undefined") global.__filename = "";

if (typeof process === "undefined") {
  global.process = require("process");
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bProcess = require("process");
  for (const p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

process.browser = false;
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (typeof Buffer === "undefined") global.Buffer = require("buffer").Buffer;

if (!global.atob || !global.btoa) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Buffer = require("buffer").Buffer;
  global.atob = (data) => {
    return Buffer.from(data, "base64").toString();
  };

  global.btoa = (data) => {
    return Buffer.from(data).toString("base64");
  };
}

const isDev = typeof __DEV__ === "boolean" && __DEV__;
env = process.env ?? {};
import { INJECTED_PROVIDER_URL } from "react-native-dotenv";
env["NODE_ENV"] = isDev ? "development" : "production";
env["INJECTED_PROVIDER_URL"] = INJECTED_PROVIDER_URL;
process.env = env;

import EventEmitter from "eventemitter3";

const eventListener = new EventEmitter();

window.addEventListener = (type, fn, options) => {
  if (options && options.once) {
    eventListener.once(type, fn);
  } else {
    eventListener.addListener(type, fn);
  }
};

window.removeEventListener = (type, fn) => {
  eventListener.removeListener(type, fn);
};

window.dispatchEvent = (event) => {
  eventListener.emit(event.type);
};
