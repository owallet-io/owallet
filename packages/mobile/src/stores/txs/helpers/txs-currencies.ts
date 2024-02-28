import { currenciesData, defaultCoin } from "./txs-constants";

export class TxsCurrencies {
  private readonly currencies: Currencies;
  constructor() {
    this.currencies = currenciesData;
  }
  getCurrencyInfoByMinimalDenom(coinMinimalDenom: string): CurrencyInfo {
    if (!coinMinimalDenom) {
      return defaultCoin;
    } else if (
      !!coinMinimalDenom &&
      !!this.currencies[coinMinimalDenom] == false
    ) {
      return { ...defaultCoin, coinDenom: coinMinimalDenom };
    }
    return this.currencies[coinMinimalDenom];
  }
  getAllCurrencies(): Currencies {
    return this.currencies;
  }
}
