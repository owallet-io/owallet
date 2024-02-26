import { KeyStore } from "../crypto";

export type AddressesLedger = {
  cosmos?: string;
  eth?: string;
  trx?: string;
};
export type MultiKeyStoreInfoElem = Pick<
  KeyStore,
  'version' | 'type' | 'meta' | 'bip44HDPath' | 'coinTypeForChain'
>;
export type MultiKeyStoreInfoWithSelectedElem = MultiKeyStoreInfoElem & {
  selected: boolean;
  addresses?: AddressesLedger;
};
export type MultiKeyStoreInfoWithSelected = MultiKeyStoreInfoWithSelectedElem[];

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED
}

export const KeyStoreKey = 'key-store';
export const KeyMultiStoreKey = 'key-multi-store';



type PDFType = Record<'pbkdf2' | 'sha256' | 'scrypt', KeyStore>;
export type TypeMockKeyStore = Record<'mnemonic' | 'ledger' | 'privateKey', PDFType>;
