import { observable, action, makeObservable, computed } from "mobx";
import { create, persist } from "mobx-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CoinGeckoPrices } from "@oraichain/oraidex-common";
import { DAppInfos } from "@stores/browser";

// import { IMultipleAsset } from "@src/screens/home/hooks/use-multiple-assets";

export class AppInit {
  @persist("object")
  @observable
  protected initApp: {
    status: boolean;
    passcodeType: "numeric" | "alphabet";
    isAllNetworks: boolean;
    isSelectTheme: boolean;
    date_updated: null | number;
    theme: "dark" | "light";
    wallet: "owallet" | "injective" | "osmosis";
    hideTestnet: boolean;
    hideTipNoel: boolean;
    hideTokensWithoutBalance: boolean;
    visibleTabBar?: string;
    feeOption?: "low" | "average" | "high";
    prices: CoinGeckoPrices<string>;
    yesterdayPriceFeed: Array<any>;
    balances: object;
    chainInfos: Array<any>;
    manageToken: Record<string, boolean>;
  };
  @persist("map")
  @observable
  protected stateTokenMap = new Map();

  @persist("list")
  @observable
  protected bookmarks: Array<any> = DAppInfos;
  @observable
  protected notiData: {};

  constructor() {
    makeObservable(this);
    this.initApp = {
      visibleTabBar: null,
      status: true,
      hideTipNoel: false,
      passcodeType: "alphabet",
      date_updated: null,
      theme: "light",
      hideTestnet: true,
      wallet: "owallet",
      isSelectTheme: false,
      hideTokensWithoutBalance: true,
      feeOption: "average",
      isAllNetworks: false,
      prices: {},
      balances: {},
      chainInfos: [],
      yesterdayPriceFeed: [],
      manageToken: {},
    };
    // this.multipleAssets = {
    //   totalPriceBalance: "0",
    //   dataTokens: [],
    //   dataTokensByChain: null,
    // };
  }

  @action
  updateTokenState(itemId, isUpdated) {
    this.stateTokenMap.set(itemId, isUpdated);
  }
  @computed
  get tokenMap() {
    return this.stateTokenMap;
  }
  @action
  updateBookmarks(bookmarks) {
    this.bookmarks = bookmarks;
  }
  @action
  removeBoorkmark(boorkmark) {
    if (this.bookmarks?.length <= 0) return;
    const tempBookMarks = [...this.bookmarks];
    const rIndex = tempBookMarks.findIndex((b) =>
      b?.uri?.includes(boorkmark?.uri)
    );
    if (rIndex !== -1) {
      tempBookMarks.splice(rIndex, 1);
      this.bookmarks = tempBookMarks;
    }
  }
  @action
  addBoorkmark(boorkmark) {
    const tempBookMarks = this.bookmarks?.length > 0 ? [...this.bookmarks] : [];
    const rIndex = tempBookMarks.findIndex((b) =>
      b?.uri?.includes(boorkmark?.uri)
    );
    if (rIndex === -1) {
      tempBookMarks.push(boorkmark);
      this.bookmarks = tempBookMarks;
    } else {
      this.removeBoorkmark(boorkmark);
    }
  }

  @computed
  get getBookmarks() {
    return this.bookmarks;
  }

  isItemUpdated(itemId) {
    return this.stateTokenMap.get(itemId) || false;
  }
  isItemExits(itemId): boolean | undefined {
    return this.stateTokenMap.get(itemId);
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
  updateManageToken(keyToken: string, isHide: boolean) {
    this.initApp = {
      ...this.initApp,
      manageToken: {
        ...this.initApp.manageToken,
        [keyToken]: isHide,
      },
    };
  }

  @action
  updateSelectTheme() {
    this.initApp = { ...this.initApp, isSelectTheme: true };
  }

  @action
  updateHideTipNoel() {
    this.initApp = { ...this.initApp, hideTipNoel: true };
  }

  // @action
  // updateMultipleAssets(data: IMultipleAsset) {
  //   this.multipleAssets = { ...data };
  // }
  // @computed
  // get getMultipleAssets(): IMultipleAsset {
  //   return this.multipleAssets;
  // }

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
  updateWalletTheme(wallet) {
    this.initApp = { ...this.initApp, wallet };
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
