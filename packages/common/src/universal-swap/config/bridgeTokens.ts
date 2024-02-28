import flatten from "lodash/flatten";
import uniqBy from "lodash/uniqBy";
import {
  CustomChainInfo,
  INJECTIVE_ORAICHAIN_DENOM,
  KWTBSC_ORAICHAIN_DENOM,
  MILKYBSC_ORAICHAIN_DENOM,
  TokenItemType,
  oraichainNetwork,
  chainInfos,
} from "@oraichain/oraidex-common";

const evmDenomsMap = {
  kwt: [KWTBSC_ORAICHAIN_DENOM],
  milky: [MILKYBSC_ORAICHAIN_DENOM],
  injective: [INJECTIVE_ORAICHAIN_DENOM],
};
const minAmountSwapMap = {
  trx: 10,
};

export const getTokensFromNetwork = (
  network: CustomChainInfo
): TokenItemType[] => {
  return network.currencies.map((currency) => ({
    name: currency.coinDenom,
    org: network.chainName,
    coinType: network.bip44.coinType,
    contractAddress: currency.contractAddress,
    prefix: currency?.prefixToken ?? network.bech32Config?.bech32PrefixAccAddr,
    coinGeckoId: currency.coinGeckoId,
    denom: currency.coinMinimalDenom,
    bridgeNetworkIdentifier: currency.bridgeNetworkIdentifier,
    decimals: currency.coinDecimals,
    bridgeTo: currency.bridgeTo,
    chainId: network.chainId,
    rpc: network.rpc,
    lcd: network.rest,
    cosmosBased: network.networkType === "cosmos",
    maxGas: (network.feeCurrencies?.[0].gasPriceStep?.high ?? 0) * 20000,
    gasPriceStep: currency.gasPriceStep,
    feeCurrencies: network.feeCurrencies,
    minAmountSwap: minAmountSwapMap[currency.coinMinimalDenom],
    evmDenoms: evmDenomsMap[currency.coinMinimalDenom],
    Icon: currency.Icon,
    IconLight: currency?.IconLight,
  }));
};

// other chains, oraichain
const otherChainTokens = flatten(
  chainInfos
    .filter((chainInfo) => chainInfo.chainId !== "Oraichain")
    .map(getTokensFromNetwork)
);
export const oraichainTokens: TokenItemType[] =
  getTokensFromNetwork(oraichainNetwork);

export const tokens = [otherChainTokens, oraichainTokens];
export const flattenTokens = flatten(tokens);
export const tokenMap = Object.fromEntries(
  flattenTokens.map((c) => [c.denom, c])
);
export const assetInfoMap = Object.fromEntries(
  flattenTokens.map((c) => [c.contractAddress || c.denom, c])
);
export const cosmosTokens = uniqBy(
  flattenTokens.filter(
    (token) =>
      // !token.contractAddress &&
      token.denom && token.cosmosBased && token.coinGeckoId
  ),
  (c) => c.denom
);

export const cw20Tokens = uniqBy(
  cosmosTokens.filter(
    // filter cosmos based tokens to collect tokens that have contract addresses
    (token) =>
      // !token.contractAddress &&
      token.contractAddress
  ),
  (c) => c.denom
);

export const cw20TokenMap = Object.fromEntries(
  cw20Tokens.map((c) => [c.contractAddress, c])
);

export const evmTokens = uniqBy(
  flattenTokens.filter(
    (token) =>
      // !token.contractAddress &&
      token.denom &&
      !token.cosmosBased &&
      token.coinGeckoId &&
      token.chainId !== "kawaii_6886-1"
  ),
  (c) => c.denom
);
