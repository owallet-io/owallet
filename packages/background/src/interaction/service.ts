import { singleton, inject } from "tsyringe";
import { TYPES } from "../types";
import { InteractionWaitingData } from "./types";
import {
  Env,
  FnRequestInteractionOptions,
  MessageRequester,
  OWalletError,
  APP_PORT,
} from "@owallet/router";
import {
  InteractionPingMsg,
  PushEventDataMsg,
  PushInteractionDataMsg,
} from "./foreground";
import { autorun } from "mobx";
import { SidePanelService } from "../side-panel";

@singleton()
export class InteractionService {
  protected waitingMap: Map<string, InteractionWaitingData> = new Map();
  protected resolverMap: Map<
    string,
    { onApprove: (result: unknown) => void; onReject: (e: Error) => void }
  > = new Map();
  protected resolverV2Map: Map<
    string,
    {
      resolver: () => void;
    }[]
  > = new Map();

  protected isUIOpenedOnSidePanelMap: Map<string, boolean> = new Map();
  constructor(
    @inject(TYPES.EventMsgRequester)
    protected readonly eventMsgRequester: MessageRequester,
    @inject(TYPES.SidePanelService)
    protected readonly sidePanelService: SidePanelService,
    @inject(TYPES.ExtensionMessageRequesterToUI)
    protected readonly extensionMessageRequesterToUI?: MessageRequester
  ) {}

  async init(): Promise<void> {
    let prevSidePanelEnabled = this.sidePanelService.getIsEnabled();
    autorun(() => {
      const enabled = this.sidePanelService.getIsEnabled();
      if (prevSidePanelEnabled !== enabled) {
        prevSidePanelEnabled = enabled;

        const data = this.waitingMap.values();
        for (const d of data) {
          this.rejectV2(d.id);
        }
      }
    });
  }

  getInteractionWaitingDataArray(): InteractionWaitingData[] {
    return Array.from(this.waitingMap.values());
  }

  // Dispatch the event to the frontend. Don't wait any interaction.
  // And, don't ensure that the event is delivered successfully, just ignore the any errors.
  dispatchEvent(port: string, type: string, data: unknown) {
    if (!type) {
      throw new OWalletError("interaction", 101, "Type should not be empty");
    }

    const msg = new PushEventDataMsg({
      type,
      data,
    });

    this.eventMsgRequester.sendMessage(port, msg).catch((e) => {
      console.log(`Failed to send the event to ${port}: ${e.message}`);
    });
  }

  async waitApprove(
    env: Env,
    uri: string,
    type: string,
    data: unknown,
    options?: Omit<FnRequestInteractionOptions, "unstableOnClose">
  ): Promise<unknown> {
    if (!type) {
      throw new OWalletError("interaction", 101, "Type should not be empty");
    }

    // TODO: Add timeout?
    const interactionWaitingData = this.addDataToMap(
      type,
      env.isInternalMsg,
      env.sender?.tab?.id,
      await this.getWindowIdFromEnvOrCurrentWindowId(env),
      uri,
      data
    );
    console.log("interactionWaitingData waitApproveV1", interactionWaitingData);
    return await this.wait(env, interactionWaitingData, options);
  }

  async waitApproveV2<Return, Response>(
    env: Env,
    uri: string,
    type: string,
    data: unknown,
    returnFn: (response: Response) => Promise<Return> | Return,
    options?: Omit<FnRequestInteractionOptions, "unstableOnClose">
  ): Promise<Return> {
    if (!type) {
      throw new OWalletError("interaction", 101, "Type should not be empty");
    }

    // TODO: Add timeout?
    const interactionWaitingData = this.addDataToMap(
      type,
      env.isInternalMsg,
      env.sender?.tab?.id,
      await this.getWindowIdFromEnvOrCurrentWindowId(env),
      uri,
      data
    );

    console.log("interactionWaitingData waitApproveV2", interactionWaitingData);

    try {
      const response: any = await this.wait(
        env,
        interactionWaitingData,
        options
      );
      return returnFn(response);
    } finally {
      const resolvers = this.resolverV2Map.get(interactionWaitingData.id);
      if (resolvers) {
        for (const resolver of resolvers) {
          resolver.resolver();
        }
      }
      this.resolverV2Map.delete(interactionWaitingData.id);
    }
  }

