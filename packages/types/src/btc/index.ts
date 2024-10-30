import { Coin } from "../cosmjs";

export interface StdBtcFee {
  readonly amount: readonly Coin[];
}
