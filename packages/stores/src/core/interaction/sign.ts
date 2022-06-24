import { InteractionStore } from './interaction';
import { autorun, computed, flow, makeObservable, observable } from 'mobx';
import { StdSignDoc } from '@cosmjs/launchpad';
import { InteractionWaitingData } from '@owallet/background';
import { SignDocWrapper } from '@owallet/cosmos';
import { OWalletSignOptions } from '@owallet/types';

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
    });
  }

  protected get waitingDatas() {
    return this.interactionStore.getDatas<
      | {
          msgOrigin: string;
          chainId: string;
          mode: 'amino';
          signer: string;
          signDoc: StdSignDoc;
          signOptions: OWalletSignOptions;
          isADR36SignDoc: boolean;
          isADR36WithString?: boolean;
        }
      | {
          msgOrigin: string;
          chainId: string;
          mode: 'direct';
          signer: string;
          signDocBytes: Uint8Array;
          signOptions: OWalletSignOptions;
        }
    >('request-sign');
  }

  protected get waitingEthereumDatas() {
    return this.interactionStore.getDatas<
      | {
          msgOrigin: string;
          chainId: string;
          mode: 'direct';
          data;
        }
      | {
          msgOrigin: string;
          chainId: string;
          mode: 'direct';
          data: object;
        }
    >('request-sign-ethereum');
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
      data.data.mode === 'amino'
        ? SignDocWrapper.fromAminoSignDoc(data.data.signDoc)
        : new SignDocWrapper(data.data.mode, data.data.signDocBytes);

    return {
      id: data.id,
      type: data.type,
      isInternal: data.isInternal,
      data: {
        msgOrigin: data.data.msgOrigin,
        signer: data.data.signer,
        signDocWrapper: wrapper,
        signOptions: data.data.signOptions,
        isADR36WithString:
          'isADR36WithString' in data.data
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

  protected isEnded(): boolean {
    return this.interactionStore.getEvents<void>('request-sign-end').length > 0;
  }

  protected isEthereumEnded(): boolean {
    return (
      this.interactionStore.getEvents<void>('request-sign-ethereum-end')
        .length > 0
    );
  }

  protected clearEnded() {
    this.interactionStore.clearEvent('request-sign-end');
    this.interactionStore.clearEvent('request-sign-ethereum-end');
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

  @flow
  *approveAndWaitEnd(newSignDocWrapper: SignDocWrapper) {
    console.log(
      'approve and wait end!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
    );

    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    const id = this.waitingDatas[0].id;
    try {
      const newSignDoc =
        newSignDocWrapper.mode === 'amino'
          ? newSignDocWrapper.aminoSignDoc
          : newSignDocWrapper.protoSignDoc.toBytes();

      yield this.interactionStore.approveWithoutRemovingData(id, newSignDoc);
    } finally {
      yield this.waitEnd();
      this._isLoading = false;
      this.interactionStore.removeData('request-sign', id);
    }
  }

  @flow
  *approveEthereumAndWaitEnd({ gasPrice = '0x0', memo = '' }) {
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
        });
      }
    } finally {
      yield this.waitEthereumEnd();
      this._isLoading = false;
      this.interactionStore.removeData('request-sign-ethereum', idEthereum);
    }
  }

  @flow
  *reject() {
    if (this.waitingDatas.length === 0) {
      return;
    }

    this._isLoading = true;
    try {
      yield this.interactionStore.reject(
        'request-sign',
        this.waitingDatas[0].id
      );
      yield this.interactionStore.reject(
        'request-ethereum-sign',
        this.waitingEthereumDatas?.[0].id
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
        this.interactionStore.reject('request-sign', wd.id);
      });
      yield this.waitingEthereumDatas?.map((wed) => {
        this.interactionStore.reject('request-sign-ethereum', wed.id);
      });
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  protected *rejectWithId(id: string) {
    yield this.interactionStore.reject('request-sign', id);
    yield this.interactionStore.reject('request-ethereum-sign', id);
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
