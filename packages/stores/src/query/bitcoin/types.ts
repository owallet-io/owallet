export interface Query {}
export interface BtcTokenInfo {
  address: string;
  blockHeight: number;
  confirmations: number;
  path: string;
  tx_hash: string;
  tx_hash_big_endian: string;
  tx_output_n: number;
  txid: string;
  value: number;
  vout: number;
}
export type Result = {
  balance: number;
  utxos: BtcTokenInfo[];
};
