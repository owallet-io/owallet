import { SettledResponses } from "../settled";
import EventEmitter from "events";
import { Key } from "../wallet";

export interface ITronProvider extends EventEmitter {
  getKey(chainId: string): Promise<Key>;
  getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>>;
  getDefaultAddress(): Promise<SettledResponses<Key>>;
  sendTx(chainId: string, signedTx: unknown): Promise<string>;
  sign(chainId: string, data: string | object): Promise<unknown>;
}
