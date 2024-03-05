import { observable, action, makeObservable, computed } from "mobx";
import { create, persist } from "mobx-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

const oraiLogo = require("../../assets/image/webpage/orai_logo.png");

export const DAppInfos = [
  {
    id: 1,
    name: "Oraidex",
    uri: "https://oraidex.io",
    logo: oraiLogo,
  },
  {
    id: 3,
    name: "Orderbook",
    uri: "https://orderbook.orai.io",
    logo: oraiLogo,
  },
  {
    id: 4,
    name: "Futures",
    uri: "https://futures.oraidex.io",
    logo: oraiLogo,
  },
  {
    id: 2,
    name: "Osmosis",
    uri: "https://app.osmosis.zone",
    logo: require("../../assets/image/webpage/osmosis_logo.png"),
  },
  {
    id: 6,
    name: "Oraiscan",
    uri: "https://scan.orai.io",
    logo: oraiLogo,
  },
  {
    id: 4,
    name: "Orchai App",
    uri: "https://app.orchai.io",
    logo: oraiLogo,
  },
  {
    id: 5,
    name: "aiRight",
    uri: "https://airight.io",
    logo: oraiLogo,
  },
];

export class BrowserStore {
  @persist("list")
  @observable
  protected bookmarks: Array<any>;
  @persist("list")
  @observable
  protected tabs: Array<any>;
  @persist("object")
  @observable
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
    const rIndex = this.bookmarks.findIndex((b) => b.uri === boorkmark.uri);
    if (rIndex > -1) {
      this.bookmarks.splice(rIndex, 1);
    }
  }

  @action
  addBoorkmark(boorkmark) {
    const rIndex = this.bookmarks.findIndex((b) => b.uri === boorkmark?.uri);
    if (rIndex < 0) {
      this.bookmarks.push(boorkmark);
    }
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
  checkTabOpen(tab) {
    const tabOpen = this.tabs.find((t) => {
      return t?.uri === tab?.uri;
    });

    return tabOpen;
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
    this.tabs.push(tab);
  }
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true, // if you use AsyncStorage, here shoud be true
});

// create the state
export const browserStore = new BrowserStore();

hydrate("browserStore", browserStore)
  // post hydration
  .then(() => console.log("browserStore hydrated"));
