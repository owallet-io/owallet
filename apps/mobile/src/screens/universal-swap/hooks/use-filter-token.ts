import { BTC_CONTRACT, TokenItemType } from "@oraichain/oraidex-common";
import {
  SwapDirection,
  UniversalSwapHelper,
} from "@oraichain/oraidex-universal-swap";
import { useEffect, useState } from "react";

/**
 * Simulate token fee between fromToken & toToken
 * @param originalFromToken
 * @param originalToToken
 * @param searchTokenName
 * @param fromToken
 * @param toToken
 * @param fromTokenDenom
 * @param toTokenDenom
 * @returns
 */
export const useFilterToken = (
  originalFromToken: TokenItemType,
  originalToToken: TokenItemType,
  searchTokenName: string,
  fromToken: TokenItemType,
  toToken: TokenItemType,
  fromTokenDenom: string,
  toTokenDenom: string
) => {
  const [filteredToTokens, setFilteredToTokens] = useState(
    [] as TokenItemType[]
  );
  const [filteredFromTokens, setFilteredFromTokens] = useState(
    [] as TokenItemType[]
  );

  useEffect(() => {
    const filteredToTokens = UniversalSwapHelper.filterNonPoolEvmTokens(
      originalFromToken.chainId,
      originalFromToken.coinGeckoId,
      originalFromToken.denom,
      searchTokenName,
      SwapDirection.To
    );

    setFilteredToTokens(
      filteredToTokens.filter((fi) => fi?.contractAddress !== BTC_CONTRACT)
    );

    const filteredFromTokens = UniversalSwapHelper.filterNonPoolEvmTokens(
      originalToToken.chainId,
      originalToToken.coinGeckoId,
      originalToToken.denom,
      searchTokenName,
      SwapDirection.From
    );

    setFilteredFromTokens(
      filteredFromTokens.filter((fi) => fi?.contractAddress !== BTC_CONTRACT)
    );

    // TODO: need to automatically update from / to token to the correct swappable one when clicking the swap button
  }, [fromToken, toToken, toTokenDenom, fromTokenDenom]);

  return { filteredToTokens, filteredFromTokens };
};
