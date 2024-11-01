import { InteractionStore } from "./interaction";
import { computed, makeObservable } from "mobx";
import { TransactionType } from "@owallet/types";
import { PlainObject } from "@owallet/background";

export type SignBtcInteractionData = {
  origin: string;
  chainId: string;
  signer: string;
  pubKey: Uint8Array;
  message: Uint8Array;
  signType: TransactionType;
  keyType: string;
  keyInsensitive: PlainObject;
};

export class SignBtcInteractionStore {
  constructor(protected readonly interactionStore: InteractionStore) {
    makeObservable(this);
  }

  get waitingDatas() {
    return this.interactionStore.getAllData<SignBtcInteractionData>(
      "request-sign-btc"
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
    signingData: Uint8Array,
    inputs: any,
    outputs: any,
    signature: string | undefined,
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
        inputs,
        outputs,
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
    await this.interactionStore.rejectAll("request-sign-btc");
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }
}
