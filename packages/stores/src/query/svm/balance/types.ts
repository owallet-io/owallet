import { CoinPrimitive } from "../../../common";

export type BalancesRpc = {
  id: number;
  jsonrpc: string;
  result: string;
};

export type Balances = {
  balances: CoinPrimitive[];
};
