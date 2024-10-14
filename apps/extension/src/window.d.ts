import { Window as OWalletWindow } from "@owallet/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {
    isStartFromInteractionWithSidePanelEnabled: boolean | undefined;
  }
}
