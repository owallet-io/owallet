import { observable, action, makeObservable, computed } from "mobx";
import { create, persist } from "mobx-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class Notification {
  @persist("list")
  @observable
  protected readNotifications: Array<any>;
  @observable
  protected notiData: {};
  @observable
  protected totalNotifications: number;

  constructor() {
    makeObservable(this);
    this.readNotifications = [];
  }

  @computed
  get getNotiData() {
    return this.notiData;
  }

  @computed
  get getTotal() {
    return this.totalNotifications;
  }

  @action
  updateTotal(total) {
    this.totalNotifications = total;
  }

  @action
  updateNotidata(data) {
    this.notiData = data;
  }

  @action
  removeNotidata() {
    this.notiData = {};
  }

  @computed
  get getReadNotifications() {
    return this.readNotifications;
  }

  @action
  updateReadNotifications(id) {
    this.readNotifications.push(id);
  }

  @action
  removeReadNotification(id) {
    const index = this.readNotifications.indexOf(id);
    if (index > -1) {
      this.readNotifications.splice(index, 1);
    }
  }
}

const hydrate = create({
  storage: AsyncStorage, // or AsyncStorage in react-native.
  jsonify: true, // if you use AsyncStorage, here shoud be true
});

export const notification = new Notification();

hydrate("notification", notification).then(() =>
  console.log("notification hydrated")
);
