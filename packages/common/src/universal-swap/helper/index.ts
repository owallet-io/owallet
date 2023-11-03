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
  parseTokenInfo
} from '@oraichain/oraidex-common';
import { TokenInfo } from '../types/token';
import { generateSwapOperationMsgs, getEvmSwapRoute } from '../api';
import { ethers } from 'ethers';
import { IUniswapV2Router02__factory } from '../config/abi/v2-periphery/contracts/interfaces';
import { HIGH_GAS_PRICE, MULTIPLIER, proxyContractInfo, swapEvmRoutes } from '../config/constants';
import { CosmWasmClient, OraiswapOracleQueryClient, OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';
import { CwIcs20LatestQueryClient, Ratio } from '@oraichain/common-contracts-sdk';
import { swapToTokens } from '../config';

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

export const getTransferTokenFee = async ({ remoteTokenDenom, client }): Promise<Ratio | undefined> => {
  try {
    const ibcWasmContractAddress = process.env.REACT_APP_IBC_WASM_CONTRACT;
    const ibcWasmContract = new CwIcs20LatestQueryClient(client, ibcWasmContractAddress);
    const ratio = await ibcWasmContract.getTransferTokenFee({
      remoteTokenDenom
    });
    return ratio;
  } catch (error) {
    console.log({ error });
  }
};

export function getTokenOnSpecificChainId(
  coingeckoId: CoinGeckoId,
  chainId: NetworkChainId
): TokenItemType | undefined {
  return flattenTokens.find(t => t.coinGeckoId === coingeckoId && t.chainId === chainId);
}

export const tronToEthAddress = (base58: string) => Address.getEvmAddress(base58);

export const ethToTronAddress = (address: string) => {
  return Address.getBase58Address(address);
};

export const getEvmAddress = (bech32Address: string) => {
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

export async function fetchTaxRate(client: CosmWasmClient) {
  const oracleContract = new OraiswapOracleQueryClient(client, network.oracle);
  try {
    const data = await oracleContract.taxRate();
    return data;
  } catch (error) {
    throw new Error(`Error when query TaxRate using oracle: ${error}`);
  }
}

export async function simulateSwap(
  query: {
    fromInfo: TokenInfo;
    toInfo: TokenInfo;
    amount: string;
  },
  client: CosmWasmClient
) {
  const { amount, fromInfo, toInfo } = query;

  // check for universal-swap 2 tokens that have same coingeckoId, should return simulate data with average ratio 1-1.
  if (fromInfo.coinGeckoId === toInfo.coinGeckoId) {
    return {
      amount
    };
  }

  // check if they have pairs. If not then we go through ORAI
  const { info: offerInfo } = parseTokenInfo(fromInfo, amount.toString());
  const { info: askInfo } = parseTokenInfo(toInfo);
  const routerContract = new OraiswapRouterQueryClient(client, network.router);
  const operations = generateSwapOperationMsgs(offerInfo, askInfo);
  try {
    const data = await routerContract.simulateSwapOperations({
      offerAmount: amount.toString(),
      operations
    });

    return data;
  } catch (error) {
    console.log(`Error when trying to simulate swap using router v2: ${error}`);
    throw new Error(`Error when trying to simulate swap using router v2: ${error}`);
  }
}

export async function simulateSwapEvm(query: { fromInfo: TokenItemType; toInfo: TokenItemType; amount: string }) {
  const { amount, fromInfo, toInfo } = query;

  // check for universal-swap 2 tokens that have same coingeckoId, should return simulate data with average ratio 1-1.
  if (fromInfo.coinGeckoId === toInfo.coinGeckoId) {
    return {
      amount
    };
  }
  try {
    // get proxy contract object so that we can query the corresponding router address
    const provider = new ethers.providers.JsonRpcProvider(fromInfo.rpc);
    const toTokenInfoOnSameChainId = getTokenOnSpecificChainId(toInfo.coinGeckoId, fromInfo.chainId);
    const swapRouterV2 = IUniswapV2Router02__factory.connect(proxyContractInfo[fromInfo.chainId].routerAddr, provider);
    const route = getEvmSwapRoute(fromInfo.chainId, fromInfo.contractAddress, toTokenInfoOnSameChainId.contractAddress);
    const outs = await swapRouterV2.getAmountsOut(amount, route);
    return {
      amount: outs.slice(-1)[0].toString() // get the final out amount, which is the token out amount we want
    };
  } catch (ex) {
    console.log('error simulating evm: ', ex);
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
