import { KVStore, KVStoreType } from "@owallet/common";
import AsyncStorage from "@react-native-async-storage/async-storage";

// polyfill for common
globalThis.AsyncStorage = AsyncStorage;
(global as any).localStorage = AsyncStorage;
export class AsyncKVStore implements KVStore {
  constructor(private readonly _prefix: string) {}

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;

    const data = await AsyncStorage.getItem(k);
    if (data === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(data));
  }

  async set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    if (data === null) {
      await AsyncStorage.removeItem(k);
    }

    return await AsyncStorage.setItem(k, JSON.stringify(data));
  }
  async multiGet(keys: string[]): Promise<{ [p: string]: any }> {
    // Remove duplications
    keys = Array.from(new Set(keys));
    const prefixedKeys = keys.map((k) => this.prefix() + "/" + k);

    const res: { [key: string]: any } = {};

    const data = await AsyncStorage.multiGet(prefixedKeys);
    for (const [prefixedKey, value] of data) {
      const key = prefixedKey.slice(this.prefix().length + 1);
      if (value != null) {
        res[key] = JSON.parse(value);
      }
    }

    return res;
  }
  prefix(): string {
    return this._prefix;
  }
  type(): KVStoreType {
    return KVStoreType.mobile;
  }
}
