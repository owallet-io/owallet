import { observable, action, makeObservable, computed } from 'mobx';
import { create, persist } from 'mobx-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UniversalSwap {
  @persist('object')
  @observable
  protected amounts: {};

  constructor() {
    makeObservable(this);
    this.amounts = {};
  }

  @computed
  get getAmounts() {
    return this.amounts;
  }

  @action
  updateAmounts(amounts) {
    this.amounts = amounts;
  }
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true // if you use AsyncStorage, here shoud be true
});

export const universalSwap = new UniversalSwap();

hydrate('universalSwap', universalSwap).then(() =>
  console.log('universalSwap hydrated')
);
