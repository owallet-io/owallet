import { observable, action, makeObservable, computed } from "mobx";
import { create, persist } from "mobx-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const DAppInfos = [
  {
    id: 0,
    name: "TEST SOLANA",
    uri: "https://anza-xyz.github.io/wallet-adapter/example/",
  },
  {
    id: 1,
    name: "Oraidex",
    uri: "https://app.oraidex.io/",
  },
  {
    id: 3,
    name: "Orderbook",
    uri: "https://orderbook.oraidex.io/",
  },
  {
    id: 4,
    name: "Futures",
    uri: "https://futures.oraidex.io/",
  },
  {
    id: 2,
    name: "Osmosis",
    uri: "https://app.osmosis.zone/",
  },
  {
    id: 6,
    name: "Oraichain Scan",
    uri: "https://scan.orai.io/",
  },
  {
    id: 4,
    name: "Orchai App",
    uri: "https://app.orchai.io/",
  },
  // {
  //   id: 5,
  //   name: "aiRight",
  //   uri: "https://airight.io/",
  // },
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
  @observable
  protected inject_source: string | null;

  constructor() {
    this.bookmarks = [...DAppInfos];
    this.tabs = [];
    this.inject_source = null;
    makeObservable(this);
  }

  @action
  updateBookmarks(bookmarks) {
    this.bookmarks = bookmarks;
  }

  @action
  update_inject(inject: string) {
    this.inject_source = inject;
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

  @computed
  get inject() {
    return this.inject_source;
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
