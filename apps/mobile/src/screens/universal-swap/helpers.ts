import { TypeTextAndCustomizeComponent } from './types';
import {
  Networks,
  BSC_SCAN,
  ETHEREUM_SCAN,
  TRON_SCAN,
  KWT_SCAN,
  network,
  NetworkChainId,
  PAIRS,
  USDC_CONTRACT,
  ORAIX_CONTRACT,
  TokenItemType,
  BigDecimal,
  TON_ORAICHAIN_DENOM,
  COSMOS_CHAIN_ID_COMMON
} from '@oraichain/oraidex-common';
import { showToast } from '@src/utils/helper';
import { API } from '@src/common/api';
import { AssetInfo } from '@oraichain/oraidex-contracts-sdk';

export const checkFnComponent = (titleRight: TypeTextAndCustomizeComponent, Element: React.ReactNode) => {
  if (!!titleRight) {
    if (typeof titleRight === 'string') {
      return Element;
    } else if (typeof titleRight === 'function') {
      return titleRight();
    }
    return titleRight;
  }
  return null;
};

export const handleSaveTokenInfos = async (address, tokenInfos) => {
  await API.saveTokenInfos(
    {
      address,
      tokesInfos: tokenInfos
    },
    {
      baseURL: 'https://staging.owallet.dev/'
    }
  );
};

export const floatToPercent = (value: number): number => {
  return Number(value) * 100;
};

export const handleErrorSwap = (message: string) => {
  let formatedMessage = message;
  if (message.includes('of undefined')) {
    formatedMessage = 'Transaction Rejected!';
  }
  showToast({
    message: formatedMessage,
    type: 'danger'
  });
};

/**
 * This function return protocols of smart route
 * Example: if has chainId is Cosmos at fromToken or toToken then return ['Oraidex', 'OraidexV3','Osmosis']
 * @param toToken
 * @param useIbcWasm
 * @returns string
 */
export const getProtocolsSmartRoute = (
  fromToken: TokenItemType,
  toToken: TokenItemType,
  { useAlphaIbcWasm, useIbcWasm }
) => {
  const protocols = ['Oraidex', 'OraidexV3'];
  if (useIbcWasm && !useAlphaIbcWasm) return protocols;

  const allowOsmosisProtocols = ['injective-1', 'Neutaro-1', 'noble-1', 'osmosis-1', 'cosmoshub-4', 'celestia'];
  const isAllowOsmosisProtocol =
    allowOsmosisProtocols.includes(fromToken.chainId) || allowOsmosisProtocols.includes(toToken.chainId);

  if (isAllowOsmosisProtocol) return [...protocols, 'Osmosis'];
  return protocols;
};
export const isAllowAlphaIbcWasm = (fromToken: TokenItemType, toToken: TokenItemType) => {
  if (
    !fromToken.cosmosBased &&
    (toToken.chainId === COSMOS_CHAIN_ID_COMMON.INJECTVE_CHAIN_ID ||
      toToken.chainId === COSMOS_CHAIN_ID_COMMON.CELESTIA_CHAIN_ID)
  )
    return true;

  // from chainId and to chainId is CELESTIA_CHAIN_ID
  if ([toToken.chainId, fromToken.chainId].includes(COSMOS_CHAIN_ID_COMMON.CELESTIA_CHAIN_ID)) return true;
  return false;
};

const toCoinGeckoIds = ['osmosis', 'cosmos', 'oraichain-token', 'usd-coin'];
const listAllowSmartRoute = {
  'osmosis-1-Oraichain': {
    fromCoinGeckoIds: ['osmosis'],
    toCoinGeckoIds
  },
  'injective-1-Oraichain': {
    fromCoinGeckoIds: ['injective-protocol'],
    toCoinGeckoIds
  },
  'noble-1-Oraichain': {
    fromCoinGeckoIds: ['usd-coin'],
    toCoinGeckoIds: [...toCoinGeckoIds, 'injective-protocol']
  },
  'cosmoshub-4-Oraichain': {
    fromCoinGeckoIds: ['cosmos'],
    toCoinGeckoIds: [...toCoinGeckoIds]
  }
};

/**
 * This function check status using ibc wasm
 * Example:  Oraichain -> Oraichain + Cosmos (false) | Oraichain -> Evm (true) | Evm -> Evm + Oraichain + Cosmos (true) | Cosmos -> Cosmos + Oraichain (false) | Cosmos -> Evm (true)
 * @param fromToken
 * @param toToken
 * @returns boolean
 */
