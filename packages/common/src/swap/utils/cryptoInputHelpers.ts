// cryptoInputHelpers.js
/**
 * Helper functions for CryptoAmountInput component
 */

/**
 * Remove non-numeric characters except dots and commas
 */
export const cleanInput = (input) => {
  if (input === null || input === undefined || input === "") return "";
  const stringInput = typeof input === "number" ? input.toString() : input;
  return stringInput.replace(/[^\d.,]/g, "");
};

/**
 * Handle comma as decimal separator conversion
 */
export const handleCommaAsDecimal = (processed) => {
  if (!processed) return processed;

  // Handle trailing comma case (e.g., "6666,88," -> "6666,88")
  if (processed.endsWith(",")) {
    processed = processed.slice(0, -1);
  }

  const lastCommaIndex = processed.lastIndexOf(",");
  if (lastCommaIndex === -1) return processed;

  const lastDotIndex = processed.lastIndexOf(".");
  const hasExistingDot = processed.includes(".");

  // If there's already a dot and comma comes after it
  if (hasExistingDot && lastCommaIndex > lastDotIndex) {
    // This means we have something like "1.000,5"
    // We should treat the comma as part of decimal (not decimal separator)
    // So "1.000,5" becomes "1.0005"
    let result =
      processed.substring(0, lastCommaIndex) +
      processed.substring(lastCommaIndex + 1);
    // Remove any remaining commas that were thousand separators
    return result.replace(/,/g, "");
  } else if (!hasExistingDot) {
    // No existing dot, so comma should be decimal separator
    // "1000,5" becomes "1000.5"
    const result =
      processed.substring(0, lastCommaIndex) +
      "." +
      processed.substring(lastCommaIndex + 1);
    // Remove all other commas (they were thousand separators)
    return result.replace(/,/g, "");
  } else {
    // Comma comes before dot, so all commas are thousand separators
    // "1,000.50" becomes "1000.50"
    return processed.replace(/,/g, "");
  }
};

/**
 * Handle multiple dots - keep only the first meaningful dot
 */
export const handleMultipleDots = (processed) => {
  if (!processed) return processed;

  const dotCount = (processed.match(/\./g) || []).length;
  if (dotCount <= 1) return processed;

  const parts = processed.split(".");
  const integerPart = parts[0];
  const decimalPart = parts.slice(1).join(""); // Combine all parts after first dot
  return integerPart + "." + decimalPart;
};

/**
 * Remove leading zeros from integer part
 */
export const removeLeadingZeros = (processed) => {
  if (!processed) return processed;

  if (processed.includes(".")) {
    const [intPart, decPart] = processed.split(".");
    const cleanIntPart = intPart.replace(/^0+/, "") || "0";
    return cleanIntPart + "." + decPart;
  } else {
    return processed.replace(/^0+/, "") || "0";
  }
};

/**
 * Limit decimal places
 */
export const limitDecimalPlaces = (processed, maxDecimalDigits = 8) => {
  if (!processed || !processed.includes(".")) return processed;

  const [integerPart, decimalPart] = processed.split(".");
  const limitedDecimalPart = decimalPart.substring(0, maxDecimalDigits);
  return integerPart + "." + limitedDecimalPart;
};

/**
 * Smart removal of trailing zeros (preserves significant digits)
 */
export const smartRemoveTrailingZeros = (
  decimalPart,
  isKeyboardActive = false
) => {
  if (!decimalPart || isKeyboardActive) return decimalPart;

  // Don't do anything if it doesn't end with 0
  if (!decimalPart.endsWith("0")) return decimalPart;

  // Find the position of the last non-zero digit
  let lastNonZeroIndex = -1;
  for (let i = decimalPart.length - 1; i >= 0; i--) {
    if (decimalPart[i] !== "0") {
      lastNonZeroIndex = i;
      break;
    }
  }

  // If all are zeros, return empty string
  if (lastNonZeroIndex === -1) return "";

  // Return from start to last non-zero digit
  return decimalPart.substring(0, lastNonZeroIndex + 1);
};

/**
 * Add thousand separators (commas) to integer part
 */
