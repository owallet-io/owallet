import { CoinPrimitive } from '../../../common';

// export type Balances = {
//   id: number;
//   jsonrpc: string;
//   result: string;
// };

export type Balances = {
  balances: CoinPrimitive[];
};
