import { TokenInfoResponse } from '@oraichain/oraidex-contracts-sdk/build/OraiswapToken.types';
import { TokenItemType, tokenMap } from '../config/bridgeTokens';
import { AmountDetails } from '../types/token';
import { CoinGeckoPrices, TokenInfo } from '../types';
export const truncDecimals = 6;
export const atomic = 10 ** truncDecimals;
export class Utils {
  /**
   * Deep clone a object
   * @param object The object
   */
  public static deepClone<T>(object: T): T {
    return JSON.parse(JSON.stringify(object)) as T;
  }
}

export const toTokenInfo = (
  token: TokenItemType,
  info?: TokenInfoResponse
): TokenInfo => {
  const data = (info as any)?.token_info_response ?? info;
  return {
    ...token,
    symbol: token.name,
    verified: !token.contractAddress,
    ...data
  };
};

export const validateNumber = (amount: number | string): number => {
  if (typeof amount === 'string') return validateNumber(Number(amount));
  if (Number.isNaN(amount) || !Number.isFinite(amount)) return 0;
  return amount;
};

// decimals always >= 6
export const toAmount = (amount: number | string, decimals = 6): bigint => {
  const validatedAmount = validateNumber(amount);
  return (
    BigInt(Math.trunc(validatedAmount * atomic)) *
    BigInt(10 ** (decimals - truncDecimals))
  );
};

/**
 * Converts a fraction to its equivalent decimal value as a number.
 *
 * @param {bigint} numerator - The numerator of the fraction
 * @param {bigint} denominator - The denominator of the fraction
 * @return {number} - The decimal value equivalent to the input fraction, returned as a number.
 */
export const toDecimal = (numerator: bigint, denominator: bigint): number => {
  if (denominator === BigInt(0)) return 0;
  return toDisplay((numerator * BigInt(10 ** 6)) / denominator, 6);
};

/**
 * Convert the amount to be displayed on the user interface.
 *
 * @param {string|bigint} amount - The amount to be converted.
 * @param {number} sourceDecimals - The number of decimal places in the original `amount`.
 * @param {number} desDecimals - The number of decimal places in the `amount` after conversion.
 * @return {number} The value of `amount` after conversion.
 */
export const toDisplay = (
  amount: string | bigint,
  sourceDecimals = 6,
  desDecimals = 6
): number => {
  if (!amount) return 0;
  // guarding conditions to prevent crashing
  const validatedAmount =
    typeof amount === 'string' ? BigInt(amount || '0') : amount;
  const displayDecimals = Math.min(truncDecimals, desDecimals);
  const returnAmount =
    validatedAmount / BigInt(10 ** (sourceDecimals - displayDecimals));
  // save calculation by using cached atomic
  return (
    Number(returnAmount) /
    (displayDecimals === truncDecimals ? atomic : 10 ** displayDecimals)
  );
};

export const getTotalUsd = (
  amounts: AmountDetails,
  prices: CoinGeckoPrices<string>,
  token: TokenItemType
): number => {
  let usd = 0;
  if (!token) return 0;
  const amount = toDisplay(amounts[token.denom], token.decimals);
  usd = amount * (prices?.[token.coinGeckoId] ?? 0);
  return usd;
};

export const getSubAmountDetails = (
  amounts: AmountDetails,
  tokenInfo: TokenItemType
): AmountDetails => {
  if (!tokenInfo.evmDenoms) return {};
  return Object.fromEntries(
    tokenInfo.evmDenoms.map(denom => {
      return [denom, amounts[denom]];
    })
  );
};

export const toSumDisplay = (amounts: AmountDetails): number => {
  // get all native balances that are from oraibridge (ibc/...)
  let amount = 0;

  for (const denom in amounts) {
    // update later
    const balance = amounts[denom];
    if (!balance) continue;
    amount += toDisplay(balance, tokenMap[denom].decimals);
  }
  return amount;
};

export const toSubDisplay = (
  amounts: AmountDetails,
  tokenInfo: TokenItemType
): number => {
  const subAmounts = getSubAmountDetails(amounts, tokenInfo);
  return toSumDisplay(subAmounts);
};

export const toTotalDisplay = (
  amounts: AmountDetails,
  tokenInfo: TokenItemType
): number => {
  return (
    toDisplay(amounts[tokenInfo.denom], tokenInfo.decimals) +
    toSubDisplay(amounts, tokenInfo)
  );
};

export const toSubAmount = (
  amounts: AmountDetails,
  tokenInfo: TokenItemType
): bigint => {
  const displayAmount = toSubDisplay(amounts, tokenInfo);
  return toAmount(displayAmount, tokenInfo.decimals);
};
