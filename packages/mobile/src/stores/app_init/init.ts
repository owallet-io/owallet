import { observable, action, makeObservable, computed } from 'mobx';
import { create, persist } from 'mobx-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

export class AppInit {
  @persist('object')
  @observable
  protected initApp: {
    status: boolean;
    passcodeType: 'numeric' | 'alphabet';
    isAllNetworks: boolean;
    date_updated: null | number;
    theme: 'dark' | 'light';
    visibleTabBar?: string;
    priceFeed: object;
  };
  @observable
  protected notiData: {};

  constructor() {
    makeObservable(this);
    this.initApp = {
      visibleTabBar: null,
      status: true,
      passcodeType: 'alphabet',
      date_updated: null,
      theme: 'light',
      isAllNetworks: false,
      priceFeed: {}
    };
  }

  @computed
  get getInitApp() {
    return this.initApp;
  }

  @action
  updateInitApp() {
    this.initApp = { ...this.initApp, status: false };
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
  updatePriceFeed(balances) {
    let tmpPrice = { ...this.initApp.priceFeed };
    if (Object.keys(this.initApp.priceFeed).length === 0) {
      // Pricefeed is empty, we never call to get balances before
      tmpPrice = {
        [new Date().getTime()]: balances,
        [new Date().getTime() + 1]: balances
      };
      console.log('first time?', tmpPrice);
      this.initApp = { ...this.initApp, ...{ priceFeed: tmpPrice } };
    } else {
      const today = moment(new Date().getTime());
      const yesterday = moment(Object.keys(tmpPrice)[0]);
      if (today.isSame(yesterday)) {
        // Today is the same day as the day when the last balances were called
        // Replace the today balances with the new one
        tmpPrice[Object.keys(tmpPrice)[1]] = balances;
        console.log('today again?', tmpPrice);
      } else {
        // Today is not the same day as the day when the last balances were called
        // Remove the first element of object, which is the outdated data
        delete tmpPrice[Object.keys(tmpPrice)[0]];
        // The second element now become first, which is yesterday data
        // Push new element into object, become today data
        tmpPrice[new Date().getTime()] = balances;
        console.log('next day?', tmpPrice);
      }
    }
  }

  @action
  selectAllNetworks(isAllNetworks) {
    this.initApp = { ...this.initApp, isAllNetworks };
  }
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true // if you use AsyncStorage, here shoud be true
});

export const appInit = new AppInit();

hydrate('appInit', appInit).then(() => console.log('appInit hydrated'));
