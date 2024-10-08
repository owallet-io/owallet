// we always make sure 'react-native' gets included first

import "reflect-metadata";
import * as ReactNative from "react-native";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

declare const tron; // eslint-disable-line @typescript-eslint/no-unused-vars

jest.useFakeTimers();
declare global {
  let __TEST__;
}

var localStorageMock = (function () {
  var store = {};
  return {
    getItem: function (key) {
      return store[key];
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key) {
      delete store[key];
    },
  };
})();

jest.mock("react-native-keychain", () => {
  const defaultOptions = {
    authenticationPrompt: {
      title: "Biometric Authentication",
    },
    accessible: "AccessibleWhenUnlockedThisDeviceOnly",
    accessControl: "BiometryCurrentSet",
  };

  return {
    setGenericPassword: jest.fn(),
    getGenericPassword: jest.fn(),
    getSupportedBiometryType: jest.fn(),
    resetGenericPassword: jest.fn(),
    ACCESSIBLE: {
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: "AccessibleWhenUnlockedThisDeviceOnly",
    },
    ACCESS_CONTROL: {
      BIOMETRY_CURRENT_SET: "BiometryCurrentSet",
    },
  };
});

Object.defineProperty(window, "localStorage", { value: localStorageMock });
const nodeCrypto = require("crypto");
Object.defineProperty(globalThis, "crypto", {
  value: {
    getRandomValues: (arr) => nodeCrypto.randomBytes(arr.length),
  },
});
class ChannelMock {
  onmessage: (event: { data: any }) => void;

  postMessage(data: any): void {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}

(global as any).BroadcastChannel = ChannelMock;
(global as any).window = {};
(global as any).navigator = {};
(global as any).alert = (data) => {
  console.log("err by alert: ", data);
};
class WebSocket {
  constructor(url) {}
  onopen() {}
  onmessage() {}
  onclose() {}
}
(global as any).WebSocket = WebSocket;
