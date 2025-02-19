import { Router, MessageRequester, BACKGROUND_PORT } from "@owallet/router";
import {
  InteractionForegroundHandler,
  interactionForegroundInit,
  InteractionForegroundService,
  InteractionWaitingData,
  ApproveInteractionMsg,
  ApproveInteractionV2Msg,
  RejectInteractionMsg,
  RejectInteractionV2Msg,
  GetInteractionWaitingDataArrayMsg,
} from "@owallet/background";
import {
  action,
  observable,
  makeObservable,
  flow,
  toJS,
  runInAction,
} from "mobx";
import { computedFn } from "mobx-utils";

export class InteractionStore implements InteractionForegroundHandler {
  @observable
  protected _isInitialized: boolean = false;
  @observable.shallow
  public data: InteractionWaitingData[] = [];
  @observable.shallow
  protected obsoleteData = new Map<string, boolean>();

  constructor(
    protected readonly router: Router,
    protected readonly msgRequester: MessageRequester,
    protected readonly afterInteraction?: (
      next: (InteractionWaitingData & { uri: string }) | undefined
    ) => void,
    protected readonly onDataReceived?: (
      data: InteractionWaitingData[]
    ) => Promise<InteractionWaitingData[]>,
    protected readonly onDataChanged?: (
      old: InteractionWaitingData[],
      fresh: InteractionWaitingData[]
    ) => void,
    protected readonly pingHandler?: (
      windowId: number | undefined,
      ignoreWindowIdAndForcePing: boolean
    ) => Promise<boolean>
  ) {
    makeObservable(this);

    const service = new InteractionForegroundService(this, pingHandler);
    interactionForegroundInit(router, service);

    this.init();
  }

  async init(): Promise<void> {
    await this.refreshData();

    runInAction(() => {
      this._isInitialized = true;
    });
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  protected async refreshData(): Promise<void> {
    const prevKey = this.data.map((d) => d.id).join("/");
    let data = await this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new GetInteractionWaitingDataArrayMsg()
    );
    if (this.onDataReceived) {
      data = await this.onDataReceived(data);
    }
    const newKey = data.map((d) => d.id).join("/");
    if (prevKey !== newKey) {
      const prev = this.data.slice();
      runInAction(() => {
        this.data = data;
      });

      if (this.onDataChanged) {
        this.onDataChanged(prev, data.slice());
      }
    }
  }

  getAllData = computedFn(
    <T = unknown>(type: string): InteractionWaitingData<T>[] => {
      return toJS(
        this.data.filter((d) => d.type === type)
      ) as InteractionWaitingData<T>[];
    }
  );

  getData = computedFn(
    <T = unknown>(id: string): InteractionWaitingData<T> | undefined => {
      return this.data.find((d) => d.id === id) as InteractionWaitingData<T>;
    }
  );

  @action
  onInteractionDataReceived() {
    // no need to await.
    this.refreshData();
  }

  @action
  onEventDataReceived() {
    // noop
  }

  /**
   * @param type
   * @param id
   * @param result
   * @param afterFn
   */
  @flow
  *approveWithProceedNext(
    id: string,
    result: unknown,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    const d = this.getData(id);
    if (!d || this.isObsoleteInteraction(id)) {
      return;
    }

    this.markAsObsolete(id);
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new ApproveInteractionMsg(id, result)
    );
    yield this.delay(100);
    yield afterFn(this.hasOtherData(id));
    this.removeData(id);

    if (this.afterInteraction) {
      const next = this.data[0];
      this.afterInteraction(next);
    }
  }

  /**
   * @param type
   * @param id
   * @param result
   * @param afterFn
   */
  @flow
  *approveWithProceedNextV2(
    ids: string | string[],
    result: unknown,
    afterFn: (proceedNext: boolean) => void | Promise<void>,
    options: {
      preDelay?: number;
      postDelay?: number;
    } = {}
  ) {
    if (typeof ids === "string") {
      ids = [ids];
    }

    const fresh: string[] = [];

    for (const id of ids) {
      const d = this.getData(id);
      if (!d || this.isObsoleteInteraction(id)) {
        continue;
      }

      this.markAsObsolete(id);

      fresh.push(id);
    }

    if (options.preDelay && options.preDelay > 0) {
      yield new Promise((resolve) => setTimeout(resolve, options.preDelay));
    }

    const promises: Promise<unknown>[] = [];
    for (const id of fresh) {
      promises.push(
        this.msgRequester.sendMessage(
          BACKGROUND_PORT,
          new ApproveInteractionV2Msg(id, result)
        )
      );
    }

    yield Promise.all(promises);

    if (options.postDelay == null || options.postDelay > 0) {
      yield this.delay(options.postDelay ?? 50);
    }
    yield afterFn(this.hasOtherData(ids));
    this.removeData(ids);

    if (this.afterInteraction) {
      const next = this.data[0];
      this.afterInteraction(next);
    }
  }

  /**
   * @param type
   * @param id
   * @param afterFn
   */
  @flow
  *rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    const d = this.getData(id);
    if (!d || this.isObsoleteInteraction(id)) {
      return;
    }

    this.markAsObsolete(id);
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new RejectInteractionMsg(id)
    );
    yield this.delay(100);
    yield afterFn(this.hasOtherData(id));
    this.removeData(id);

    if (this.afterInteraction) {
      const next = this.data[0];
      this.afterInteraction(next);
    }
  }

  /**
   * @param type
   * @param id
   * @param afterFn
   */
  @flow
  *rejectWithProceedNextV2(
    ids: string | string[],
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    if (typeof ids === "string") {
      ids = [ids];
    }

    const fresh: string[] = [];

    for (const id of ids) {
      const d = this.getData(id);
      if (!d || this.isObsoleteInteraction(id)) {
        continue;
      }

      this.markAsObsolete(id);

      fresh.push(id);
    }

    const promises: Promise<unknown>[] = [];
    for (const id of fresh) {
      promises.push(
        this.msgRequester.sendMessage(
          BACKGROUND_PORT,
          new RejectInteractionV2Msg(id)
        )
      );
    }

    yield Promise.all(promises);

    yield this.delay(50);
    yield afterFn(this.hasOtherData(ids));
    this.removeData(ids);

    if (this.afterInteraction) {
      const next = this.data[0];
      this.afterInteraction(next);
    }
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  @flow
  *rejectAll(type: string) {
    const data = this.getAllData(type);
    for (const d of data) {
      if (this.isObsoleteInteraction(d.id)) {
        continue;
      }
      yield this.msgRequester.sendMessage(
        BACKGROUND_PORT,
        new RejectInteractionMsg(d.id)
      );
      this.removeData(d.id);
    }
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    if (!id) {
      return false;
    }
    return this.obsoleteData.get(id) ?? false;
  }

  @action
  protected removeData(ids: string | string[]) {
    if (typeof ids === "string") {
      ids = [ids];
    }

    for (const id of ids) {
      this.data = this.data.filter((d) => d.id !== id);
      this.obsoleteData.delete(id);
    }
  }

  @action
  protected markAsObsolete(id: string) {
    if (this.getData(id)) {
      this.obsoleteData.set(id, true);
    }
  }

  protected hasOtherData(ids: string | string[]): boolean {
    if (typeof ids === "string") {
      ids = [ids];
    }

    const find = this.data.find((data) => {
      return !ids.includes(data.id);
    });
    return !!find;
  }
}
