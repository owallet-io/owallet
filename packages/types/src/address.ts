export enum AddressBtcType {
  Legacy = "legacy",
  Bech32 = "bech32",
}
export interface IFeeRate {
  low: number;
  average: number;
  high: number;
}
