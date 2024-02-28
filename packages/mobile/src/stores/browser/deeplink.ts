import { observable, action, makeObservable, computed } from "mobx";

export class DeepLinkStore {
  @observable
  protected linkUri: string;

  constructor() {
    this.linkUri = "";
    makeObservable(this);
  }

  @action
  updateDeepLink(link = "") {
    this.linkUri = link;
  }

  @computed
  get link() {
    return this.linkUri;
  }
}
