import { Coin } from "../cosmjs";

export interface StdBtcFee {
  readonly amount: readonly Coin[];
}

export enum TransactionBtcType {
  Legacy = "legacy",
  Bech32 = "bech32",
  TapRoot = "tap-root",
  Segwit = "segwit",
}

export interface UnsignedBtcTransaction {
  amount: string;
  to: string;
  sender: string;
  memo: string;
  coinMinimalDenom: string;
  chainId: string;
}

export interface TxBtcInfo {
  txid: string;
  version: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee: number;
  status: Status;
}

export interface Vin {
  txid: string;
  vout: number;
  prevout: Prevout;
  scriptsig: string;
  scriptsig_asm: string;
  is_coinbase: boolean;
  sequence: number;
}

export interface Prevout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface Vout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value: number;
}

export interface Status {
  confirmed: boolean;
}
