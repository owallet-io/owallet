import { observable, action, makeObservable } from 'mobx';

export class ModalStore {
  @observable
  protected isOpen: boolean;

  constructor() {
    this.isOpen = false;
    makeObservable(this);
  }

  @action
  setOpen() {
    this.isOpen = true;
  }

  @action
  getState() {
    return this.isOpen;
  }

  @action
  close() {
    this.isOpen = false;
  }
}
