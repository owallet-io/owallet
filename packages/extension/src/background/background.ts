import { BACKGROUND_PORT } from "@owallet/router";
import {
  ExtensionRouter,
  ExtensionGuards,
  ExtensionEnv,
  ContentScriptMessageRequester,
  InExtensionMessageRequester,
} from "@owallet/router-extension";
import { ExtensionKVStore } from "@owallet/common";
import { init, Ledger, ScryptParams } from "@owallet/background";
import { scrypt } from "@owallet/crypto";
import { Buffer } from "buffer";

import { EmbedChainInfos, PrivilegedOrigins } from "@owallet/common";

const router = new ExtensionRouter(ExtensionEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

init(
  router,
  (prefix: string) => new ExtensionKVStore(prefix),
  new ContentScriptMessageRequester(),
  new InExtensionMessageRequester(),
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
