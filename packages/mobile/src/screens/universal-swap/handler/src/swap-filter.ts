import { flattenTokens } from "@oraichain/oraidex-common";

const notAllowSwapCoingeckoIds = [
  "kawaii-islands",
  "milky-token",
  "injective-protocol",
];
// universal swap. Currently we dont support from tokens that are not using the ibc wasm channel
const notAllowSwapFromChainIds = [
  "kawaii_6886-1",
  "osmosis-1",
  "cosmoshub-4",
  "oraibridge-subnet-2",
  "injective-1",
  "noble-1",
];
export const swapFromTokens = flattenTokens.filter(
  (token) =>
    !notAllowSwapCoingeckoIds.includes(token.coinGeckoId) &&
    !notAllowSwapFromChainIds.includes(token.chainId)
);
// universal swap. We dont support kwt & milky & injective for simplicity. We also skip OraiBridge tokens because users dont care about them
const notAllowSwapToChainIds = [
  "oraibridge-subnet-2",
  "injective-1",
  "noble-1",
];
export const swapToTokens = flattenTokens.filter(
  (token) =>
    !notAllowSwapCoingeckoIds.includes(token.coinGeckoId) &&
    !notAllowSwapToChainIds.includes(token.chainId)
);
