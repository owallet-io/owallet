import { SetSidePanelEnabledMsg } from "@owallet/background";
import { InExtensionMessageRequester } from "@owallet/router-extension";
import { BACKGROUND_PORT } from "@owallet/router";

export const isRunningInSidePanel = (): boolean => {
  return new URL(window.location.href).pathname === "/sidePanel.html";
};

export const handleExternalInteractionWithNoProceedNext = () => {
  if (window.isStartFromInteractionWithSidePanelEnabled) {
    window.close();
  } else {
    if (isRunningInSidePanel()) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    } else {
      window.close();
    }
  }
};

export const toggleSidePanelMode = async (
  enable: boolean,
  onRes: (enabled: boolean) => void
): Promise<void> => {
  const msg = new SetSidePanelEnabledMsg(enable);
  const res = await new InExtensionMessageRequester().sendMessage(
    BACKGROUND_PORT,
    msg
  );
  onRes(res.enabled);

  if (res.enabled) {
    if (
      typeof chrome !== "undefined" &&
      typeof chrome.sidePanel !== "undefined"
    ) {
      const selfCloseId = Math.random() * 100000;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__self_id_for_closing_view_side_panel = selfCloseId;
      const viewsBefore = browser.extension.getViews();

      try {
        const activeTabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (activeTabs.length > 0) {
          const id = activeTabs[0].id;
          if (id != null) {
            await chrome.sidePanel.open({
              tabId: id,
            });
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        for (const view of viewsBefore) {
          if (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.__self_id_for_closing_view_side_panel !== selfCloseId
          ) {
            view.window.close();
          }
        }

        window.close();
      }
    } else {
      window.close();
    }
  } else {
    const selfCloseId = Math.random() * 100000;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__self_id_for_closing_view_side_panel = selfCloseId;
    const views = browser.extension.getViews();

    for (const view of views) {
      if (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__self_id_for_closing_view_side_panel !== selfCloseId
      ) {
        view.window.close();
      }
    }

    window.close();
  }
};
