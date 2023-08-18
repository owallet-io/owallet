import { observable, action, makeAutoObservable, computed } from 'mobx';
import { create, persist } from 'mobx-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
export class UniversalSwapStore {
  @persist('object')
  @observable
  protected amounts: any;

  constructor() {
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

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true // if you use AsyncStorage, here shoud be true
});

export const universalSwap = new UniversalSwapStore();

hydrate('universalSwap', universalSwap).then(() =>
  console.log('universalSwap hydrated')
);
