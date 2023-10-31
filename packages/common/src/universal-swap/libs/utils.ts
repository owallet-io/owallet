import { TokenInfoResponse } from '@oraichain/oraidex-contracts-sdk/build/OraiswapToken.types';
import { TokenItemType, tokenMap } from '@oraichain/oraidex-common';
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
export const generateError = (message: string) => {
  return { ex: { message } };
};

export const toTokenInfo = (token: TokenItemType, info?: TokenInfoResponse): TokenInfo => {
  const data = (info as any)?.token_info_response ?? info;
  return {
    ...token,
    symbol: token.name,
    verified: !token.contractAddress,
    ...data
  };
};

export const getTotalUsd = (amounts: AmountDetails, prices: CoinGeckoPrices<string>, token: TokenItemType): number => {
  let usd = 0;
  if (!token) return 0;
  const amount = toDisplay(amounts[token.denom], token.decimals);
  usd = amount * (prices?.[token.coinGeckoId] ?? 0);
  return usd;
};

export const getSubAmountDetails = (amounts: AmountDetails, tokenInfo: TokenItemType): AmountDetails => {
  if (!tokenInfo.evmDenoms) return {};
  return Object.fromEntries(
    tokenInfo.evmDenoms.map(denom => {
      return [denom, amounts[denom]];
    })
  );
};

export const buildMultipleMessages = (mainMsg?: any, ...preMessages: any[]) => {
  try {
    var messages: any[] = mainMsg ? [mainMsg] : [];
    messages.unshift(...preMessages.flat(1));
    messages = messages.map(msg => {
      return {
        contractAddress: msg.contract,
        handleMsg: msg.msg,
        handleOptions: { funds: msg.sent_funds }
      };
    });
    return messages;
  } catch (error) {
    console.log('error in buildMultipleMessages', error);
  }
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

export const toSubDisplay = (amounts: AmountDetails, tokenInfo: TokenItemType): number => {
  const subAmounts = getSubAmountDetails(amounts, tokenInfo);
  return toSumDisplay(subAmounts);
};

export const toTotalDisplay = (amounts: AmountDetails, tokenInfo: TokenItemType): number => {
  return toDisplay(amounts[tokenInfo.denom], tokenInfo.decimals) + toSubDisplay(amounts, tokenInfo);
};

export const toSubAmount = (amounts: AmountDetails, tokenInfo: TokenItemType): bigint => {
  const displayAmount = toSubDisplay(amounts, tokenInfo);
  return toAmount(displayAmount, tokenInfo.decimals);
};
