import Long from 'long';
import bech32 from 'bech32';
import { TokenItemType, network } from '@oraichain/oraidex-common';
import { Address } from '@owallet/crypto';
import {
  cosmosTokens,
  flattenTokens,
  oraichainTokens,
  CoinGeckoId,
  NetworkChainId,
  atomic,
  IBC_WASM_CONTRACT
} from '@oraichain/oraidex-common';
import { HIGH_GAS_PRICE, MULTIPLIER, swapEvmRoutes } from '../config/constants';
import { CosmWasmClient, OraiswapOracleQueryClient } from '@oraichain/oraidex-contracts-sdk';
import { CwIcs20LatestQueryClient } from '@oraichain/common-contracts-sdk';
import { swapFromTokens, swapToTokens } from '../config';
import { Ratio } from '@oraichain/common-contracts-sdk/build/CwIcs20Latest.types';
import { getBase58Address } from 'src/utils';
import { TaxRateResponse } from '@oraichain/oraidex-contracts-sdk/build/OraiswapOracle.types';

export enum SwapDirection {
  From,
  To
}

export const calculateTimeoutTimestamp = (timeout: number): string => {
  return Long.fromNumber(Math.floor(Date.now() / 1000) + timeout)
    .multiply(1000000000)
    .toString();
};

export function isEvmNetworkNativeSwapSupported(chainId: NetworkChainId) {
  switch (chainId) {
    case '0x01':
    case '0x38':
      return true;
    default:
      return false;
  }
}

export const feeEstimate = (tokenInfo: TokenItemType, gasDefault: number) => {
  if (!tokenInfo) return 0;
  return (gasDefault * MULTIPLIER * HIGH_GAS_PRICE) / 10 ** tokenInfo?.decimals;
};

export function getTokenOnSpecificChainId(
  coingeckoId: CoinGeckoId,
  chainId: NetworkChainId
): TokenItemType | undefined {
  return flattenTokens.find(t => t.coinGeckoId === coingeckoId && t.chainId === chainId);
}

export const tronToEthAddress = (base58: string) => getEvmAddress(base58);

export const ethToTronAddress = (address: string) => {
  return getBase58Address(address);
};

const getEvmAddress = (bech32Address: string) => {
  if (!bech32Address) return;
  const decoded = bech32.decode(bech32Address);
  const evmAddress = '0x' + Buffer.from(bech32.fromWords(decoded.words)).toString('hex');
  return evmAddress;
};

export const getTokenOnOraichain = (coingeckoId: CoinGeckoId) => {
  if (coingeckoId === 'kawaii-islands' || coingeckoId === 'milky-token') {
    throw new Error('KWT and MILKY not supported in this function');
  }
  return oraichainTokens.find(token => token.coinGeckoId === coingeckoId);
};

export async function fetchTaxRate(client: CosmWasmClient): Promise<TaxRateResponse> {
  const oracleContract = new OraiswapOracleQueryClient(client, network.oracle);
  try {
    const data = await oracleContract.treasury({ tax_rate: {} });
    return data as TaxRateResponse;
  } catch (error) {
    throw new Error(`Error when query TaxRate using oracle: ${error}`);
  }
}
/**
 * Get transfer token fee when universal swap
 * @param param0
 * @returns
 */
export const getTransferTokenFee = async ({ remoteTokenDenom, client }): Promise<Ratio | undefined> => {
  try {
    const ibcWasmContractAddress = IBC_WASM_CONTRACT;
    const ibcWasmContract = new CwIcs20LatestQueryClient(client, ibcWasmContractAddress);
    const ratio = await ibcWasmContract.getTransferTokenFee({ remoteTokenDenom });
    return ratio;
  } catch (error) {
    console.log({ error });
  }
};

export async function fetchRelayerFee(client: CosmWasmClient): Promise<any> {
  const ics20Contract = new CwIcs20LatestQueryClient(client, IBC_WASM_CONTRACT);
  try {
    const { relayer_fees } = await ics20Contract.config();
    return relayer_fees;
  } catch (error) {
    throw new Error(`Error when query Relayer Fee using oracle: ${error}`);
  }
}

export function isSupportedNoPoolSwapEvm(coingeckoId: CoinGeckoId) {
  switch (coingeckoId) {
    case 'wbnb':
    case 'weth':
      return true;
    default:
      return false;
  }
}