export const isAllowIBCWasm = (fromToken: TokenItemType, toToken: TokenItemType) => {
  const fromTokenIsOraichain = fromToken.chainId === 'Oraichain';
  const fromTokenIsCosmos = fromToken.cosmosBased;

  const toTokenIsOraichain = toToken.chainId === 'Oraichain';
  const toTokenIsCosmos = toToken.cosmosBased;

  // from chainId and to chainId is CELESTIA_CHAIN_ID
  if ([toToken.chainId, fromToken.chainId].includes(COSMOS_CHAIN_ID_COMMON.CELESTIA_CHAIN_ID)) return false;

  // Oraichain -> Oraichain or Cosmos
  if (fromTokenIsOraichain) {
    if (toToken.chainId == 'Neutaro-1') return true;
    if (toTokenIsOraichain || toTokenIsCosmos) return false;
  }
  // Oraichain or Cosmos -> Evm
  if ((fromTokenIsOraichain || fromTokenIsCosmos) && !toTokenIsCosmos) return true;
  // Evm -> EVM
  if (!fromTokenIsCosmos && !toTokenIsCosmos && toToken.chainId === fromToken.chainId) return false;
  // Evm -> Oraichain or Cosmos
  if (!fromTokenIsCosmos) {
    // Evm -> INJ or TIA
    if (
      toToken.chainId === COSMOS_CHAIN_ID_COMMON.INJECTVE_CHAIN_ID ||
      toToken.chainId === COSMOS_CHAIN_ID_COMMON.CELESTIA_CHAIN_ID
    ) {
      return false;
    }

    return true;
  }

  // Cosmos -> Cosmos or Oraichain
  if (fromTokenIsCosmos && toTokenIsCosmos) {
    const key = [fromToken, toToken].map(e => e.chainId).join('-');
    const hasTokenUsingSmartRoute =
      listAllowSmartRoute[key]?.fromCoinGeckoIds.includes(fromToken.coinGeckoId) &&
      listAllowSmartRoute[key]?.toCoinGeckoIds.includes(toToken.coinGeckoId);
    if (hasTokenUsingSmartRoute) return false;
    return true;
  }

  return false;
};

export const getTransactionUrl = (chainId: NetworkChainId | string, transactionHash: string) => {
  switch (Number(chainId)) {
    case Networks.bsc:
      return `${BSC_SCAN}/tx/${transactionHash}`;
    case Networks.mainnet:
      return `${ETHEREUM_SCAN}/tx/${transactionHash}`;
    case Networks.tron:
      return `${TRON_SCAN}/#/transaction/${transactionHash.replace(/^0x/, '')}`;
    default:
      // raw string
      switch (chainId) {
        case 'kawaii_6886-1':
          return `${KWT_SCAN}/tx/${transactionHash}`;
        case 'Oraichain':
          return `${network.explorer}/txs/${transactionHash}`;
      }
      return null;
  }
};

export enum PairAddress {
  AIRI_ORAI = 'orai1wkhkazf88upf2dxqedggy3ldja342rzmfs2mep',
  ORAIX_ORAI = 'orai1m6q5k5nr2eh8q0rdrf57wr7phk7uvlpg7mwfv5',
  ATOM_ORAI = 'orai1jf74ry4m0jcy9emsaudkhe7vte9l8qy8enakvs',
  USDT_ORAI = 'orai1c5s03c3l336dgesne7dylnmhszw8554tsyy9yt',
  KWT_ORAI = 'orai1ynmd2cemryhcwtjq3adhcwayrm89l2cr4tws4v',
  OSMO_ORAI = 'orai1d37artrk4tkhz2qyjmaulc2jzjkx7206tmpfug',
  MILKY_USDT = 'orai1hr2l03ep6p9lwdkuqu5253fgpzc40xcpwymjfc',
  SCORAI_ORAI = 'orai15aunrryk5yqsrgy0tvzpj7pupu62s0t2n09t0dscjgzaa27e44esefzgf8',
  USDC_ORAI = 'orai19ttg0j7w5kr83js32tmwnwxxdq9rkmw4m3d7mn2j2hkpugwwa4tszwsnkg',
  WTRX_ORAI = 'orai103ya8qkcf3vg4nksqquy0v5pvnugjtlt0uxpfh0fkuqge2a6k4aqwurg22',
  SCATOM_ATOM = 'orai16ltg2c8u9styus3dgql64mpupvtclxt9xdzvz0slx3pnrycxpm3qw75c5x',
  INJ_ORAI = 'orai1le7w5dmd23ky8f6zgtgfnpdv269qs6ezgr839sm8kj24rwaqqnrs58wf4u',
  USDC_ORAIX = 'orai1n4edv5h86rawzrvhy8lmrmnnmmherxnhuwqnk3yuvt0wgclh75usyn3md6',
  ORAI_WETH = 'orai10jgd0l4l0p2h7ugpk2lz64wpefjxc0h7evnlxf76a3fspdplarnsl9ma4j',
  ORAI_BTC = 'orai1fv5kwdv4z0gvp75ht378x8cg2j7prlywa0g35qmctez9q8u4xryspn6lrd',
  NTMPI_USDC = 'orai1yemx80gvcw05trjehy94rl4jz5dqjf2qxhks6258uvxd5s0m7h2quavx0g',
  OCH_ORAI = 'orai1d3f3e3j400hxse5z8vxxnxdwmvljs7mh8xa3wp3spe8g4ngnc3cqx8scs3'
}

