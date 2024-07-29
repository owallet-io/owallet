import {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
} from "@owallet/types";

let providers: EIP6963ProviderDetail[] = [];
export const eip6963 = {
  value: () => providers,
  subscribe: (callback: () => void) => {
    function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
      console.log(event, "event");
      if (providers.map((p) => p.info.uuid).includes(event.detail.info.uuid))
        return;
      providers = [...providers, event.detail];
      callback();
    }
    window.addEventListener("eip6963:announceProvider", onAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnouncement);
  },
};
