import { observable, action, makeObservable } from 'mobx';
import { DAppInfos } from '../../screens/web/config';

export class BrowserStore {
  @observable
  protected boorkmarks: Array<any>;
  protected tabs: Array<string>;
  protected selectedTab: string;

  constructor() {
    this.boorkmarks = [...DAppInfos];
    this.tabs = [];
    makeObservable(this);
  }

  @action
  updateBoorkmarks(boorkmarks) {
    this.boorkmarks = boorkmarks;
  }

  @action
  getBoorkmarks() {
    return this.boorkmarks;
  }

  @action
  updateTabs(tabs) {
    this.tabs = tabs;
  }

  @action
  getTabs() {
    return this.tabs;
  }

  @action
  updateSelectedTab(tab) {
    this.selectedTab = tab;
  }

  @action
  getSelectedTab() {
    return this.selectedTab;
  }
}
