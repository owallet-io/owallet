import { observable, action, makeObservable, computed } from 'mobx';
import { DAppInfos } from '../../screens/web/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class BrowserStore {
  @observable
  protected bookmarks: Array<any>;
  protected tabs: Array<any>;
  protected selectedTab: { id: string; name: string; uri: string };

  constructor() {
    makeObservable(this);
    this.bookmarks = [...DAppInfos];
    this.tabs = [];
  }

  @action
  updateBookmarks(bookmarks) {
    this.bookmarks = bookmarks;
  }

  @action
  removeBoorkmark(boorkmark) {
    const rIndex = this.tabs.findIndex((b) => b.id === boorkmark.id);
    if (rIndex > -1) {
      this.bookmarks.splice(rIndex, 1);
    }
  }

  @action
  addBoorkmark(boorkmark: object) {
    const tempbookmarks = [...this.bookmarks];
    tempbookmarks.push(boorkmark);
    this.bookmarks = tempbookmarks;
  }

  @computed
  get getBookmarks() {
    return this.bookmarks;
  }

  @action
  updateTabs(tabs) {
    this.tabs = tabs;
  }

  @computed
  get getTabs() {
    return this.tabs;
  }

  @action
  updateSelectedTab(tab) {
    this.selectedTab = tab;
  }

  @computed
  get getSelectedTab() {
    return this.selectedTab;
  }

  @action
  removeTab(tab) {
    const rTabIndex = this.tabs.findIndex((t) => t.id === tab.id);
    if (rTabIndex > -1) {
      this.tabs.splice(rTabIndex, 1);
    }
  }

  @action
  addTab(tab: object) {
    const tempTabs = [...this.tabs];
    tempTabs.push(tab);
    this.tabs = tempTabs;
  }
}
