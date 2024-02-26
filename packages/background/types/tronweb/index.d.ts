import utils from './utils';
import providers from './lib/providers';
import Plugin from './lib/plugin';
import Event from './lib/event';
import TransactionBuilder from './lib/transactionBuilder';
import Trx from './lib/trx';
import Contract from './lib/contract';
import BigNumber from 'bignumber.js';

type Utils = typeof utils;
type Providers = typeof providers;

declare global {
  class TronWeb {
    static providers: Providers;
    static BigNumber: typeof BigNumber;
    static TransactionBuilder: TransactionBuilder;
    static Trx: Trx;
    static Contract: Contract;
    static Plugin: Plugin;
    static Event: Event;
    static version: string;
    static utils: Utils;
    static get address(): {
      fromHex(address: string): any;
      toHex(address: any): string;
      fromPrivateKey(privateKey: any, strict?: boolean): any;
    };
    static sha3(string: string, prefix?: string): string;
    static toHex(val: any): any;
    static toUtf8(hex: any): string;
    static fromUtf8(string: any): string;
    static toAscii(hex: any): string;
    static fromAscii(string: any, padding: any): string;
    static toDecimal(value: any): any;
    static fromDecimal(value: any): string;
    static fromSun(sun: any): any;
    static toSun(trx: any): any;
    static toBigNumber(amount?: number): number | BigNumber;
    static isAddress(address?: boolean): any;
    static createAccount(): Promise<any>;
    static createRandom(options: any): any;
    static fromMnemonic(mnemonic: any, path?: any, wordlist?: string): any;
    constructor(
      optionsOrFullNode?:
        | {
            fullNode?: string;
            fullHost?: string;
            solidityNode?: string;
            eventServer?: string;
            privateKey?: string;
          }
        | string,
      solidityNode?: string,
      eventServer?: string,
      sideOptions?: string,
      privateKey?: string
    );
    event: Event;
    transactionBuilder: TransactionBuilder;
    trx: Trx;
    plugin: Plugin;
    utils: Utils;
    providers: Providers;
    BigNumber: typeof BigNumber;
    defaultBlock: boolean;
    defaultPrivateKey: boolean;
    defaultAddress: {
      hex: string;
      base58: string;
    };
    sidechain: any;
    fullnodeVersion: string;
    feeLimit: number;
    injectPromise: any;
    getFullnodeVersion(): Promise<void>;
    setDefaultBlock(blockID?: boolean): boolean;
    setPrivateKey(privateKey: any): void;
    setAddress(address: any): void;
    fullnodeSatisfies(version: any): any;
    isValidProvider(provider: any): boolean;
    setFullNode(fullNode: any): void;
    fullNode: any;
    setSolidityNode(solidityNode: any): void;
    solidityNode: any;
    setEventServer(...params: any[]): void;
    setHeader(headers?: {}): void;
    setFullNodeHeader(headers?: {}): void;
    setEventHeader(headers?: {}): void;
    currentProviders(): {
      fullNode: any;
      solidityNode: any;
      eventServer: any;
    };
    currentProvider(): {
      fullNode: any;
      solidityNode: any;
      eventServer: any;
    };
    getEventResult(...params: any[]): any;
    getEventByTransactionID(...params: any[]): any;
    contract(abi?: any[], address?: boolean): Contract;
    isConnected(callback?: boolean): Promise<boolean>;
  }
}
