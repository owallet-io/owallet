export type AlgoType = 'secp256k1' | 'ethsecp256k1';

export interface BIP44 {
  readonly coinType: number;
  readonly algo?: string;
}
