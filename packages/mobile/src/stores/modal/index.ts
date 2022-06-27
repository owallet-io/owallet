import { observable, action, makeObservable, computed } from 'mobx'
import { ReactElement } from 'react'

export class ModalStore {
  @observable
  protected isOpen: boolean
  protected children: ReactElement

  constructor() {
    this.isOpen = false
    makeObservable(this)
  }

  @action
  setOpen() {
    this.isOpen = true
  }

  @computed
  get getState() {
    return this.isOpen
  }

  @action
  setChildren(children: ReactElement) {
    this.children = children
  }

  @action
  getChildren() {
    return this.children
  }

  @action
  close() {
    this.isOpen = false
    this.children = null
  }
}
