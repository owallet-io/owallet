import "./src/background/background";

import { version } from "./package.json";
import { Ethereum, Oasis, OWallet, TronWeb } from "@owallet/provider";
import { RNMessageRequesterInternal } from "./src/router";
import { ChainIdEnum } from "@owallet/common";

import { Mixpanel } from "mixpanel-react-native";
if (process.env.MIX_PANEL_TOKEN && !__DEV__) {
  const trackAutomaticEvents = true;
  const mixpanel = new Mixpanel(
    process.env.MIX_PANEL_TOKEN,
    trackAutomaticEvents
  );

  mixpanel.init();
  globalThis.mixpanel = mixpanel;
}

//@ts-ignore
window.owallet = new OWallet(version, "core", new RNMessageRequesterInternal());
//@ts-ignore
window.oasis = new Oasis(
  version,
  "core",
  ChainIdEnum.Oasis,
  new RNMessageRequesterInternal()
);
//@ts-ignore
window.ethereum = new Ethereum(
  version,
  "core",
  ChainIdEnum.Ethereum,
  new RNMessageRequesterInternal()
);
//@ts-ignore
window.tronWeb = new TronWeb(
  version,
  "core",
  ChainIdEnum.TRON,
  new RNMessageRequesterInternal()
);