export function filterTokens(
  chainId: string,
  coingeckoId: CoinGeckoId,
  denom: string,
  searchTokenName: string,
  direction: SwapDirection
) {
  // basic filter. Dont include itself & only collect tokens with searched letters
  let filteredToTokens = swapToTokens.filter(token => token.denom !== denom && token.name.includes(searchTokenName));
  // special case for tokens not having a pool on Oraichain
  if (isSupportedNoPoolSwapEvm(coingeckoId)) {
    const swappableTokens = Object.keys(swapEvmRoutes[chainId]).map(key => key.split('-')[1]);
    const filteredTokens = filteredToTokens.filter(token => swappableTokens.includes(token.contractAddress));

    // tokens that dont have a pool on Oraichain like WETH or WBNB cannot be swapped from a token on Oraichain
    if (direction === SwapDirection.To)
      return [...new Set(filteredTokens.concat(filteredTokens.map(token => getTokenOnOraichain(token.coinGeckoId))))];
    filteredToTokens = filteredTokens;
  }
  return filteredToTokens;
}

export const calculateMinimum = (simulateAmount: number | string, userSlippage: number): bigint | string => {
  if (!simulateAmount) return '0';
  try {
    return (
      BigInt(simulateAmount) - (BigInt(simulateAmount) * BigInt(userSlippage * atomic)) / (BigInt(100) * BigInt(atomic))
    );
  } catch (error) {
    console.log({ error });
    return '0';
  }
};

export const findToTokenOnOraiBridge = (fromToken: TokenItemType, toNetwork: NetworkChainId) => {
  const toToken = cosmosTokens.find(t =>
    t.chainId === 'oraibridge-subnet-2' && t.coinGeckoId === fromToken.coinGeckoId && t?.bridgeNetworkIdentifier
      ? t.bridgeNetworkIdentifier === toNetwork
      : t.chainId === toNetwork
  );
  return toToken;
};
export function filterNonPoolEvmTokens(
  chainId: string,
  coingeckoId: CoinGeckoId,
  denom: string,
  searchTokenName: string,
  direction: SwapDirection // direction = to means we are filtering to tokens
) {
  // basic filter. Dont include itself & only collect tokens with searched letters
  const listTokens = direction === SwapDirection.From ? swapFromTokens : swapToTokens;
  let filteredToTokens = listTokens.filter(
    token => token.denom !== denom && token.name.toLowerCase().includes(searchTokenName.toLowerCase())
  );
  // special case for tokens not having a pool on Oraichain
  if (isSupportedNoPoolSwapEvm(coingeckoId)) {
    const swappableTokens = Object.keys(swapEvmRoutes[chainId]).map(key => key.split('-')[1]);
    const filteredTokens = filteredToTokens.filter(token => swappableTokens.includes(token.contractAddress));

    // tokens that dont have a pool on Oraichain like WETH or WBNB cannot be swapped from a token on Oraichain
    if (direction === SwapDirection.To)
      return [...new Set(filteredTokens.concat(filteredTokens.map(token => getTokenOnOraichain(token.coinGeckoId))))];
    filteredToTokens = filteredTokens;
  }
  // special case filter. Tokens on networks other than supported evm cannot swap to tokens, so we need to remove them
  if (!isEvmNetworkNativeSwapSupported(chainId as NetworkChainId))
    return filteredToTokens.filter(t => {
      // one-directional swap. non-pool tokens of evm network can swap be swapped with tokens on Oraichain, but not vice versa
      const isSupported = isSupportedNoPoolSwapEvm(t.coinGeckoId);
      if (direction === SwapDirection.To) return !isSupported;
      if (isSupported) {
        // if we cannot find any matched token then we dont include it in the list since it cannot be swapped
        const sameChainId = getTokenOnSpecificChainId(coingeckoId, t.chainId as NetworkChainId);
        if (!sameChainId) return false;
        return true;
      }
      return true;
    });
  return filteredToTokens.filter(t => {
    // filter out to tokens that are on a different network & with no pool because we are not ready to support them yet. TODO: support
    if (isSupportedNoPoolSwapEvm(t.coinGeckoId)) return t.chainId === chainId;
    return true;
  });
}
