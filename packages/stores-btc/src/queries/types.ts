export type BtcBalances = Utxos[];

export interface Utxos {
  txid: string;
  vout: number;
  status: Status;
  value: number;
}

export interface Status {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}
