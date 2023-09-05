export type TokenInfo = {
  symbol: string;
  logo: any;
  network: string;
  available?: string;
  networkLogo?: any;
};

/**
 * Prices of each token.
 */
export type CoinGeckoPrices<T extends string> = {
  [C in T]: number | null;
};
