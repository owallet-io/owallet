import { Router, MessageRequester, BACKGROUND_PORT } from "@owallet/router";
import {
  InteractionForegroundHandler,
  interactionForegroundInit,
  InteractionForegroundService,
  InteractionWaitingData,
  ApproveInteractionMsg,
  RejectInteractionMsg,
  GetInteractionWaitingDataArrayMsg,
  RejectInteractionV2Msg,
  ApproveInteractionV2Msg,
} from "@owallet/background";
import {
  action,
  observable,
  IObservableArray,
  makeObservable,
  flow,
  toJS,
  runInAction,
} from "mobx";
import { computedFn } from "mobx-utils";

export class InteractionStore implements InteractionForegroundHandler {
  @observable
  protected _isInitialized: boolean = false;

  // TODO: 일단 빠르게 개발해보려고 얘를 public으로 바꿨지만 적절한 방식이 아니다. 좀 더 고민해본다...
  @observable.shallow
  protected datas: Map<string, InteractionWaitingData[]> = new Map();

  @observable.shallow
  public data: InteractionWaitingData[] = [];

  @observable.shallow
  protected events: Map<
    string,
    Omit<InteractionWaitingData, "id" | "isInternal">[]
  > = new Map();

  // 원래 obsolete에 대한 정보를 data 밑의 field에 포함시켰는데
  // obsolete 처리가 추가되기 전에는 data는 한번 받으면 그 이후에 변화되지 않는다는 가정으로 다른 로직이 짜여졌었다.
  // ref도 변하면 안됐기 때문에 obsolete가 data 밑에 있으면 이러한 요구사항을 이루면서 처리할 수가 없다.
  // (특히 서명 페이지에서 문제가 될 수 있음)
  // 기존의 로직과의 호환성을 위해서 아예 분리되었음.
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
    // maybe we need a type here
    // this.datas should be an array instead of a map
    // !!!!!!!!!!!!
    await this.refreshData();

    runInAction(() => {
      this._isInitialized = true;
    });
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  // getDatas<T = unknown>(type?: string): InteractionWaitingData<T>[] {
  //   if (type) {
  //     return toJS(this.datas.get(type) as InteractionWaitingData<T>[]) ?? [];
  //   } else {
  //     return [];
  //   }
  // }

  getDatas = computedFn(
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

  getEvents<T = unknown>(
    type: string
  ): Omit<InteractionWaitingData<T>, "id" | "isInternal">[] {
    return (
      toJS(
        this.events.get(type) as Omit<
          InteractionWaitingData<T>,
          "id" | "isInternal"
        >[]
      ) ?? []
    );
  }

  // protected async refreshData(type?): Promise<void> {
  //   // 어차피 interaction data는 한번 생성되면 값이 바뀌지 않도록 만들어져있고
  //   // id는 겹칠 수 없기 때문에 이걸 key로 사용한다.
  //   // refresh한 이후에 값이 바뀐게 아니라면 ref도 바꾸지 않기 위해서 값 자체를 바꾸지 않는다.
  //   const prevKey = this.getDatas(type)
  //     .map(d => d.id)
  //     .join('/');

  //   let dataMap = await this.msgRequester.sendMessage(BACKGROUND_PORT, new GetInteractionWaitingDataArrayMsg());
  //   if (this.onDataReceived) {
  //     console.log('onDataReceived', dataMap);
  //     dataMap = await this.onDataReceived(dataMap);
  //   }
  //   const newKey = dataMap.map(d => d.id).join('/');

  //   if (prevKey !== newKey) {
  //     const prev = this.getDatas(type).slice();
  //     runInAction(() => {
  //       // this.datas = new Map();
  //     });

  //     if (this.onDataChanged) {
  //       console.log('dataMap', dataMap);

  //       this.onDataChanged(prev, dataMap.slice());
  //     }
  //   }
  // }

  protected async refreshData(): Promise<void> {
    // 어차피 interaction data는 한번 생성되면 값이 바뀌지 않도록 만들어져있고
    // id는 겹칠 수 없기 때문에 이걸 key로 사용한다.
    // refresh한 이후에 값이 바뀐게 아니라면 ref도 바꾸지 않기 위해서 값 자체를 바꾸지 않는다.
    const prevKey = this.data.map((d) => d.id).join("/");
    let data = await this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new GetInteractionWaitingDataArrayMsg()
    );
    if (this.onDataReceived) {
      console.log("onDataReceived", data);
      data = await this.onDataReceived(data);
    }
    const newKey = data.map((d) => d.id).join("/");
    if (prevKey !== newKey) {
      const prev = this.data.slice();
      runInAction(() => {
        this.data = data;
      });

      if (this.onDataChanged) {
        console.log("onDataChanged", prev);
        this.onDataChanged(prev, data.slice());
      }
    }
  }

