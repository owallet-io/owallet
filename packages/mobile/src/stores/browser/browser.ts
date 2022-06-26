import { observable, action, makeObservable } from 'mobx';
import { DAppInfos } from '../../screens/web/config';

export class BrowserStore {
  @observable
  protected bookmarks: Array<any>;
  protected tabs: Array<any>;
  protected selectedTab: object;

  constructor() {
    this.bookmarks = [...DAppInfos];
    this.tabs = [];
    makeObservable(this);
  }

  @action
  updateBookmarks(bookmarks) {
    this.bookmarks = bookmarks;
  }

  @action
  removeBoorkmark(boorkmark) {
    const rIndex = this.tabs.findIndex((b) => b.uri === boorkmark.uri);
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

  @action
  getBookmarks() {
    return this.bookmarks;
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

  @action
  removeTab(tab) {
    const rTabIndex = this.tabs.findIndex((t) => t.uri === tab.uri);
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
