import { observable, action, makeAutoObservable, computed } from 'mobx';

export class UniversalSwapStore {
  @observable
  protected amounts: any;

  constructor() {
    this.amounts = {};
    makeAutoObservable(this);
  }

  @computed
  get getAmount() {
    return this.amounts;
  }

  @action
  updateAmounts(amounts) {
    this.amounts = { ...this?.amounts, ...amounts };
  }
}
