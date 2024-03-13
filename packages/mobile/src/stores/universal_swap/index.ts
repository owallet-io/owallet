import AsyncStorage from "@react-native-async-storage/async-storage";
import { observable, action, makeAutoObservable, computed } from "mobx";
import { create, persist } from "mobx-persist";

export class UniversalSwapStore {
  @persist("object")
  @observable
  protected amounts: { string: string } | {};
  @observable
  protected loadStatus: { isLoad: boolean; time: Date };

  constructor() {
    makeAutoObservable(this);
    this.amounts = {};
    this.loadStatus = { isLoad: false, time: new Date() };
  }

  @computed
  get getAmount() {
    return this.amounts;
  }

  @computed
  get getLoadStatus() {
    return this.loadStatus;
  }

  @action
  updateAmounts(amounts) {
    this.amounts = { ...this.amounts, ...amounts };
  }

  @action
  setLoaded(loaded: boolean) {
    this.loadStatus = { ...this.loadStatus, isLoad: loaded, time: new Date() };
  }

  @action
  clearAmounts() {
    this.amounts = {};
  }
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true, // if you use AsyncStorage, here shoud be true
});

export const universalSwapStore = new UniversalSwapStore();

hydrate("UniversalSwapStore", universalSwapStore).then(() =>
  console.log("universalSwapStore hydrated")
);
