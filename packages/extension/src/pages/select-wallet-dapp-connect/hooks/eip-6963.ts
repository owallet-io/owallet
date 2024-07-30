import { ICON_OWALLET } from "@owallet/common";
import {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from "@owallet/types";
import { v4 } from "uuid";
const uuid = v4();
let providers: EIP6963ProviderInfo[] = [
  {
    name: "OWallet",
    icon: ICON_OWALLET,
    rdns: "com.io.owallet",
    uuid,
  },
];
export const eip6963 = {
  value: () => providers,
  subscribe: (callback: () => void) => {
    function onAnnouncement(info: EIP6963ProviderInfo) {
      console.log(info, "info");
      if (providers.map((p) => p.rdns).includes(info.rdns)) return;
      providers = [...providers, info];
      callback();
    }
    // window.addEventListener("eip6963:announceProvider", onAnnouncement);
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.walletData) {
        onAnnouncement(message.walletData);
        console.log("walletData:", message.walletData);
      }
    });
    return () => null;
    // return () => window.removeEventListener("eip6963:announceProvider", onAnnouncement);
  },
};
