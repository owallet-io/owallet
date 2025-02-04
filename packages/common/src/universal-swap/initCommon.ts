import { OraidexCommon, TokenItemType } from "@oraichain/oraidex-common";

const arraysAreDifferent = (
  arr1: TokenItemType[],
  arr2: TokenItemType[]
): boolean => {
  const sortedArr1 = JSON.stringify([...arr1].sort());
  const sortedArr2 = JSON.stringify([...arr2].sort());
  return sortedArr1 !== sortedArr2;
};

let oraidexCommonOg = await OraidexCommon.load();
while (!oraidexCommonOg) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  oraidexCommonOg = await OraidexCommon.load();
}
export const oraidexCommon = oraidexCommonOg;

export const initializeOraidexCommon = async (
  allOraichainTokens: TokenItemType[],
  addedTokens: TokenItemType[]
) => {
  const oraichainTokens = oraidexCommonOg.oraichainTokens;
  const otherChainTokens = oraidexCommonOg.otherChainTokens;

  const allVerifiedOraichainTokens = allOraichainTokens.filter(
    (token) => token.isVerified
  );
  if (arraysAreDifferent(oraichainTokens, allVerifiedOraichainTokens)) {
    // dispatch(updateAllOraichainTokens([...oraichainTokens, ...addedTokens]));
  }

  if (otherChainTokens.length > 0) {
    // dispatch(updateAllOtherChainTokens(otherChainTokens));
  }
};

export const {
  tokens,
  oraichainNetwork,
  evmChains,
  flattenTokens,
  oraichainTokens,
  tokenMap,
  cosmosTokens,
  evmTokens,
  kawaiiTokens,
  otherChainTokens,
  cw20TokenMap,
  cw20Tokens,
  assetInfoMap,
  network,
  celestiaNetwork,
  chainConfig,
  chainInfosCommon,
  flattenTokensWithIcon,
  oraichainTokensWithIcon,
  otherTokensWithIcon,
  tokenConfig,
  tokensWithIcon,
  btcTokens,
  btcChains,
  solTokens,
  tonNetworkMainnet,
  tonTokens,
} = oraidexCommon;

// FIXME: need remove when update chainInfo in oraichain-common sdk
const IGNORE_CHAIN_IDS = new Set(["kawaii_6886-1", "0x1ae6"]);
const getFilteredChainInfos = (chainInfo) =>
  chainInfo.filter((chain) => !IGNORE_CHAIN_IDS.has(chain.chainId));

export const chainInfos = getFilteredChainInfos(oraidexCommon.chainInfos);
export const chainInfosWithIcon = getFilteredChainInfos(
  oraidexCommon.chainInfosWithIcon
);
export const cosmosChains = getFilteredChainInfos(oraidexCommon.cosmosChains);
