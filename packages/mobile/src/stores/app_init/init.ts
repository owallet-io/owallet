import { observable, action, makeObservable, computed } from "mobx";
import { create, persist } from "mobx-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CoinGeckoPrices, TokenItemType } from "@oraichain/oraidex-common";

export class AppInit {
  @persist("object")
  @observable
  protected initApp: {
    status: boolean;
    passcodeType: "numeric" | "alphabet";
    isAllNetworks: boolean;
    date_updated: null | number;
    theme: "dark" | "light";
    visibleTabBar?: string;
    feeOption?: "low" | "average" | "high";
    prices: CoinGeckoPrices<string>;
    yesterdayPriceFeed: Array<any>;
    balances: object;
    chainInfos: Array<any>;
  };
  @observable
  protected notiData: {};

  constructor() {
    makeObservable(this);
    this.initApp = {
      visibleTabBar: null,
      status: true,
      passcodeType: "alphabet",
      date_updated: null,
      theme: "light",
      feeOption: "average",
      isAllNetworks: false,
      prices: {},
      balances: {},
      chainInfos: [],
      yesterdayPriceFeed: [],
    };
  }

  @computed
  get getInitApp() {
    return this.initApp;
  }

  @computed
  get getChainInfos() {
    return this.initApp.chainInfos;
  }

  @action
  updateInitApp() {
    this.initApp = { ...this.initApp, status: false };
  }

  @action
  updateFeeOption(fee) {
    this.initApp = { ...this.initApp, feeOption: fee };
  }

  @action
  updateBalanceByAddress(address, balance) {
    this.initApp = {
      ...this.initApp,
      balances: { ...this.getInitApp.balances, [address]: balance },
    };
  }

  @action
  updateChainInfos(chains) {
    this.initApp = {
      ...this.initApp,
      chainInfos: chains,
    };
  }

  @action
  updateDate(date) {
    this.initApp = { ...this.initApp, date_updated: date };
  }

  @action
  updateTheme(theme) {
    this.initApp = { ...this.initApp, theme };
  }

  @action
  updateVisibleTabBar(visibleTabBar) {
    this.initApp = { ...this.initApp, visibleTabBar };
  }

  @action
  updateKeyboardType(passcodeType) {
    this.initApp = { ...this.initApp, passcodeType };
  }

  @action
  updatePrices(prices) {
    const tmpPrices = { ...this.initApp.prices, ...prices };
    this.initApp = { ...this.initApp, prices: tmpPrices };
  }

  @action
  getYesterdayPriceFeed() {
    return this.initApp.yesterdayPriceFeed;
  }

  @action
  updateYesterdayPriceFeed(priceFeed) {
    this.initApp.yesterdayPriceFeed = priceFeed;
  }

  @action
  selectAllNetworks(isAllNetworks) {
    this.initApp = { ...this.initApp, isAllNetworks };
  }
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true, // if you use AsyncStorage, here shoud be true
});

export const appInit = new AppInit();

hydrate("appInit", appInit).then(() => console.log("appInit hydrated"));
