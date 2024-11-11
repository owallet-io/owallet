import { SettledResponses } from "../settled";
import EventEmitter from "events";
import { Key } from "../wallet";

export interface ITronProvider extends EventEmitter {
  getKey(chainId: string): Promise<Key>;
  getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>>;
  sendTx(chainId: string, signedTx: unknown): Promise<string>;
  sign(chainId: string, data: string | object): Promise<unknown>;
  sendRawTransaction(transaction: {
    raw_data: any;
    raw_data_hex: string;
    txID: string;
    visible?: boolean;
  }): Promise<object>;
  triggerSmartContract(
    address: string,
    functionSelector: string,
    options: any,
    parameters: any[],
    issuerAddress: string
  ): Promise<any>;
  tron_requestAccounts(): Promise<object>;
}
