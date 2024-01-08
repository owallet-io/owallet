import AsyncStorage from '@react-native-async-storage/async-storage';
import { observable, action, makeAutoObservable, computed } from 'mobx';
import { create, persist } from 'mobx-persist';

export class UniversalSwapStore {
  @persist('object')
  @observable
  protected amounts: { string: string } | {};

  constructor() {
    makeAutoObservable(this);
    this.amounts = {};
  }

  @computed
  get getAmount() {
    return this.amounts;
  }

  @action
  updateAmounts(amounts) {
    this.amounts = { ...this.amounts, ...amounts };
  }
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true // if you use AsyncStorage, here shoud be true
});

export const universalSwapStore = new UniversalSwapStore();

hydrate('UniversalSwapStore', universalSwapStore).then(() => console.log('universalSwapStore hydrated'));