export const addThousandSeparators = (processed) => {
  if (!processed) return processed;

  if (processed.includes(".")) {
    const [integerPart, decimalPart] = processed.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedInteger + "." + decimalPart;
  } else {
    return processed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};

/**
 * Interface for checkLimits options
 */
interface CheckLimitsOptions {
  maxIntegerDigits?: number;
  maxDecimalDigits?: number;
}

/**
 * Check various limits (integer digits, decimal digits)
 */
export const checkLimits = (value, options: CheckLimitsOptions = {}) => {
  const { maxIntegerDigits = 10, maxDecimalDigits = 18 } = options;

  if (!value || value === "") return { valid: true, value: "" };

  let processed = cleanInput(value);
  processed = handleCommaAsDecimal(processed);
  processed = handleMultipleDots(processed);

  // Check integer and decimal limits
  if (processed.includes(".")) {
    let [intPart, decPart] = processed.split(".");

    // Remove leading zeros
    intPart = intPart.replace(/^0+/, "") || "0";

    // Check integer digits limit
    if (intPart !== "0" && intPart.length > maxIntegerDigits) {
      return { valid: false, value: processed, reason: "integer_limit" };
    }

    // Check decimal digits limit
    if (decPart.length > maxDecimalDigits) {
      decPart = decPart.substring(0, maxDecimalDigits);
    }

    processed = intPart + "." + decPart;
  } else {
    processed = processed.replace(/^0+/, "") || "0";

    // Check integer digits limit
    if (processed !== "0" && processed.length > maxIntegerDigits) {
      return { valid: false, value: processed, reason: "integer_limit" };
    }
  }

  return { valid: true, value: processed };
};

/**
 * Handle trailing comma/dot for keyboard input
 */
export const handleTrailingInput = (
  processed,
  originalValue,
  keepTrailingCommaAsDot
) => {
  if (!keepTrailingCommaAsDot) return processed;

  const hasTrailingComma = originalValue.endsWith(",");

  if (hasTrailingComma && !processed.endsWith(".")) {
    return processed + ".";
  }

  return processed;
};

/**
 * Interface for formatForDisplay options
 */
interface FormatForDisplayOptions {
  keepTrailingCommaAsDot?: boolean;
  isKeyboardActive?: boolean;
  maxDisplayLength?: number;
  maxIntegerDigits?: number;
  maxDecimalDigits?: number;
  currentDisplayValue?: string;
}

/**
 * Main format function that orchestrates all the formatting steps
 */
export const formatForDisplay = (
  value,
  options: FormatForDisplayOptions = {}
) => {
  const {
    keepTrailingCommaAsDot = false,
    isKeyboardActive = false,
    maxDisplayLength = 18,
    maxIntegerDigits = 10,
    maxDecimalDigits = 18,
    currentDisplayValue = "",
  } = options;

  if (!value || value === "") return "";

  // Step 1: Check limits first
  const limitCheck = checkLimits(value, { maxIntegerDigits, maxDecimalDigits });
  if (!limitCheck.valid) {
    return currentDisplayValue; // Return old value if exceeds limits
  }

  let processed = limitCheck.value;

  // Step 2: Handle trailing comma/dot
  processed = handleTrailingInput(processed, value, keepTrailingCommaAsDot);

  // Step 3: Remove trailing zeros (smart)
  if (!keepTrailingCommaAsDot && processed.includes(".")) {
    const [integerPart, decimalPart] = processed.split(".");
    const cleanDecimalPart = smartRemoveTrailingZeros(
      decimalPart,
      isKeyboardActive
    );
    processed = integerPart + (cleanDecimalPart ? "." + cleanDecimalPart : "");
  }

  // Step 4: Add thousand separators
  processed = addThousandSeparators(processed);

  // Step 5: Check display length limit
  if (processed.length > maxDisplayLength) {
    return currentDisplayValue; // Return old value if too long
  }

  return processed;
};

/**
 * Get clean numeric value (remove commas)
 */
export const getCleanValue = (value) => {
  if (!value) return "";
  return value.replace(/,/g, "");
};

/**
 * Convert to blockchain raw value
 */
export const getRawValue = (cleanValue, decimals = 18) => {
  if (!cleanValue || cleanValue === "0" || cleanValue === "") return "0";

  const numValue = parseFloat(cleanValue);
  if (isNaN(numValue)) return "0";

  // Convert to raw value by multiplying with 10^decimals
  const rawValue = (numValue * Math.pow(10, decimals)).toString();
  return rawValue.split(".")[0]; // Remove any decimal point
};

/**
 * Interface for validateInput options
 */
interface ValidateInputOptions {
  maxRawInputLength?: number;
  maxDisplayLength?: number;
  maxIntegerDigits?: number;
  maxDecimalDigits?: number;
}

/**
 * Validate input against all constraints
 */
export const validateInput = (text, options: ValidateInputOptions = {}) => {
  const {
    maxRawInputLength = 28,
    maxDisplayLength = 18,
    maxIntegerDigits = 10,
    maxDecimalDigits = 18,
  } = options;

  const errors = [];

  if (text.length > maxRawInputLength) {
    errors.push("raw_input_too_long");
  }

  const limitCheck = checkLimits(text, { maxIntegerDigits, maxDecimalDigits });
  if (!limitCheck.valid) {
    errors.push(limitCheck.reason);
  }

  // Check formatted display length
  const formatted = formatForDisplay(text, {
    maxDisplayLength: 999, // Temporarily ignore display length for this check
    maxIntegerDigits,
    maxDecimalDigits,
  });

  if (formatted.length > maxDisplayLength) {
    errors.push("display_too_long");
  }

  return {
    valid: errors.length === 0,
    errors,
    formatted,
  };
};
