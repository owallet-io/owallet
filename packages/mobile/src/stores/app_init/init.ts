import { observable, action, makeObservable, computed, flow } from 'mobx';
import { create, persist } from 'mobx-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initBigInt } from '@src/utils/helper';
import { toGenerator } from '@owallet/common';

export class AppInit {
  @persist('object')
  @observable
  protected initApp: {
    status: boolean;
    date_updated: null | number;
    theme: 'dark' | 'light';
    visibleTabBar?: string;
  };
  @observable
  protected notiData: {};
  @observable
  public static cosmwasm: typeof import('@cosmjs/cosmwasm-stargate');

  constructor() {
    makeObservable(this);
    this.initApp = {
      visibleTabBar: null,
      status: true,
      date_updated: null,
      theme: 'light'
    };
    this.initCosmWasmStargate();
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

  @flow
  private *initCosmWasmStargate() {
    yield* toGenerator(initBigInt());
    let cosmwasm = yield* toGenerator(import('@cosmjs/cosmwasm-stargate'));
    AppInit.cosmwasm = cosmwasm;
  }
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true // if you use AsyncStorage, here shoud be true
});

export const appInit = new AppInit();

hydrate('appInit', appInit).then(() => console.log('appInit hydrated'));
