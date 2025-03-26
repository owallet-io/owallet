# Fee Currency Exchange Rates

## Overview

This documentation explains how to implement and use exchange rates for fee currencies in OWallet. When a user selects a non-default fee currency from the dropdown, the exchange rate is applied to adjust the fee amount based on the relative value of the selected currency compared to the default currency.

## What Are Exchange Rates For?

Exchange rates allow users to pay transaction fees using different currencies while ensuring that the economic cost remains approximately equivalent regardless of which currency is used. For example:

- If a user selects a more valuable token, they should pay proportionally fewer tokens
- If a user selects a less valuable token, they should pay proportionally more tokens

## Implementation

### 1. Update the Currency Type

The `exchangeRate` property is already defined as part of the `WithGasPriceStep` type in `packages/types/src/currency.ts`:

```typescript
export type WithGasPriceStep<T> = T & {
  readonly gasPriceStep?: {
    readonly low: number;
    readonly average: number;
    readonly high: number;
  };
  /**
   * Optional exchange rate for this fee currency relative to the default fee currency.
   * If provided, fees will be multiplied by this value when this currency is selected.
   */
  readonly exchangeRate?: number;
};

export type FeeCurrency = WithGasPriceStep<AppCurrency>;
```

### 2. Update Fee Calculation in FeeConfig

The `getFeeTypePrettyForFeeCurrency` method in `packages/hooks/src/tx/fee.ts` now checks for the presence of an `exchangeRate` property and applies it to the fee calculation:

```typescript
readonly getFeeTypePrettyForFeeCurrency = computedFn(
  (feeCurrency: FeeCurrency, feeType: FeeType) => {
    const gas = this.gasConfig.gas;
    const gasPrice = this.getGasPriceForFeeCurrency(feeCurrency, feeType);

    let feeAmount = gasPrice
      .mul(new Dec(gas))
      .add(this.l1DataFee ?? new Dec(0));
    
    // Apply exchange rate if present
    if (feeCurrency.exchangeRate) {
      console.log("Applying exchange rate:", feeCurrency.exchangeRate);
      console.log("Before exchange rate:", feeAmount.toString());
      feeAmount = feeAmount.mul(new Dec(feeCurrency.exchangeRate));
      console.log("After exchange rate:", feeAmount.toString());
    }

    return new CoinPretty(feeCurrency, feeAmount.roundUp()).maxDecimals(
      feeCurrency.coinDecimals
    );
  }
);
```

### 3. Update Chain Configuration

To implement exchange rates for your chains, update the fee currencies in your configuration files (e.g., `apps/extension/src/config.ts`) by adding the `exchangeRate` property to non-default fee currencies:

```typescript
// For Osmosis chain
{
  chainId: "osmosis-1",
  feeCurrencies: [
    // Default fee currency (OSMO) - no exchange rate needed
    {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.04,
      }
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
      exchangeRate: 0.05 // ION is 20x more valuable than OSMO
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
      exchangeRate: 20 // USDC is 20x less valuable than OSMO
    }
  ],
  // ...other properties
}
```

## How to Calculate Exchange Rates

1. Identify the primary (default) fee currency for your chain
   - This is typically the chain's native token (e.g., OSMO for Osmosis)
   - The default fee currency doesn't need an `exchangeRate` property

2. For each additional fee currency, calculate its value relative to the default:
   - If the token is MORE valuable than the default: use `exchangeRate < 1`
     Formula: `exchangeRate = (default token value) / (this token value)`
     Example: If 1 ION = 20 OSMO, then `exchangeRate = 1/20 = 0.05`

   - If the token is LESS valuable than the default: use `exchangeRate > 1`
     Formula: `exchangeRate = (default token value) / (this token value)`
     Example: If 1 OSMO = 20 USDC, then `exchangeRate = 20`

## Example Calculation

For a transaction requiring 100,000 gas with a gas price of 0.025:

1. Default currency (OSMO):
   - Fee = 100,000 × 0.025 = 2,500 uosmo

2. More valuable currency (ION with exchangeRate = 0.05):
   - Fee = 100,000 × 0.025 × 0.05 = 125 uion

3. Less valuable currency (USDC with exchangeRate = 20):
   - Fee = 100,000 × 0.025 × 20 = 50,000 uusdc

## Testing

You can run the test case in `packages/hooks/src/tx/__tests__/fee-exchange-rate.test.ts` to verify that the exchange rate functionality works correctly:

```bash
npm test -- -t "FeeConfig with exchange rates"
``` 