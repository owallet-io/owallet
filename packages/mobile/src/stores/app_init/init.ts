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
  updatePriceFeed(address, balances) {
    console.log('address', address, balances);

    // TODO: save balances with address
    let tmpPrice = { ...this.initApp.priceFeed[address] };
    if (Object.keys(tmpPrice).length === 0) {
      // Pricefeed is empty, we never call to get balances of this address before
      tmpPrice = {
        [Math.floor(Date.now() / 1000)]: balances,
        [Math.floor(Date.now() / 1000) + 1]: balances
      };
    } else {
      const today = moment.unix(Math.floor(Date.now() / 1000));
      const yesterday = moment.unix(Number(Object.keys(tmpPrice)[0]));

      if (today.isSame(yesterday, 'day')) {
        // Today is the same day as the day when the last balances were called
        // Replace the today balances with the new one
        tmpPrice[Object.keys(tmpPrice)[1]] = balances;
      } else {
        // Today is not the same day as the day when the last balances were called
        // Remove the first element of object, which is the outdated data
        delete tmpPrice[Object.keys(tmpPrice)[0]];
        // The second element now become first, which is yesterday data
        // Push new element into object, become today data
        tmpPrice[Math.floor(Date.now() / 1000)] = balances;
      }
    }
    // Assign new balances into address
    const newPriceFeed = { ...this.getInitApp.priceFeed };
    newPriceFeed[address] = tmpPrice;

    console.log('newPriceFeed', newPriceFeed);

    this.initApp = { ...this.initApp, ...{ priceFeed: newPriceFeed } };
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
