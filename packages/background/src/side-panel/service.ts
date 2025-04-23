import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { isServiceWorker, KVStore } from "@owallet/common";
import { AnalyticsService } from "../analytics";

export class SidePanelService {
  @observable
  protected _isEnabled: boolean = false;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly analyticsService: AnalyticsService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    {
      const saved = await this.kvStore.get<boolean>("sidePanel.isEnabled");
      if (saved) {
        runInAction(() => {
          this._isEnabled = saved;
        });
      }

      autorun(() => {
        this.kvStore.set<boolean>("sidePanel.isEnabled", this._isEnabled);
      });

      autorun(() => {
        // XXX: Note that setPanelBehavior() uses this._isEnabled, which is observable,
        //      so it will automatically react to changes.
        this.setPanelBehavior().catch(console.log);
      });
    }

    autorun(() => {
      // Must be called here because _enabled needs to be observed.
      const enabled = this.getIsEnabled();

      (async () => {
        let skip = false;

        // In service worker, background can repeatedly go through active/inactive states,
        // so without this handling, it could generate constant requests.
        if (isServiceWorker()) {
          const saved = await browser.storage.session.get(
            "side_panel_analytics"
          );
          if (saved["side_panel_analytics"] === enabled) {
            skip = true;
          }
        }

        if (!skip) {
          this.analyticsService.logEventIgnoreError("side_panel", {
            enabled,
          });
          if (isServiceWorker()) {
            await browser.storage.session.set({
              ["side_panel_analytics"]: enabled,
            });
          }
        }
      })();
    });
  }

  @action
  setIsEnabled(isEnabled: boolean): void {
    this._isEnabled = isEnabled;
  }

  getIsEnabled(): boolean {
    if (!this.isSidePanelSupported()) {
      return false;
    }

    return this._isEnabled;
  }

  isSidePanelSupported(): boolean {
    // Side panel doesn't work without manifest v3
    if (!isServiceWorker()) {
      return false;
    }

    try {
      // Cast to any because navigator.userAgentData is experimental
      const anyNavigator = navigator as any;
      if ("userAgentData" in anyNavigator) {
        const brandNames: string[] = anyNavigator.userAgentData.brands.map(
          (brand: { brand: string; version: string }) => brand.brand
        );

        // Even if the side panel API exists, it doesn't work in all web browsers...
        // For now, only allow browsers that have been confirmed to support it
        if (
          !brandNames.includes("Google Chrome") &&
          !brandNames.includes("Microsoft Edge") &&
          !brandNames.includes("Brave")
        ) {
          return false;
        }
      }
    } catch (e) {
      console.log(e);
      return false;
    }

    return (
      typeof chrome !== "undefined" && typeof chrome.sidePanel !== "undefined"
    );
  }

  protected async setPanelBehavior(): Promise<void> {
    if (this._isEnabled) {
      if (this.isSidePanelSupported()) {
        await chrome.sidePanel.setPanelBehavior({
          openPanelOnActionClick: true,
        });
      }
    } else {
      if (this.isSidePanelSupported()) {
        await chrome.sidePanel.setPanelBehavior({
          openPanelOnActionClick: false,
        });
      }
    }
  }
}
