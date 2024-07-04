import { ChainInfo } from "@owallet/types";
import { ChainIdHelper } from "@owallet/cosmos";

export function hasChain(
  chainId: string,
  chainInfo: Readonly<ChainInfo>
): boolean {
  return (
    !chainId ||
    !chainInfo ||
    (chainId && !ChainIdHelper.hasChainVersion(chainId))
  );
}
