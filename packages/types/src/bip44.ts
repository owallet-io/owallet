export interface BIP44 {
  readonly coinType: number;
}
export type BIP44HDPath = {
  coinType?: number;
  account: number;
  change: number;
  addressIndex: number;
};
