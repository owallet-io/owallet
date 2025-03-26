/**
 * Fee Currency Exchange Rate Example
 *
 * This file demonstrates how exchange rates are applied to fee calculations
 * without requiring the full test environment.
 */

// Simple mock of the Dec class
class Dec {
  constructor(value) {
    this.value = Number(value);
  }

  mul(other) {
    return new Dec(this.value * other.value);
  }

  toString() {
    return this.value.toString();
  }

  truncate() {
    return new Dec(Math.floor(this.value));
  }
}

// Mock currencies with exchange rates
const currencies = {
  // Default fee currency
  osmo: {
    coinDenom: "OSMO",
    coinMinimalDenom: "uosmo",
    coinDecimals: 6,
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    // No exchange rate needed for default currency
  },

  // More valuable currency (20x more valuable than OSMO)
  ion: {
    coinDenom: "ION",
    coinMinimalDenom: "uion",
    coinDecimals: 6,
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    exchangeRate: 0.05, // 1/20 = 0.05
  },

  // Less valuable currency (20x less valuable than OSMO)
  usdc: {
    coinDenom: "USDC",
    coinMinimalDenom: "ibc/usdc",
    coinDecimals: 6,
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    exchangeRate: 20,
  },
};

// Mock function to calculate fee with exchange rate
function calculateFee(feeCurrency, gasAmount, gasPrice) {
  console.log(`\nCalculating fee for ${feeCurrency.coinDenom}:`);
  console.log(`- Gas amount: ${gasAmount}`);
  console.log(`- Gas price: ${gasPrice}`);

  let feeAmount = new Dec(gasPrice).mul(new Dec(gasAmount));
  console.log(
    `- Base fee amount (before exchange rate): ${feeAmount.toString()} ${
      feeCurrency.coinMinimalDenom
    }`
  );

  // Apply exchange rate if present
  if (feeCurrency.exchangeRate) {
    console.log(`- Applying exchange rate: ${feeCurrency.exchangeRate}`);
    feeAmount = feeAmount.mul(new Dec(feeCurrency.exchangeRate));
    console.log(
      `- Adjusted fee amount: ${feeAmount.toString()} ${
        feeCurrency.coinMinimalDenom
      }`
    );
  } else {
    console.log(`- No exchange rate applied (default currency)`);
  }

  const finalFee = feeAmount.truncate();
  console.log(
    `- Final fee: ${finalFee.toString()} ${feeCurrency.coinMinimalDenom}`
  );

  return finalFee;
}

// Demo the exchange rate functionality
function demonstrateExchangeRates() {
  console.log("=== FEE CURRENCY EXCHANGE RATE DEMONSTRATION ===");

  const gasAmount = 100000;
  const gasPrice = 0.025;

  // Calculate fee for default currency (OSMO)
  const osmoFee = calculateFee(currencies.osmo, gasAmount, gasPrice);

  // Calculate fee for more valuable currency (ION)
  const ionFee = calculateFee(currencies.ion, gasAmount, gasPrice);

  // Calculate fee for less valuable currency (USDC)
  const usdcFee = calculateFee(currencies.usdc, gasAmount, gasPrice);

  // Summary
  console.log("\n=== SUMMARY ===");
  console.log(
    `OSMO Fee: ${osmoFee.toString()} ${currencies.osmo.coinMinimalDenom}`
  );
  console.log(
    `ION Fee:  ${ionFee.toString()} ${
      currencies.ion.coinMinimalDenom
    } (20x more valuable than OSMO)`
  );
  console.log(
    `USDC Fee: ${usdcFee.toString()} ${
      currencies.usdc.coinMinimalDenom
    } (20x less valuable than OSMO)`
  );

  // Verify the relationships
  const osmoToIonRatio =
    parseInt(osmoFee.toString()) / parseInt(ionFee.toString());
  const osmoToUsdcRatio =
    parseInt(usdcFee.toString()) / parseInt(osmoFee.toString());

  console.log("\n=== VERIFICATION ===");
  console.log(`OSMO/ION ratio: ${osmoToIonRatio.toFixed(2)} (should be ~20)`);
  console.log(`USDC/OSMO ratio: ${osmoToUsdcRatio.toFixed(2)} (should be ~20)`);
}

// Run the demonstration
demonstrateExchangeRates();