interface Pair {
  asset_infos: AssetInfo[];
  assets: string[];
  symbol: string;
  symbols: string[];
  info: string;
  tokenIn?: string;
  tokenOut?: string;
}

// TODO: smart route swap in Oraichain
const findKeyByValue = (obj: { [key: string]: string }, value: string): string =>
  Object.keys(obj).find(key => obj[key] === value);

const findTokenInfo = (token: string, flattenTokens: TokenItemType[]): TokenItemType =>
  flattenTokens.find(
    t => t.contractAddress?.toUpperCase() === token?.toUpperCase() || t.denom.toUpperCase() === token?.toUpperCase()
  );
const DefaultIcon = 'https://assets.coingecko.com/coins/images/12931/standard/orai.png?1696512718';

export const findBaseTokenIcon = (coinGeckoId, flattenTokensWithIcon, isLightMode) => {
  const baseToken = flattenTokensWithIcon.find(token => token.coinGeckoId === coinGeckoId);

  return baseToken ? (isLightMode ? baseToken.Icon : baseToken.Icon) : DefaultIcon;
};

export const getSpecialCoingecko = (fromCoingecko: string, toCoingecko: string) => {
  const isSpecialCoingecko = coinGeckoId =>
    ['kawaii-islands', 'milky-token', 'injective-protocol'].includes(coinGeckoId);
  const isSpecialFromCoingecko = isSpecialCoingecko(fromCoingecko);
  const isSpecialToCoingecko = isSpecialCoingecko(toCoingecko);
  return {
    isSpecialFromCoingecko,
    isSpecialToCoingecko
  };
};

export const PAIRS_CHART = PAIRS.map(pair => {
  const assets = pair.asset_infos.map(info => {
    if ('native_token' in info) return info.native_token.denom;
    return info.token.contract_addr;
  });

  // TODO: reverse symbol for pair oraix/usdc
  let symbol = `${pair.symbols[0]}/${pair.symbols[1]}`;
  if (assets[0] === USDC_CONTRACT && assets[1] === ORAIX_CONTRACT) {
    symbol = `${pair.symbols[1]}/${pair.symbols[0]}`;
  }
  return {
    ...pair,
    symbol,
    info: `${assets[0]}-${assets[1]}`,
    assets
  };
});

const findBaseToken = (coinGeckoId: string, flattenTokensWithIcon: TokenItemType[], isLightMode: boolean): string => {
  const baseToken = flattenTokensWithIcon.find(token => token.coinGeckoId === coinGeckoId);
  return baseToken ? (isLightMode ? baseToken.IconLight : baseToken.Icon) : DefaultIcon;
};

