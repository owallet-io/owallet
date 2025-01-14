import { InteractionStore } from "./interaction";
import { computed, makeObservable } from "mobx";
import { PlainObject } from "@owallet/background";
import { PublicKey } from "@solana/web3.js";
import { TransactionSvmType } from "@owallet/types/build/svm";

export type SignSvmInteractionData = {
  origin: string;
  chainId: string;
  signer: string;
  pubKey: PublicKey;
  message: string | Array<string>;
  signType: TransactionSvmType;
  keyType: string;
  keyInsensitive: PlainObject;
};

export class SignSvmInteractionStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<SignSvmInteractionData>(
      "request-sign-svm"
    );
  }

  @computed
  get waitingData() {
    const datas = this.waitingDatas;

    if (datas.length === 0) {
      return undefined;
    }

    return datas[0];
  }

  async approveWithProceedNext(
    id: string,
    signingData: string,
    signature: Uint8Array | undefined,
    afterFn: (proceedNext: boolean) => void | Promise<void>,
    options: {
      preDelay?: number;
    } = {}
  ) {
    await this.interactionStore.approveWithProceedNextV2(
      id,
      {
        signingData,
        signature,
      },
      afterFn,
      options
    );
  }

  async rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNext(id, afterFn);
  }

  async rejectAll() {
    await this.interactionStore.rejectAll("request-sign-svm");
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }
}
