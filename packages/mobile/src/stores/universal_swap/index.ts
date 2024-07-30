import AsyncStorage from "@react-native-async-storage/async-storage";
import { observable, action, makeAutoObservable, computed } from "mobx";
import { create, persist } from "mobx-persist";

export class UniversalSwapStore {
  @persist("object")
  @observable
  protected amounts: { string: string } | {};
  @persist("object")
  @observable
  protected tokenReload: Array<any>;
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
  get getTokenReload() {
    return this.tokenReload;
  }

  @computed
  get getLoadStatus() {
    return this.loadStatus;
  }

  @action
  updateAmounts(amounts) {
    const copy = Object.assign({}, this.amounts);

    const tmpAmounts = Object.assign(copy, amounts);

    this.amounts = tmpAmounts;
  }

  @action
  updateTokenReload(tokens) {
    this.tokenReload = tokens;
  }

  @action
  setLoaded(loaded: boolean) {
    this.loadStatus = { ...this.loadStatus, isLoad: loaded, time: new Date() };
  }

  @action
  clearAmounts() {
    this.amounts = {};
  }

  @action
  clearTokenReload() {
    this.tokenReload = [];
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
