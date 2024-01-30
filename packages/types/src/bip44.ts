export interface BIP44 {
  readonly coinType: number;
}
export type LedgerAppType = 'cosmos' | 'eth' | 'trx' | 'btc';
export type BIP44HDPath = {
  coinType?: number;
  account: number;
  change: number;
  addressIndex: number;
};

export type HDPath = {
  keyDerivation: number;
  coinType: number;
  account: number;
  change: number;
  addressIndex: number;
};

export enum KeyDerivationTypeEnum {
  BIP44 = '44',
  BIP84 = '84'
}

export type InfoFromLedger = {
  pubKeyHex: string;
  address: string;
  ledgerAppType: LedgerAppType;
  publicKey: Uint8Array;
};
