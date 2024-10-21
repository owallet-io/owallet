import { ChainGetter } from "@owallet/stores";
import { OWallet } from "@owallet/types";
import { action, makeObservable, observable } from "mobx";

export class OasisAccountBase {
  @observable
  protected _isSendingTx: boolean = false;

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getOWallet: () => Promise<OWallet | undefined>
  ) {
    makeObservable(this);
  }

  @action
  setIsSendingTx(value: boolean) {
    this._isSendingTx = value;
  }

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }
}
