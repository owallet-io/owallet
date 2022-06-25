import { observable, action, makeObservable } from 'mobx';

export class DeepLinkStore {
  @observable
  protected linkUri: string;

  constructor() {
    this.linkUri = '';
    makeObservable(this);
  }

  @action
  updateDeepLink(link = '') {
    this.linkUri = link;
  }

  @action
  getDeepLink() {
    return this.linkUri;
  }
}
