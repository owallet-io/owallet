import delay from "delay";
import { InteractionStore } from "./interaction";
import { autorun, computed, flow, makeObservable, observable } from "mobx";
import { StdSignDoc } from "@cosmjs/launchpad";
import { InteractionWaitingData } from "@owallet/background";
import { SignDocWrapper } from "@owallet/cosmos";
import { OWalletSignOptions } from "@owallet/types";

export class SignInteractionStore {
  @observable
  protected _isLoading: boolean = false;

  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);

    autorun(() => {
      // Reject all interactions that is not first one.
      // This interaction can have only one interaction at once.
      const datas = this.waitingDatas.slice();

      if (datas.length > 1) {
        for (let i = 1; i < datas.length; i++) {
          this.rejectWithId(datas[i].id);
        }
      }

      const datasEthereum = this.waitingEthereumDatas?.slice();

      if (datasEthereum.length > 1) {
        for (let i = 1; i < datasEthereum.length; i++) {
          this.rejectWithId(datasEthereum[i].id);
        }
      }
      const datasBitcoin = this.waitingBitcoinDatas?.slice();

      if (datasBitcoin.length > 1) {
        for (let i = 1; i < datasBitcoin.length; i++) {
          this.rejectWithId(datasBitcoin[i].id);
        }
      }
      const datasSvm = this.waitingSvmDatas?.slice();

      if (datasSvm.length > 1) {
        for (let i = 1; i < datasSvm.length; i++) {
          this.rejectWithId(datasSvm[i].id);
        }
      }
      const datasTron = this.waitingTronDatas?.slice();
      if (datasTron.length > 1) {
        for (let i = 1; i < datasTron.length; i++) {
          this.rejectWithId(datasTron[i].id);
        }
      }
    });
  }

  protected get waitingDatas() {
    return this.interactionStore.getDatas<
      | {
          msgOrigin: string;
          chainId: string;
          mode: "amino";
          signer: string;
          signDoc: StdSignDoc;
          signOptions: OWalletSignOptions;
          isADR36SignDoc: boolean;
          isADR36WithString?: boolean;
        }
      | {
          msgOrigin: string;
          chainId: string;
          mode: "direct";
          signer: string;
          signDocBytes: Uint8Array;
          signOptions: OWalletSignOptions;
        }
    >("request-sign");
  }

  protected get waitingEthereumDatas() {
    return this.interactionStore.getDatas<
      | {
          msgOrigin: string;
          chainId: string;
          mode: "direct";
          data;
        }
      | {
          msgOrigin: string;
          chainId: string;
          mode: "direct";
          data: object;
        }
    >("request-sign-ethereum");
  }
  protected get waitingBitcoinDatas() {
    return this.interactionStore.getDatas<
      | {
          msgOrigin: string;
          chainId: string;
          mode: "direct";
          data;
        }
      | {
          msgOrigin: string;
          chainId: string;
          mode: "direct";
          data: object;
        }
    >("request-sign-bitcoin");
  }
  protected get waitingSvmDatas() {
    return this.interactionStore.getDatas<
      | {
          msgOrigin: string;
          chainId: string;
          data;
        }
      | {
          msgOrigin: string;
          chainId: string;
          data: object;
        }
    >("request-sign-svm");
  }
  protected get waitingTronDatas() {
    return this.interactionStore.getDatas<
      | {
          msgOrigin: string;
          chainId: string;
          mode: "direct";
          data: object;
        }
      | {
          msgOrigin: string;
          chainId: string;
          mode: "direct";
          data: object;
        }
    >("request-sign-tron");
  }

  @computed
  get waitingData():
    | InteractionWaitingData<{
        chainId: string;
        msgOrigin: string;
        signer: string;
        signDocWrapper: SignDocWrapper;
        signOptions: OWalletSignOptions;
        isADR36WithString?: boolean;
      }>
    | undefined {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    const data = datas[0];
    const wrapper =
      data.data.mode === "amino"
        ? SignDocWrapper.fromAminoSignDoc(data.data.signDoc)
        : SignDocWrapper.fromDirectSignDocBytes(data.data.signDocBytes);

    return {
      id: data.id,
      type: data.type,
      isInternal: data.isInternal,
      data: {
        chainId: data.data.chainId,
        msgOrigin: data.data.msgOrigin,
        signer: data.data.signer,
        signDocWrapper: wrapper,
        signOptions: data.data.signOptions,
        isADR36WithString:
          "isADR36WithString" in data.data
            ? data.data.isADR36WithString
            : undefined,
      },
    };
  }

  @computed
  get waitingEthereumData():
    | InteractionWaitingData<{
        chainId: string;
        msgOrigin: string;
        data: object;
      }>
    | undefined {
    const datas = this.waitingEthereumDatas;

    if (datas.length === 0) {
      return undefined;
    }

    const data = datas[0];

    return {
      id: data.id,
      type: data.type,
      data: {
        chainId: data.data.chainId,
        msgOrigin: data.data.msgOrigin,
        data: data.data,
      },
      isInternal: data.isInternal,
    };
  }
  @computed
  get waitingBitcoinData():
    | InteractionWaitingData<{
        chainId: string;
        msgOrigin: string;
        data: object;
      }>
    | undefined {
    const datas = this.waitingBitcoinDatas;

    if (datas.length === 0) {
      return undefined;
    }

    const data = datas[0];

    return {
      id: data.id,
      type: data.type,
      data: {
        chainId: data.data.chainId,
        msgOrigin: data.data.msgOrigin,
        data: data.data,
      },
      isInternal: data.isInternal,
    };
  }
  @computed
  get waitingSvmData():
    | InteractionWaitingData<{
        chainId: string;
        msgOrigin: string;
        data: object;
      }>
    | undefined {
    const datas = this.waitingSvmDatas;

    if (datas.length === 0) {
      return undefined;
    }

    const data = datas[0];

    return {
      id: data.id,
      type: data.type,
      data: {
        chainId: data.data.chainId,
        msgOrigin: data.data.msgOrigin,
        data: data.data,
      },
      isInternal: data.isInternal,
    };
  }

  get waitingTronData() {
    const datas = this.waitingTronDatas;
    if (datas.length === 0) {
      return undefined;
    }
    const data: any = datas[0];

    return {
      id: data.id,
      type: data.type,
      data: {
        ...data.data,
      },
      isInternal: data.isInternal,
    };
  }

  protected isEnded(): boolean {
    return this.interactionStore.getEvents<void>("request-sign-end").length > 0;
  }

  protected isEthereumEnded(): boolean {
    return (
      this.interactionStore.getEvents<void>("request-sign-ethereum-end")
        .length > 0
    );
  }
  protected isBitcoinEnded(): boolean {
    const isEnd =
      this.interactionStore.getEvents<void>("request-sign-bitcoin-end").length >
      0;
    return isEnd;
  }
  protected isSvmEnded(): boolean {
    return (
      this.interactionStore.getEvents<void>("request-sign-svm-end").length > 0
    );
  }

  protected isTronEnded(): boolean {
    return (
      this.interactionStore.getEvents<void>("request-sign-tron-end").length > 0
    );
  }

  protected clearEnded() {
    this.interactionStore.clearEvent("request-sign-end");
    this.interactionStore.clearEvent("request-sign-tron-end");
    this.interactionStore.clearEvent("request-sign-ethereum-end");
    this.interactionStore.clearEvent("request-sign-bitcoin-end");
    this.interactionStore.clearEvent("request-sign-svm-end");
  }

  protected waitEnd(): Promise<void> {
    if (this.isEnded()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (this.isEnded()) {
          resolve();
          this.clearEnded();
          disposer();
        }
      });
    });
  }

  protected waitEthereumEnd(): Promise<void> {
    if (this.isEthereumEnded()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (this.isEthereumEnded()) {
          resolve();
          this.clearEnded();
          disposer();
        }
      });
    });
  }
  protected waitBitcoinEnd(): Promise<void> {
    if (this.isBitcoinEnded()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (this.isBitcoinEnded()) {
          resolve();
          this.clearEnded();
          disposer();
        }
      });
    });
  }
  protected waitSvmEnd(): Promise<void> {
    if (this.isSvmEnded()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (this.isSvmEnded()) {
          resolve();
          this.clearEnded();
          disposer();
        }
      });
    });
  }

  protected waitTronEnd(): Promise<void> {
    if (this.isTronEnded()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const disposer = autorun(() => {
        if (this.isTronEnded()) {
          resolve();
          this.clearEnded();
          disposer();
        }
      });
    });
  }

  @flow
  *approveAndWaitEnd(newSignDocWrapper: SignDocWrapper) {
    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    const id = this.waitingDatas[0].id;
    try {
      const newSignDoc =
        newSignDocWrapper.mode === "amino"
          ? newSignDocWrapper.aminoSignDoc
          : newSignDocWrapper.protoSignDoc.toBytes();

      yield this.interactionStore.approveWithoutRemovingData(id, newSignDoc);
    } finally {
      yield this.waitEnd();
      this.interactionStore.removeData("request-sign", id);
      this._isLoading = false;
    }
  }

  @flow
  *approveTronAndWaitEnd(newData: object) {
    if (this.waitingTronDatas?.length === 0) {
      return;
    }

    this._isLoading = true;
    const idTron = this.waitingTronDatas?.[0]?.id;
    try {
      if (this.waitingTronDatas?.length > 0) {
        yield this.interactionStore.approveWithoutRemovingData(idTron, newData);
      }
    } finally {
      yield this.waitTronEnd();
      this.interactionStore.removeData("request-sign-tron", idTron);
      this._isLoading = false;
    }
  }
  @flow
  *approveBitcoinAndWaitEnd(newData: object) {
    if (this.waitingBitcoinDatas?.length === 0) {
      return;
    }

    this._isLoading = true;
    const idBitcoin = this.waitingBitcoinDatas?.[0]?.id;
    try {
      if (this.waitingBitcoinDatas?.length > 0) {
        yield this.interactionStore.approveWithoutRemovingData(
          idBitcoin,
          newData
        );
      }
    } finally {
      yield this.waitBitcoinEnd();
      this.interactionStore.removeData("request-sign-bitcoin", idBitcoin);
      this._isLoading = false;
    }
  }
  @flow
  *approveSvmAndWaitEnd(newData: object) {
    if (this.waitingSvmDatas?.length === 0) {
      return;
    }

    this._isLoading = true;
    const idSvm = this.waitingSvmDatas?.[0]?.id;
    try {
      if (this.waitingSvmDatas?.length > 0) {
        yield this.interactionStore.approveWithoutRemovingData(idSvm, newData);
      }
    } finally {
      yield this.waitSvmEnd();
      this.interactionStore.removeData("request-sign-svm", idSvm);
      this._isLoading = false;
    }
  }

  @flow
  *approveEthereumAndWaitEnd({
    gasPrice = "0x0",
    memo = "",
    gasLimit = "0x0",
    fees = "0x0",
  }) {
    if (this.waitingEthereumDatas?.length === 0) {
      return;
    }

    this._isLoading = true;
    const idEthereum = this.waitingEthereumDatas?.[0]?.id;
    try {
      if (this.waitingEthereumDatas?.length > 0) {
        yield this.interactionStore.approveWithoutRemovingData(idEthereum, {
          ...this.waitingEthereumDatas[0].data,
          gasPrice,
          memo,
          gasLimit,
          fees,
        });
      }
    } finally {
      yield this.waitEthereumEnd();
      this.interactionStore.removeData("request-sign-ethereum", idEthereum);
      this._isLoading = false;
    }
  }

  @flow
  *reject() {
    if (this.waitingDatas.length === 0) {
      return;
    }

    if (this.waitingEthereumDatas.length === 0) {
      return;
    }

    if (this.waitingTronDatas.length === 0) {
      return;
    }
    if (this.waitingBitcoinDatas.length === 0) {
      return;
    }
    if (this.waitingSvmDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    try {
      yield this.interactionStore.reject(
        "request-sign",
        this.waitingDatas[0].id
      );
      yield this.interactionStore.reject(
        "request-sign-ethereum",
        this.waitingEthereumDatas?.[0].id
      );
      yield this.interactionStore.reject(
        "request-sign-tron",
        this.waitingTronDatas?.[0].id
      );
      yield this.interactionStore.reject(
        "request-sign-bitcoin",
        this.waitingBitcoinDatas?.[0].id
      );
      yield this.interactionStore.reject(
        "request-sign-svm",
        this.waitingSvmDatas?.[0].id
      );
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *rejectAll() {
    this._isLoading = true;
    try {
      // yield this.interactionStore.rejectAll('request-sign');
      yield this.waitingDatas?.map((wd) => {
        this.interactionStore.reject("request-sign", wd.id);
      });
      yield this.waitingEthereumDatas?.map((wed) => {
        this.interactionStore.reject("request-sign-ethereum", wed.id);
      });
      yield this.waitingTronDatas?.map((wed) => {
        this.interactionStore.reject("request-sign-tron", wed.id);
      });
      yield this.waitingBitcoinDatas?.map((wed) => {
        this.interactionStore.reject("request-sign-bitcoin", wed.id);
      });
      yield this.waitingSvmDatas?.map((wed) => {
        this.interactionStore.reject("request-sign-svm", wed.id);
      });
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  protected *rejectWithId(id: string) {
    yield this.interactionStore.reject("request-sign", id);
    yield this.interactionStore.reject("request-ethereum-sign", id);
    yield this.interactionStore.reject("request-sign-tron", id);
    yield this.interactionStore.reject("request-sign-bitcoin", id);
    yield this.interactionStore.reject("request-sign-svm", id);
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
