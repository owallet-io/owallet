import {
  INJECTIVE_ORAICHAIN_DENOM,
  KWTBSC_ORAICHAIN_DENOM,
  KWT_BSC_CONTRACT,
  MILKYBSC_ORAICHAIN_DENOM,
  MILKY_BSC_CONTRACT,
  flattenTokens,
} from "@oraichain/oraidex-common";

export const evmDenomsMap = {
  kwt: [KWTBSC_ORAICHAIN_DENOM],
  milky: [MILKYBSC_ORAICHAIN_DENOM],
  injective: [INJECTIVE_ORAICHAIN_DENOM],
};
const notAllowSwapCoingeckoIds = [];
// universal swap. Currently we dont support from tokens that are not using the ibc wasm channel
const notAllowSwapFromChainIds = [
  "0x1ae6",
  "kawaii_6886-1",
  "oraibridge-subnet-2",
  "oraibtc-mainnet-1",
  "Neutaro-1",
  "bitcoin",
];
const notAllowDenom = Object.values(evmDenomsMap).flat();
const notAllowBEP20Token = [KWT_BSC_CONTRACT, MILKY_BSC_CONTRACT];
export const swapFromTokens = flattenTokens.filter((token) => {
  return (
    !notAllowDenom.includes(token?.denom) &&
    !notAllowSwapCoingeckoIds.includes(token.coinGeckoId) &&
    !notAllowSwapFromChainIds.includes(token.chainId) &&
    !notAllowBEP20Token.includes(token?.contractAddress)
  );
});
// universal swap. We dont support kwt & milky & injective for simplicity. We also skip OraiBridge tokens because users dont care about them
const notAllowSwapToChainIds = [
  "0x1ae6",
  "kawaii_6886-1",
  "oraibridge-subnet-2",
  "oraibtc-mainnet-1",
  "Neutaro-1",
  "bitcoin",
];
export const swapToTokens = flattenTokens.filter((token) => {
  return (
    !notAllowDenom.includes(token?.denom) &&
    !notAllowSwapCoingeckoIds.includes(token.coinGeckoId) &&
    !notAllowSwapToChainIds.includes(token.chainId) &&
    !notAllowBEP20Token.includes(token?.contractAddress)
  );
});
