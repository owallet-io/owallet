/**
 * Example configuration file showing how to set up exchange rates for fee currencies
 *
 * Exchange rates are defined as the value of the fee currency relative to the default fee currency:
 * - If a token is MORE valuable, use a value LESS than 1 (e.g., 0.05 means it's 20x more valuable)
 * - If a token is LESS valuable, use a value GREATER than 1 (e.g., 20 means it's 20x less valuable)
 */

export const osmosisChainConfig = {
  chainId: "osmosis-1",
  chainIdentifier: "osmosis",
  feeCurrencies: [
    // Default fee currency (OSMO)
    {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.04,
      },
      // No exchangeRate needed for default fee currency
    },
    // ION is more valuable than OSMO (20x), so we use 0.05 (1/20)
    {
      coinDenom: "ION",
      coinMinimalDenom: "uion",
      coinDecimals: 6,
      coinGeckoId: "ion",
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.04,
      },
      exchangeRate: 0.05, // ION is 20x more valuable than OSMO (1/0.05 = 20)
    },
    // USDC is less valuable than OSMO (1/20x), so we use 20
    {
      coinDenom: "USDC",
      coinMinimalDenom: "ibc/usdc",
      coinDecimals: 6,
      coinGeckoId: "usd-coin",
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.04,
      },
      exchangeRate: 20, // USDC is 20x less valuable than OSMO
    },
  ],
};

/**
 * This is how fee calculation works with exchange rates:
 *
 * 1. For the default fee currency (no exchangeRate):
 *    fee = gasAmount * gasPrice
 *    Example: 100,000 * 0.025 = 2,500 uosmo
 *
 * 2. For more valuable currencies (exchangeRate < 1):
 *    fee = gasAmount * gasPrice * exchangeRate
 *    Example: 100,000 * 0.025 * 0.05 = 125 uion
 *    Fewer tokens are needed since each is more valuable
 *
 * 3. For less valuable currencies (exchangeRate > 1):
 *    fee = gasAmount * gasPrice * exchangeRate
 *    Example: 100,000 * 0.025 * 20 = 50,000 ibc/usdc
 *    More tokens are needed since each is less valuable
 */
