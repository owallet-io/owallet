import { PairInfo } from '@oraichain/oraidex-contracts-sdk';
import { TokenItemType } from '../config/bridgeTokens';

export type TokenInfo = TokenItemType & {
  symbol?: string;
  total_supply?: string;
  icon?: string;
  verified?: boolean;
};

export type PairInfoExtend = PairInfo & {
  asset_infos_raw: [string, string];
};
export type AmountDetails = { [denom: string]: string };

/**
 * Prices of each token.
 */
export type CoinGeckoPrices<T extends string> = {
  [C in T]: number | null;
};
