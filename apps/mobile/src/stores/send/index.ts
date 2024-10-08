import { observable, action, makeObservable, computed } from "mobx";

export class SendStore {
  @observable
  protected sendObject: any;

  constructor() {
    makeObservable(this);
  }

  @action
  updateSendObject(sendObj) {
    this.sendObject = sendObj;
  }

  @computed
  get sendObj() {
    return this.sendObject;
  }
}
