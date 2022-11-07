import { observable, action, makeObservable, computed } from 'mobx';
import { create, persist } from 'mobx-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AppInit {
  @persist('object')
  @observable
  protected initApp: {
    status: boolean;
    date_updated: null | number;
    theme: string;
  };

  constructor() {
    makeObservable(this);
    this.initApp = { status: true, date_updated: null, theme: 'light' };
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
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true // if you use AsyncStorage, here shoud be true
});

export const appInit = new AppInit();

hydrate('appInit', appInit).then(() => console.log('appInit hydrated'));
