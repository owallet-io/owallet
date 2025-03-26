# Fee Currency Exchange Rate Feature

This directory contains tests and documentation for the fee currency exchange rate feature in OWallet.

## Overview

The exchange rate feature allows for accurate fee calculation when users select different fee currencies in the transaction fee dropdown. Exchange rates are applied to ensure that the economic cost of transaction fees remains approximately equivalent regardless of which currency is selected.

## Files in this Directory

1. **fee-exchange-rate.test.ts**
   - Test file demonstrating how the exchange rate is applied to fee calculations
   - Includes test cases for currencies that are more valuable and less valuable than the default

2. **exchange-rate-config-example.ts**
   - Example configuration showing how to structure feeCurrencies with exchange rates
   - Demonstrates the relationship between more valuable and less valuable tokens

3. **config-update-example.ts**
   - Example showing how to update the main config.ts file to include exchange rates
   - Compares original and updated configurations

4. **generate-exchange-rates.ts**
   - Utility script to calculate exchange rates based on current market prices
   - Includes examples for hardcoded values and a mock CoinGecko API implementation

5. **exchange-rate-documentation.md**
   - Comprehensive documentation on implementing and using exchange rates
   - Includes examples, calculations, and explanations of the feature

## How to Use

1. Review the `exchange-rate-documentation.md` for a complete understanding of the feature
2. Run the tests in `fee-exchange-rate.test.ts` to verify the implementation
3. Use the `generate-exchange-rates.ts` script to calculate exchange rates for your chains
4. Update your `config.ts` file following the examples in `config-update-example.ts`

## Exchange Rate Formula

The exchange rate is defined as:
```
exchangeRate = (default token value) / (this token value)
```

- For tokens MORE valuable than the default: `exchangeRate < 1`
- For tokens LESS valuable than the default: `exchangeRate > 1`

## Examples

A transaction requiring 100,000 gas with a gas price of 0.025:

1. Default currency (OSMO):
   - Fee = 100,000 × 0.025 = 2,500 uosmo

2. More valuable currency (ION with exchangeRate = 0.05):
   - Fee = 100,000 × 0.025 × 0.05 = 125 uion

3. Less valuable currency (USDC with exchangeRate = 20):
   - Fee = 100,000 × 0.025 × 20 = 50,000 uusdc 