  @action
  onInteractionDataReceived(data) {
    console.log("data onInteractionDataReceived", data);

    this.refreshData();
    if (!this.datas.has(data.type)) {
      this.datas.set(
        data.type,
        observable.array([], {
          deep: false,
        })
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.datas.get(data.type)!.push(data);
  }

  @action
  onEventDataReceived(data: Omit<InteractionWaitingData, "id" | "isInternal">) {
    if (!this.events.has(data.type)) {
      this.events.set(
        data.type,
        observable.array([], {
          deep: false,
        })
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.events.get(data.type)!.push(data);
  }

  // @flow
  // *approve(type: string, id: string, result: unknown) {
  //   this.removeData(type, id);
  //   yield this.msgRequester.sendMessage(BACKGROUND_PORT, new ApproveInteractionMsg(id, result));
  // }

  @flow
  *approve(type: string, id: string, result: unknown) {
    this.removeData(id);
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new ApproveInteractionMsg(id, result)
    );
  }

  /**
   * Approve the interaction without removing the data on the store.
   * Actually, this method is used for the sign interaction to wait the actual signing ends.
   * You should make sure that remove the data manually.
   * @param id
   * @param result
   */
  @flow
  *approveWithoutRemovingData(id: string, result: unknown) {
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new ApproveInteractionMsg(id, result)
    );
  }

  // @flow
  // *reject(type: string, id: string) {
  //   this.removeData(type, id);
  //   yield this.msgRequester.sendMessage(BACKGROUND_PORT, new RejectInteractionMsg(id));
  // }

  @flow
  *reject(type: string, id: string) {
    this.removeData(id);
    yield this.msgRequester.sendMessage(
      BACKGROUND_PORT,
      new RejectInteractionMsg(id)
    );
  }

  // @flow
  // *rejectAll(type: string) {
  //   const datas = this.getDatas(type);

  //   for (const data of datas) {
  //     yield this.reject(data.type, data.id);
  //   }
  // }

  // @action
  // removeData(type: string, id: string) {
  //   if (this.datas.has(type)) {
  //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //     const find = this.datas.get(type)!.find(data => {
  //       return data.id === id;
  //     });

  //     if (find) {
  //       (this.datas.get(type) as IObservableArray<InteractionWaitingData>).remove(find);
  //     }
  //   }
  // }

  /**
   * 웹페이지에서 어떤 API를 요청해서 extension이 켜졌을때
   * extension에서 요청을 처리하고 바로 팝업을 닫으면
   * 이후에 연속적인 api 요청의 경우 다시 페이지가 열려야하는데 이게 은근히 어색한 UX를 만들기 때문에
   * 이를 대충 해결하기 위해서 approve 이후에 대충 조금 기다리고 남은 interaction이 있느냐 아니냐에 따라 다른 처리를 한다.
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
   * 웹페이지에서 어떤 API를 요청해서 extension이 켜졌을때
   * extension에서 요청을 처리하고 바로 팝업을 닫으면
   * 이후에 연속적인 api 요청의 경우 다시 페이지가 열려야하는데 이게 은근히 어색한 UX를 만들기 때문에
   * 이를 대충 해결하기 위해서 approve 이후에 대충 조금 기다리고 남은 interaction이 있느냐 아니냐에 따라 다른 처리를 한다.
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
   * 웹페이지에서 어떤 API를 요청해서 extension이 켜졌을때
   * extension에서 요청을 처리하고 바로 팝업을 닫으면
   * 이후에 연속적인 api 요청의 경우 다시 페이지가 열려야하는데 이게 은근히 어색한 UX를 만들기 때문에
   * 이를 대충 해결하기 위해서 approve 이후에 대충 조금 기다리고 남은 interaction이 있느냐 아니냐에 따라 다른 처리를 한다.
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
   * 웹페이지에서 어떤 API를 요청해서 extension이 켜졌을때
   * extension에서 요청을 처리하고 바로 팝업을 닫으면
   * 이후에 연속적인 api 요청의 경우 다시 페이지가 열려야하는데 이게 은근히 어색한 UX를 만들기 때문에
   * 이를 대충 해결하기 위해서 approve 이후에 대충 조금 기다리고 남은 interaction이 있느냐 아니냐에 따라 다른 처리를 한다.
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
    const data = this.getDatas(type);
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

  // UI에서 좀 더 편하게 쓸 수 있게 하려고 undefined도 파라미터로 허용함.
  isObsoleteInteraction(id: string | undefined): boolean {
    if (!id) {
      return false;
    }
    return this.obsoleteData.get(id) ?? false;
  }

  @action
  // protected removeData(ids: string | string[]) {
  removeData(ids: string | string[]) {
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

  hasOtherData(ids: string | string[]): boolean {
    if (typeof ids === "string") {
      ids = [ids];
    }

    const find = this.data.find((data) => {
      console.log("data.id", data.id);

      return !ids.includes(data.id);
    });
    return !!find;
  }

  @action
  clearEvent(type: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.events.has(type) && this.events.get(type)!.length > 0) {
      this.events.set(
        type,
        observable.array([], {
          deep: false,
        })
      );
    }
  }
}
