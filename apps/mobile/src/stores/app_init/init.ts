import { observable, action, makeObservable, computed } from "mobx";
import { create, persist } from "mobx-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CoinGeckoPrices, TokenItemType } from "@oraichain/oraidex-common";
import {
  IMultipleAsset,
  initPrice,
} from "@src/screens/home/hooks/use-multiple-assets";

export class AppInit {
  @persist("object")
  @observable
  protected initApp: {
    status: boolean;
    passcodeType: "numeric" | "alphabet";
    isAllNetworks: boolean;
    date_updated: null | number;
    theme: "dark" | "light";
    hideTestnet: boolean;
    hideTokensWithoutBalance: boolean;
    visibleTabBar?: string;
    feeOption?: "low" | "average" | "high";
    prices: CoinGeckoPrices<string>;
    yesterdayPriceFeed: Array<any>;
    balances: object;
    chainInfos: Array<any>;
  };
  @persist("object")
  @observable
  protected multipleAssets: IMultipleAsset;

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
      hideTestnet: true,
      hideTokensWithoutBalance: true,
      feeOption: "average",
      isAllNetworks: false,
      prices: {},
      balances: {},
      chainInfos: [],
      yesterdayPriceFeed: [],
    };
    this.multipleAssets = {
      totalPriceBalance: "0",
      dataTokens: [],
      dataTokensByChain: null,
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
  updateMultipleAssets(data: IMultipleAsset) {
    this.multipleAssets = { ...data };
  }
  @computed
  get getMultipleAssets(): IMultipleAsset {
    return this.multipleAssets;
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
  updateHideTestnet(isHide) {
    this.initApp = { ...this.initApp, hideTestnet: isHide };
  }

  @action
  updateHideTokensWithoutBalance(hideTokensWithoutBalance) {
    this.initApp = { ...this.initApp, hideTokensWithoutBalance };
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
