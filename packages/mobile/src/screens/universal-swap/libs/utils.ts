import { TokenInfoResponse } from '@oraichain/oraidex-contracts-sdk/build/OraiswapToken.types';
import { TokenItemType } from '../config/bridgeTokens';
import { TokenInfo } from '../types';

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
