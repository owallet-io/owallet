// cryptoInputHelpers.test.js
import {
    cleanInput,
    handleCommaAsDecimal,
    handleMultipleDots,
    removeLeadingZeros,
    limitDecimalPlaces,
    smartRemoveTrailingZeros,
    addThousandSeparators,
    checkLimits,
    // handleTrailingInput,
    formatForDisplay,
    getCleanValue,
    getRawValue,
    validateInput
  } from './cryptoInputHelpers';
  
  describe('CryptoAmountInput Helpers', () => {
    
    describe('cleanInput', () => {
      test('should remove non-numeric characters except dots and commas', () => {
        expect(cleanInput('123abc456')).toBe('123456');
        expect(cleanInput('123.456')).toBe('123.456');
        expect(cleanInput('123,456')).toBe('123,456');
        expect(cleanInput('123.456,789')).toBe('123.456,789');
        expect(cleanInput('$123.45')).toBe('123.45');
        expect(cleanInput('')).toBe('');
        expect(cleanInput(null)).toBe('');
      });
  
      test('should handle number input', () => {
        expect(cleanInput(123.456)).toBe('123.456');
        expect(cleanInput(0)).toBe('0');
      });
    });
  
    describe('handleCommaAsDecimal', () => {
      test('should convert last comma to decimal point when no dots exist', () => {
        expect(handleCommaAsDecimal('123,456')).toBe('123.456');
        expect(handleCommaAsDecimal('1000,5')).toBe('1000.5');
      });
  
      test('should convert last comma to decimal when it comes after the last dot', () => {
        expect(handleCommaAsDecimal('1.000,5')).toBe('1.0005');
        expect(handleCommaAsDecimal('12.345,67')).toBe('12.34567');
        expect(handleCommaAsDecimal('6666,88,')).toBe('6666.88');
      });
  
      test('should remove all commas when they are thousand separators', () => {
        expect(handleCommaAsDecimal('1,000.50')).toBe('1000.50');
        expect(handleCommaAsDecimal('123,456.789')).toBe('123456.789');
      });
  
      test('should handle edge cases', () => {
        expect(handleCommaAsDecimal('')).toBe('');
        expect(handleCommaAsDecimal('123')).toBe('123');
        expect(handleCommaAsDecimal('123.')).toBe('123.');
      });
    });
  
    describe('handleMultipleDots', () => {
      test('should keep only first dot and combine decimal parts', () => {
        expect(handleMultipleDots('123.456.789')).toBe('123.456789');
        expect(handleMultipleDots('1.2.3.4.5')).toBe('1.2345');
        expect(handleMultipleDots('123.456.789.0')).toBe('123.4567890');
      });
  
      test('should not change input with single or no dots', () => {
        expect(handleMultipleDots('123.456')).toBe('123.456');
        expect(handleMultipleDots('123456')).toBe('123456');
        expect(handleMultipleDots('')).toBe('');
      });
    });
  
    describe('removeLeadingZeros', () => {
      test('should remove leading zeros from integer part', () => {
        expect(removeLeadingZeros('000123')).toBe('123');
        expect(removeLeadingZeros('000123.456')).toBe('123.456');
        expect(removeLeadingZeros('00000.456')).toBe('0.456');
      });
  
      test('should preserve single zero', () => {
        expect(removeLeadingZeros('0')).toBe('0');
        expect(removeLeadingZeros('000')).toBe('0');
        expect(removeLeadingZeros('0.123')).toBe('0.123');
      });
  
      test('should handle edge cases', () => {
        expect(removeLeadingZeros('')).toBe('');
        expect(removeLeadingZeros('123')).toBe('123');
      });
    });
  
    describe('limitDecimalPlaces', () => {
      test('should limit decimal places to specified length', () => {
        expect(limitDecimalPlaces('123.123456789', 6)).toBe('123.123456');
        expect(limitDecimalPlaces('123.123456789', 3)).toBe('123.123');
        expect(limitDecimalPlaces('123.1', 6)).toBe('123.1');
      });
  
      test('should not affect integers', () => {
        expect(limitDecimalPlaces('123', 6)).toBe('123');
        expect(limitDecimalPlaces('123456', 3)).toBe('123456');
      });
  
      test('should use default limit of 8', () => {
        expect(limitDecimalPlaces('123.123456789')).toBe('123.12345678');
      });
    });
  
    describe('smartRemoveTrailingZeros', () => {
      test('should remove only meaningless trailing zeros', () => {
        expect(smartRemoveTrailingZeros('123000')).toBe('123');
        expect(smartRemoveTrailingZeros('100001')).toBe('100001');
        expect(smartRemoveTrailingZeros('100100')).toBe('1001');
        expect(smartRemoveTrailingZeros('000001')).toBe('000001');
      });
  
      test('should return empty string if all zeros', () => {
        expect(smartRemoveTrailingZeros('000000')).toBe('');
        expect(smartRemoveTrailingZeros('0')).toBe('');
      });
  
      test('should not remove zeros when keyboard is active', () => {
        expect(smartRemoveTrailingZeros('123000', true)).toBe('123000');
        expect(smartRemoveTrailingZeros('100100', true)).toBe('100100');
      });
  
      test('should not change strings not ending with zero', () => {
        expect(smartRemoveTrailingZeros('123456')).toBe('123456');
        expect(smartRemoveTrailingZeros('1001')).toBe('1001');
      });
  
      test('should handle edge cases', () => {
        expect(smartRemoveTrailingZeros('')).toBe('');
        expect(smartRemoveTrailingZeros(null)).toBe(null);
      });
    });
  
    describe('addThousandSeparators', () => {
      test('should add commas to integer part', () => {
        expect(addThousandSeparators('1000')).toBe('1,000');
        expect(addThousandSeparators('1000000')).toBe('1,000,000');
        expect(addThousandSeparators('123456789')).toBe('123,456,789');
      });
  
      test('should add commas to integer part with decimals', () => {
        expect(addThousandSeparators('1000.123')).toBe('1,000.123');
        expect(addThousandSeparators('1000000.456789')).toBe('1,000,000.456789');
      });
  
      test('should not affect small numbers', () => {
        expect(addThousandSeparators('123')).toBe('123');
        expect(addThousandSeparators('999')).toBe('999');
        expect(addThousandSeparators('123.456')).toBe('123.456');
      });
    });
  
    describe('checkLimits', () => {
      const defaultOptions = {
        maxIntegerDigits: 5,
        maxDecimalDigits: 3
      };
  
      test('should validate within limits', () => {
        expect(checkLimits('12345.123', defaultOptions)).toEqual({
          valid: true,
          value: '12345.123'
        });
        expect(checkLimits('1.123', defaultOptions)).toEqual({
          valid: true,
          value: '1.123'
        });
      });
  
      test('should reject when integer digits exceed limit', () => {
        const result = checkLimits('123456.123', defaultOptions);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('integer_limit');
      });
  
      test('should truncate decimal digits when exceed limit', () => {
        expect(checkLimits('123.123456', defaultOptions)).toEqual({
          valid: true,
          value: '123.123'
        });
      });
  
      test('should handle zero correctly', () => {
        expect(checkLimits('0.123', defaultOptions)).toEqual({
          valid: true,
          value: '0.123'
        });
        expect(checkLimits('000.123', defaultOptions)).toEqual({
          valid: true,
          value: '0.123'
        });
      });
    });
  
    describe('formatForDisplay', () => {
      const defaultOptions = {
        maxDisplayLength: 15,
        maxIntegerDigits: 6,
        maxDecimalDigits: 6,
        currentDisplayValue: ''
      };
  
      test('should format basic numbers correctly', () => {
        expect(formatForDisplay('1000.000001', defaultOptions)).toBe('1,000.000001');
        expect(formatForDisplay('1000.100001', defaultOptions)).toBe('1,000.100001');
        expect(formatForDisplay('1000.100000', defaultOptions)).toBe('1,000.1');
      });
  
      test('should handle comma as decimal separator', () => {
        expect(formatForDisplay('1000,5', defaultOptions)).toBe('1,000.5');
        expect(formatForDisplay('123,456', defaultOptions)).toBe('123.456');
      });
  
      test('should preserve trailing comma when keyboard is active', () => {
        const options = { ...defaultOptions, keepTrailingCommaAsDot: true };
        expect(formatForDisplay('1000,', options)).toBe('1,000.');
      });
  
      test('should return current display value when exceeding limits', () => {
        const options = { ...defaultOptions, currentDisplayValue: '999,999' };
        expect(formatForDisplay('1234567', options)).toBe('999,999');
      });
  
      test('should handle empty input', () => {
        expect(formatForDisplay('', defaultOptions)).toBe('');
        expect(formatForDisplay(null, defaultOptions)).toBe('');
      });
    });
  
    describe('getCleanValue', () => {
      test('should remove all commas', () => {
        expect(getCleanValue('1,000,000.123')).toBe('1000000.123');
        expect(getCleanValue('1,000.5')).toBe('1000.5');
        expect(getCleanValue('123')).toBe('123');
      });
  
      test('should handle edge cases', () => {
        expect(getCleanValue('')).toBe('');
        expect(getCleanValue(null)).toBe('');
      });
    });
  
    describe('getRawValue', () => {
      test('should convert to blockchain raw value', () => {
        expect(getRawValue('1', 18)).toBe('1000000000000000000');
        expect(getRawValue('0.000000000000000001', 18)).toBe('1');
        expect(getRawValue('1.5', 2)).toBe('150');
      });
  
      test('should handle edge cases', () => {
        expect(getRawValue('0', 18)).toBe('0');
        expect(getRawValue('', 18)).toBe('0');
        expect(getRawValue('invalid', 18)).toBe('0');
      });
  
      test('should remove decimal points from result', () => {
        expect(getRawValue('1.1', 1)).toBe('11');
        expect(getRawValue('1.99', 1)).toBe('19'); // Note: floating point precision
      });
    });
  
    describe('validateInput', () => {
      const defaultOptions = {
        maxRawInputLength: 10,
        maxDisplayLength: 8,
        maxIntegerDigits: 3,
        maxDecimalDigits: 2
      };
  
      test('should validate correct input', () => {
        const result = validateInput('123.45', defaultOptions);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
  
      test('should detect raw input too long', () => {
        const result = validateInput('12345678901', defaultOptions);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('raw_input_too_long');
      });
  
      test('should detect integer limit exceeded', () => {
        const result = validateInput('1234.5', defaultOptions);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('integer_limit');
      });
  
      test('should detect display too long', () => {
        const result = validateInput('100.99', defaultOptions); // formats to "100.99" = 6 chars, within limit
        expect(result.valid).toBe(true);
        
        const longResult = validateInput('999.99', { ...defaultOptions, maxDisplayLength: 5 });
        expect(longResult.valid).toBe(false);
        expect(longResult.errors).toContain('display_too_long');
      });
    });
  
    // Integration tests
    describe('Integration Tests', () => {
      test('should handle complex real-world scenarios', () => {
        // Test case: "1000.000001" should display as "1,000.000001"
        const result1 = formatForDisplay('1000.000001', {
          maxDisplayLength: 18,
          maxIntegerDigits: 10,
          maxDecimalDigits: 8
        });
        expect(result1).toBe('1,000.000001');
  
        // Test case: "1000.100000" should display as "1,000.1"
        const result2 = formatForDisplay('1000.100000', {
          maxDisplayLength: 18,
          maxIntegerDigits: 10,
          maxDecimalDigits: 8
        });
        expect(result2).toBe('1,000.1');
  
        // Test case: comma as decimal separator
        const result3 = formatForDisplay('1000,000001', {
          maxDisplayLength: 18,
          maxIntegerDigits: 10,
          maxDecimalDigits: 8
        });
        expect(result3).toBe('1,000.000001');
      });
  
      test('should handle keyboard input scenarios', () => {
        // User typing "1000,"
        const result1 = formatForDisplay('1000,', {
          keepTrailingCommaAsDot: true,
          maxDisplayLength: 18,
          maxIntegerDigits: 10,
          maxDecimalDigits: 8
        });
        expect(result1).toBe('1,000.');
  
        // User typing "1000.00" while keyboard active
        const result2 = formatForDisplay('1000.00', {
          keepTrailingCommaAsDot: true,
          isKeyboardActive: true,
          maxDisplayLength: 18,
          maxIntegerDigits: 10,
          maxDecimalDigits: 8
        });
        expect(result2).toBe('1,000.00');
      });
    });
  });