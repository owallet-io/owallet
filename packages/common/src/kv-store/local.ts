// @ts-nocheck
import { KVStore, KVStoreType } from "./interface";

export class LocalKVStore implements KVStore {
  constructor(private readonly _prefix: string) {}

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;
    if (typeof AsyncStorage === "undefined") {
      const data = localStorage.getItem(k);
      if (data === null) {
        return Promise.resolve(undefined);
      }
      return Promise.resolve(JSON.parse(data));
    }

    return AsyncStorage.getItem().then((data: any) => {
      if (data === null) {
        return undefined;
      }
      return JSON.parse(data);
    });
  }

  async set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    if (data === null) {
      return typeof AsyncStorage === "undefined"
        ? Promise.resolve(localStorage.removeItem(k))
        : AsyncStorage.removeItem(k);
    }
    return typeof AsyncStorage === "undefined"
      ? Promise.resolve(localStorage.setItem(k, JSON.stringify(data)))
      : AsyncStorage.setItem(k, JSON.stringify(data));
  }

  prefix(): string {
    return this._prefix;
  }

  type(): KVStoreType {
    return KVStoreType.extension;
  }
}
