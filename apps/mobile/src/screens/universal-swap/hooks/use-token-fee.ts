import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { TokenItemType } from "@oraichain/oraidex-common";
import {
  getTransferTokenFee,
  isEvmNetworkNativeSwapSupported,
} from "@owallet/common";
import { useEffect, useState } from "react";

/**
 * Simulate token fee between fromToken & toToken
 * @param originalFromToken
 * @param originalToToken
 * @param fromToken
 * @param toToken
 * @param client
 * @returns
 */
export const useTokenFee = (
  originalFromToken: TokenItemType,
  originalToToken: TokenItemType,
  fromToken: TokenItemType,
  toToken: TokenItemType,
  client: SigningCosmWasmClient
) => {
  const [fromTokenFee, setFromTokenFee] = useState<number>(0);
  const [toTokenFee, setToTokenFee] = useState<number>(0);

  const getTokenFee = async (
    remoteTokenDenom: string,
    fromChainId: string,
    toChainId: string,
    type: "from" | "to"
  ) => {
    // since we have supported evm swap, tokens that are on the same supported evm chain id don't have any token fees (because they are not bridged to Oraichain)
    if (
      isEvmNetworkNativeSwapSupported(fromChainId) &&
      fromChainId === toChainId
    )
      return;
    if (remoteTokenDenom) {
      let tokenFee = 0;
      const ratio = await getTransferTokenFee({ remoteTokenDenom, client });

      if (ratio) {
        tokenFee = (ratio.nominator / ratio.denominator) * 100;
      }

      if (type === "from") {
        setFromTokenFee(tokenFee);
      } else {
        setToTokenFee(tokenFee);
      }
    }
  };

  useEffect(() => {
    getTokenFee(
      originalToToken.prefix + originalToToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      "to"
    );
  }, [originalToToken, fromToken, toToken, originalToToken, client]);

  useEffect(() => {
    getTokenFee(
      originalFromToken.prefix + originalFromToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      "from"
    );
  }, [originalToToken, fromToken, toToken, originalToToken, client]);

  return { fromTokenFee, toTokenFee };
};
