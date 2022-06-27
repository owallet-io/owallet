import { observable, action, makeObservable } from 'mobx';
import { ReactElement } from 'react';

export class ModalStore {
  @observable
  protected isOpen: boolean;
  protected children: ReactElement;

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
  setChildren(children) {
    this.children = children;
  }

  @action
  getChildren() {
    return this.children;
  }

  @action
  close() {
    this.isOpen = false;
  }
}
