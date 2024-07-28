import { WEBPAGE_PORT } from "@owallet/router";
import {
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionRouter,
  InExtensionMessageRequester,
} from "@owallet/router-extension";
import {
  OWallet,
  InjectedOWallet,
  Ethereum,
  InjectedEthereum,
  InjectedTronWebOWallet,
  TronWeb,
  InjectedBitcoin,
  Bitcoin,
} from "@owallet/provider";
import { initEvents } from "./events";
import { v4 } from "uuid";
import manifest from "../manifest.json";
import { ICON_OWALLET } from "@owallet/common";
import { EIP6963ProviderDetail } from "@owallet/types";

InjectedOWallet.startProxy(
  new OWallet(manifest.version, "core", new InExtensionMessageRequester())
);

InjectedEthereum.startProxy(
  new Ethereum(
    manifest.version,
    "core",
    "0x38",
    new InExtensionMessageRequester()
  )
);
InjectedBitcoin.startProxy(
  new Bitcoin(manifest.version, "core", new InExtensionMessageRequester())
);

InjectedTronWebOWallet.startProxy(
  new TronWeb(
    manifest.version,
    "core",
    "0x2b6653dc",
    new InExtensionMessageRequester()
  )
);

const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
router.addGuard(ContentScriptGuards.checkMessageIsInternal);
initEvents(router);
router.listen(WEBPAGE_PORT);

const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

scriptElement.src = browser.runtime.getURL("injectedScript.bundle.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
