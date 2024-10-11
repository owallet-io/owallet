export interface KVStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, data: T | null): Promise<void>;
  prefix(): string;
  type?(): KVStoreType;
}

export interface MultiGet {
  multiGet(keys: string[]): Promise<{ [key: string]: any }>;
}

export enum KVStoreType {
  extension = "extension",
  mobile = "mobile",
}

export interface KVStoreProvider {
  get(key: string): Promise<{ [key: string]: any }>;
  set(items: { [key: string]: any }): Promise<void>;
}