  protected async wait(
    env: Env,
    data: InteractionWaitingData,
    options?: Omit<
      FnRequestInteractionOptions,
      "unstableOnClose" | "ignoreURIReplacement"
    >
  ): Promise<unknown> {
    const msg = new PushInteractionDataMsg(data);

    const id = msg.data.id;
    if (this.resolverMap.has(id)) {
      throw new OWalletError("interaction", 100, "Id is aleady in use");
    }

    return new Promise<unknown>((resolve, reject) => {
      this.resolverMap.set(id, {
        onApprove: resolve,
        onReject: reject,
      });

      if (env.isInternalMsg) {
        env.requestInteraction(data.uri, msg, {
          ...options,
          unstableOnClose: () => {
            this.reject(id);
          },
        });
      } else {
        if (this.sidePanelService.getIsEnabled()) {
          if (this.extensionMessageRequesterToUI) {
            this.extensionMessageRequesterToUI.sendMessage(APP_PORT, msg);
            console.log("extensionMessageRequesterToUI", msg);
          }
        } else {
          env.requestInteraction("", msg, {
            ...options,
            unstableOnClose: () => {
              this.reject(id);
            },
            ignoreURIReplacement: true,
          });
        }
      }
    });
  }

  approve(id: string, result: unknown) {
    if (this.resolverMap.has(id)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.resolverMap.get(id)!.onApprove(result);
      this.resolverMap.delete(id);
    }

    this.removeDataFromMap(id);
  }

  approveV2(id: string, result: unknown): Promise<void> {
    return new Promise((resolve) => {
      const resolvers = this.resolverV2Map.get(id) || [];
      resolvers.push({
        resolver: resolve,
      });
      this.resolverV2Map.set(id, resolvers);

      if (this.resolverMap.has(id)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.resolverMap.get(id)!.onApprove(result);
        this.resolverMap.delete(id);
      }

      this.removeDataFromMap(id);
    });
  }

  reject(id: string) {
    if (this.resolverMap.has(id)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.resolverMap.get(id)!.onReject(new Error("Request rejected"));
      this.resolverMap.delete(id);
    }

    this.removeDataFromMap(id);
  }

  rejectV2(id: string): Promise<void> {
    return new Promise((resolve) => {
      const resolvers = this.resolverV2Map.get(id) || [];
      resolvers.push({
        resolver: resolve,
      });
      this.resolverV2Map.set(id, resolvers);

      if (this.resolverMap.has(id)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.resolverMap.get(id)!.onReject(new Error("Request rejected"));
        this.resolverMap.delete(id);
      }

      this.removeDataFromMap(id);
    });
  }

  protected addDataToMap(
    type: string,
    isInternal: boolean,
    tabId: number | undefined,
    windowId: number | undefined,
    uri: string,
    data: unknown
  ): InteractionWaitingData {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    const id = Buffer.from(bytes).toString("hex");

    const interactionWaitingData: InteractionWaitingData = {
      id,
      type,
      isInternal,
      tabId,
      windowId,
      data,
      uri,
    };

    console.log("interactionWaitingData background", interactionWaitingData);

    if (this.waitingMap.has(id)) {
      throw new OWalletError("interaction", 100, "Id is aleady in use");
    }

    const wasEmpty = this.waitingMap.size === 0;

    this.waitingMap.set(id, interactionWaitingData);

    if (wasEmpty && this.extensionMessageRequesterToUI) {
      // should not wait
      if (this.sidePanelService.getIsEnabled()) {
        this.startCheckPingOnUIWithWindowId();
      }
      this.startCheckPingOnUI();
    }
    return interactionWaitingData;
  }