export const getPairInfo = (path, flattenTokens, flattenTokensWithIcon, isLightMode) => {
  const pairKey: string = findKeyByValue(PairAddress, path.poolId);
  if (!pairKey)
    return {
      infoPair: undefined,
      TokenInIcon: DefaultIcon,
      TokenOutIcon: DefaultIcon,
      pairKey: undefined
    };

  let [tokenInKey, tokenOutKey] = pairKey.split('_');

  // TODO: hardcode case token is TRX
  if (tokenInKey === 'TRX') tokenInKey = 'WTRX';
  if (tokenOutKey === 'TRX') tokenOutKey = 'WTRX';

  let infoPair: Pair = PAIRS_CHART.find(pair => {
    let convertedArraySymbols = pair.symbols.map(symbol => symbol.toUpperCase());
    return convertedArraySymbols.includes(tokenInKey) && convertedArraySymbols.includes(tokenOutKey);
  });

  if (!infoPair)
    return {
      infoPair: undefined,
      TokenInIcon: DefaultIcon,
      TokenOutIcon: DefaultIcon,
      pairKey
    };

  const tokenIn = infoPair?.assets.find(info => info.toUpperCase() !== path.tokenOut.toUpperCase());
  const tokenOut = path.tokenOut;

  infoPair = {
    ...infoPair,
    tokenIn: tokenIn,
    tokenOut: tokenOut
  };

  const TokenInIcon = findBaseToken(
    findTokenInfo(tokenIn, flattenTokens)?.coinGeckoId,
    flattenTokensWithIcon,
    isLightMode
  );
  const TokenOutIcon = findBaseToken(
    findTokenInfo(tokenOut, flattenTokens)?.coinGeckoId,
    flattenTokensWithIcon,
    isLightMode
  );

  return { infoPair, TokenInIcon, TokenOutIcon, pairKey };
};

export const getPathInfo = (path, chainIcons, assets) => {
  let [NetworkFromIcon, NetworkToIcon] = [DefaultIcon, DefaultIcon];

  const pathChainId = path.chainId.split('-')[0].toLowerCase();
  const pathTokenOut = path.tokenOutChainId.split('-')[0].toLowerCase();

  if (path.chainId) {
    const chainFrom = chainIcons.find(cosmos => cosmos.chainId === path.chainId);
    NetworkFromIcon = chainFrom ? chainFrom.Icon : DefaultIcon;
  }

  if (path.tokenOutChainId) {
    const chainTo = chainIcons.find(cosmos => cosmos.chainId === path.tokenOutChainId);
    NetworkToIcon = chainTo ? chainTo.Icon : DefaultIcon;
  }

  const getAssetsByChainName = chainName => assets.find(({ chain_name }) => chain_name === chainName)?.assets || [];

  const assetList = {
    assets: [...getAssetsByChainName(pathChainId), ...getAssetsByChainName(pathTokenOut)]
  };

  return { NetworkFromIcon, NetworkToIcon, assetList, pathChainId };
};

export const getRemoteDenom = originalToken => {
  return originalToken.contractAddress ? originalToken.prefix + originalToken.contractAddress : originalToken.denom;
};

export declare const MULTIPLIER = 1.6;
export declare const GAS_ESTIMATION_BRIDGE_DEFAULT = 200000;

//hardcode fee
export const feeEstimate = (tokenInfo: TokenItemType, gasDefault: number) => {
  if (!tokenInfo) return 0;
  const MULTIPLIER_ESTIMATE_OSMOSIS = 3.8;
  const MULTIPLIER_FIX = tokenInfo.chainId === 'osmosis-1' ? MULTIPLIER_ESTIMATE_OSMOSIS : MULTIPLIER;
  return new BigDecimal(MULTIPLIER_FIX)
    .mul(tokenInfo.feeCurrencies[0].gasPriceStep.high)
    .mul(gasDefault)
    .div(10 ** tokenInfo.decimals)
    .toNumber();
};

export const calcMaxAmount = ({
  maxAmount,
  token,
  coeff,
  gas = GAS_ESTIMATION_BRIDGE_DEFAULT
}: {
  maxAmount: number;
  token: TokenItemType;
  coeff: number;
  gas?: number;
}) => {
  if (!token) return maxAmount;

  let finalAmount = maxAmount;

  const feeCurrencyOfToken = token.feeCurrencies?.find(e => e.coinMinimalDenom === token.denom);

  if (feeCurrencyOfToken) {
    const useFeeEstimate = feeEstimate(token, gas);

    if (coeff === 1) {
      finalAmount = useFeeEstimate > finalAmount ? 0 : new BigDecimal(finalAmount).sub(useFeeEstimate).toNumber();
    } else {
      finalAmount =
        useFeeEstimate > new BigDecimal(maxAmount).sub(new BigDecimal(finalAmount).mul(coeff)).toNumber()
          ? 0
          : finalAmount;
    }
  }

  return finalAmount;
};
