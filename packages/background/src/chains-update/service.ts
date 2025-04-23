import { KVStore, isServiceWorker } from "@owallet/common";
import { ChainsService } from "../chains";
import { ChainsUIService } from "../chains-ui";
import { ChainIdHelper } from "@owallet/cosmos";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";

/**
 * Manages the update schedule for chain information.
 */
export class ChainsUpdateService {
  protected readonly lastUpdateStartTimeMap = new Map<string, number>();

  protected readonly windowsMap = new Map<number, boolean>();
  @observable
  protected onInitUpdateDate:
    | {
        date: Date;
      }
    | undefined = undefined;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly disableUpdateLoop: boolean
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<
      | {
          date: string;
        }
      | undefined
    >("onInitUpdateDate");
    if (saved) {
      runInAction(() => {
        this.onInitUpdateDate = {
          date: new Date(saved.date),
        };
      });
    } else {
      runInAction(() => {
        this.onInitUpdateDate = undefined;
      });
    }
    autorun(() => {
      const js = toJS(this.onInitUpdateDate);
      if (js) {
        this.kvStore.set("onInitUpdateDate", {
          ...js,
          date: js.date.toISOString(),
        });
      } else {
        this.kvStore.set("onInitUpdateDate", null);
      }
    });

    // must not wait
    if (!this.disableUpdateLoop) {
      this.startUpdateLoop();
    }

    this.chainsService.addChainSuggestedHandler((chainInfo) => {
      this.updateChainInfo(chainInfo.chainId).catch((e) => {
        console.log(e);
      });
    });

    this.chainsService.addChainRemovedHandler((chainInfo) => {
      this.updateChainInfo(chainInfo.chainId).catch((e) => {
        console.log(e);
      });
    });

    if (isServiceWorker()) {
      browser.windows.onCreated.addListener((window) => {
        if (window.id != null) {
          this.windowsMap.set(window.id, true);
        }
      });
      browser.windows.onRemoved.addListener((windowId) => {
        let exist = false;
        if (this.windowsMap.get(windowId)) {
          exist = true;
        }
        this.windowsMap.delete(windowId);

        if (this.windowsMap.size === 0 && !exist) {
          runInAction(() => {
            this.onInitUpdateDate = undefined;
          });
        }
      });
    }
  }

  protected startUpdateLoop() {
    // Should not wait
    this.startUpdateChainInfosLoop();
    // Should not wait
    this.startUpdateEnabledChainInfosLoop();
  }

  protected async startUpdateChainInfosLoop(): Promise<void> {
    let isFirst = true;
    while (true) {
      let skip = false;
      if (isFirst && isServiceWorker()) {
        // Service worker can become inactive and then active again due to various issues.
        // In this case, we skip the initial update if the last update time is less than 3 hours ago.
        // onInitUpdateDate becomes undefined when the web browser is closed, so this logic is ignored and update is attempted when the browser is restarted.
        if (this.onInitUpdateDate) {
          const diff = Date.now() - this.onInitUpdateDate.date.getTime();
          if (diff < 3 * 60 * 60 * 1000) {
            skip = true;
          }
        }
      }

      if (!skip) {
        if (isServiceWorker()) {
          runInAction(() => {
            this.onInitUpdateDate = {
              date: new Date(),
            };
          });
        }

        // Update all chain info every 6 hours.
        // The intention is to run an update for all chain info first in init().
        // So we provide the delay later.
        const chainInfos = this.chainsService.getChainInfos();
        for (const chainInfo of chainInfos) {
          // No need to wait
          this.updateChainInfo(chainInfo.chainId).catch((e) => {
            console.log(e);
          });
        }
      }

      isFirst = false;
      await new Promise((resolve) => {
        setTimeout(resolve, 6 * 60 * 60 * 1000);
      });
    }
  }

  protected async startUpdateEnabledChainInfosLoop(): Promise<void> {
    while (true) {
      // Update enabled chain info every hour.
      // The intention is to run an update for all chain info first in init().
      // Since all chain info has already been updated, this doesn't need to run immediately,
      // so we provide the delay first.
      await new Promise((resolve) => {
        setTimeout(resolve, 60 * 60 * 1000);
      });
      const chainIdentifiers = this.chainsUIService.allEnabledChainIdentifiers;
      for (const chainIdentifier of chainIdentifiers) {
        // No need to wait
        this.updateChainInfo(chainIdentifier).catch((e) => {
          console.log(e);
        });
      }
    }
  }

  async tryUpdateAllChainInfos(): Promise<boolean> {
    let updated = false;

    const promises: Promise<void>[] = [];

    const chainIdentifiers = this.chainsService
      .getChainInfos()
      .map((c) => c.chainId);
    for (const chainIdentifier of chainIdentifiers) {
      // No need to wait
      promises.push(
        (async () => {
          const u = await this.updateChainInfo(chainIdentifier);
          if (u) {
            updated = true;
          }
        })()
      );
    }

    await Promise.allSettled(promises);

    return updated;
  }

  async tryUpdateEnabledChainInfos(): Promise<boolean> {
    let updated = false;

    const promises: Promise<void>[] = [];

    const chainIdentifiers = this.chainsUIService.allEnabledChainIdentifiers;
    for (const chainIdentifier of chainIdentifiers) {
      // No need to wait
      promises.push(
        (async () => {
          const u = await this.updateChainInfo(chainIdentifier);
          if (u) {
            updated = true;
          }
        })()
      );
    }

    await Promise.allSettled(promises);

    return updated;
  }

  protected async updateChainInfo(chainId: string): Promise<boolean> {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

    const lastUpdateStartTime =
      this.lastUpdateStartTimeMap.get(chainIdentifier);
    if (
      lastUpdateStartTime &&
      // Skip if update was already attempted within the last 5 minutes.
      Math.abs(Date.now() - lastUpdateStartTime) < 5 * 60 * 1000
    ) {
      return false;
    }
    this.lastUpdateStartTimeMap.set(chainIdentifier, Date.now());

    const chainInfo =
      this.chainsService.getChainInfoWithCoreTypes(chainIdentifier);
    if (!chainInfo) {
      return false;
    }

    let updated1 = false;
    if (!chainInfo.updateFromRepoDisabled) {
      try {
        updated1 = await this.chainsService.tryUpdateChainInfoFromRepo(
          chainIdentifier
        );
      } catch (e) {
        console.log(e);
        // Ignore error to proceed to tryUpdateChainInfoFromRpcOrRest if it fails.
      }
    }

    const updated2 = await this.chainsService.tryUpdateChainInfoFromRpcOrRest(
      chainIdentifier
    );

    return updated1 || updated2;
  }
}