  protected async startCheckPingOnUIWithWindowId() {
    const pingStateMap = new Map<
      number,
      {
        wasPingSucceeded: boolean;
      }
    >();

    while (this.waitingMap.size > 0 && this.extensionMessageRequesterToUI) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const windowIds = this.sidePanelService.getIsEnabled()
        ? new Set(Array.from(this.waitingMap.values()).map((w) => w.windowId))
        : new Set([-1]);

      for (const windowId of windowIds) {
        if (windowId == null) {
          continue;
        }

        const data = Array.from(this.waitingMap.values()).filter(
          (w) => w.windowId === windowId
        );
        const wasPingSucceeded = (() => {
          if (pingStateMap.has(windowId)) {
            return pingStateMap.get(windowId)!.wasPingSucceeded;
          } else {
            pingStateMap.set(windowId, {
              wasPingSucceeded: false,
            });
            return false;
          }
        })();

        let succeeded = false;
        try {
          const res = await this.extensionMessageRequesterToUI!.sendMessage(
            APP_PORT,
            // XXX: popup에서는 위에 로직에서 window id를 -1로 대충 처리 했었다.
            new InteractionPingMsg(
              windowId === -1 ? undefined : windowId,
              false
            )
          );

          if (res) {
            succeeded = true;
          }
        } catch (e) {
          console.log(e, windowId);
        }

        if (wasPingSucceeded && !succeeded) {
          // UI가 꺼진 것으로 판단한다.
          // 그래서 모든 interaction을 reject한다.
          for (const d of data) {
            this.rejectV2(d.id);
          }
          break;
        }

        if (!wasPingSucceeded && succeeded) {
          pingStateMap.set(windowId, {
            wasPingSucceeded: true,
          });
          for (const d of data) {
            this.isUIOpenedOnSidePanelMap.set(d.id, true);
          }
        }
      }
    }
  }

  protected async startCheckPingOnUI() {
    let wasPingSucceeded = false;

    while (this.waitingMap.size > 0 && this.extensionMessageRequesterToUI) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      let succeeded = false;
      try {
        const res = await this.extensionMessageRequesterToUI!.sendMessage(
          APP_PORT,
          new InteractionPingMsg(0, true)
        );
        if (res) {
          succeeded = true;
        }
      } catch (e) {
        console.log(e);
      }

      if (wasPingSucceeded && !succeeded) {
        const data = this.waitingMap.values();

        for (const d of data) {
          this.rejectV2(d.id);
        }
        break;
      }

      if (!wasPingSucceeded && succeeded) {
        wasPingSucceeded = true;
      }
    }
  }

  onInjectedWebpageClosed(env: Env) {
    if (env.sender.tab?.id && this.sidePanelService.getIsEnabled()) {
      for (const interaction of this.waitingMap.values()) {
        if (
          interaction.tabId === env.sender.tab.id &&
          !this.isUIOpenedOnSidePanelMap.get(interaction.id)
        ) {
          this.rejectV2(interaction.id);
        }
      }
    }
  }

  async pingContentScriptTabHasOpenedSidePanel(
    tabId: number
  ): Promise<boolean> {
    if (!this.sidePanelService.getIsEnabled()) {
      return false;
    }

    if (!this.extensionMessageRequesterToUI) {
      return false;
    }

    const tab = await browser.tabs.get(tabId);
    if (tab.windowId == null) {
      return false;
    }

    try {
      return await this.extensionMessageRequesterToUI.sendMessage(
        APP_PORT,
        new InteractionPingMsg(tab.windowId, false)
      );
    } catch {
      return false;
    }
  }

  protected async getWindowIdFromEnvOrCurrentWindowId(
    env: Env
  ): Promise<number | undefined> {
    if (
      typeof browser === "undefined" ||
      typeof browser.windows === "undefined" ||
      typeof browser.tabs === "undefined"
    ) {
      return;
    }

    const current = (await browser.windows.getCurrent()).id;
    if (!env.sender.tab || !env.sender.tab.id) {
      return current;
    }

    const tab = await browser.tabs.get(env.sender.tab.id);

    return tab.windowId || current;
  }

  protected removeDataFromMap(id: string) {
    this.waitingMap.delete(id);
    this.isUIOpenedOnSidePanelMap.delete(id);
  }
}
