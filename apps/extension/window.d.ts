import { Window as OWalletWindow } from "@owallet/types";

declare global {
  interface Window extends OWalletWindow {
    isStartFromInteractionWithSidePanelEnabled: boolean | undefined;
  }
}
