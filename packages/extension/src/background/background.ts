import { BACKGROUND_PORT } from "@owallet/router";
import {
  ExtensionRouter,
  ExtensionGuards,
  ExtensionEnv,
  ContentScriptMessageRequester,
} from "@owallet/router-extension";
import { ExtensionKVStore } from "@owallet/common";
import { init, Ledger, ScryptParams } from "@owallet/background";
import { scrypt } from "@owallet/crypto";
import { Buffer } from "buffer";

import { EmbedChainInfos, PrivilegedOrigins } from "@owallet/common";

const router = new ExtensionRouter(ExtensionEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "test-wallet-id") {
    console.log(message.msg.data, "message.msg.data");
    // chrome.runtime.sendMessage({ walletId: message.msg.data });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      // chrome.scripting.executeScript({
      //   target: { tabId: tab.id },
      //   function: (msgData) => {
      //     window.postMessage({ type: "FROM_EXTENSION", msgData }, "*");
      //   },
      //   args: [{ walletId: message.msg.data }]
      // });
    });
  }
});
init(
  router,
  (prefix: string) => new ExtensionKVStore(prefix),
  new ContentScriptMessageRequester(),
  EmbedChainInfos,
  PrivilegedOrigins,
  (array) => {
    return Promise.resolve(crypto.getRandomValues(array));
  },
  {
    scrypt: async (text: string, params: ScryptParams) => {
      const buf = await scrypt(text, Buffer.from(params.salt, "hex"), {
        dkLen: params.dklen,
        N: params.n,
        r: params.r,
        p: params.p,
        encoding: "binary",
      });

      return buf;
    },
  },
  {
    create: (params: {
      iconRelativeUrl?: string;
      title: string;
      message: string;
    }) => {
      browser.notifications.create({
        type: "basic",
        iconUrl: params.iconRelativeUrl
          ? browser.runtime.getURL(params.iconRelativeUrl)
          : undefined,
        title: params.title,
        message: params.message,
      });
    },
  },
  {
    defaultMode: "webhid",
  }
);

router.listen(BACKGROUND_PORT);

// @ts-ignore
window.Ledger = Ledger;
