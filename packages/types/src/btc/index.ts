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
