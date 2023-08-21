import { MulticallQueryClient } from '@oraichain/common-contracts-sdk';
import { network } from '../config/networks';
import { fromBinary, toBinary } from '@cosmjs/cosmwasm-stargate';
import { TokenItemType } from '../config/bridgeTokens';
import {
  OraiswapTokenQueryClient,
  OraiswapTokenTypes
} from '@oraichain/oraidex-contracts-sdk';
import { TokenInfo } from '../types/token';
import { toTokenInfo } from '../libs/utils';
import { swapEvmRoutes } from '../config/constants';

async function fetchTokenInfo(
  token: TokenItemType,
  client
): Promise<TokenInfo> {
  let data: OraiswapTokenTypes.TokenInfoResponse;
  if (token.contractAddress) {
    const tokenContract = new OraiswapTokenQueryClient(
      client,
      token.contractAddress
    );
    data = await tokenContract.tokenInfo();
  }
  return toTokenInfo(token, data);
}

/// using multicall when query multiple
async function fetchTokenInfos(
  tokens: TokenItemType[],
  client
): Promise<TokenInfo[]> {
  const filterTokenSwaps = tokens.filter(t => t.contractAddress);
  const queries = filterTokenSwaps.map(t => ({
    address: t.contractAddress,
    data: toBinary({
      token_info: {}
    } as OraiswapTokenTypes.QueryMsg)
  }));
  const multicall = new MulticallQueryClient(client, network.multicall);
  let tokenInfos = tokens.map(t => toTokenInfo(t));
  try {
    const res = await multicall.tryAggregate({
      queries
    });
    let ind = 0;
    tokenInfos = tokens.map(t =>
      toTokenInfo(
        t,
        t.contractAddress && res.return_data[ind].success
          ? fromBinary(res.return_data[ind++].data)
          : t
      )
    );
  } catch (error) {
    console.log('error fetching token infos: ', error);
  }
  return tokenInfos;
}
export function buildSwapRouterKey(
  fromContractAddr: string,
  toContractAddr: string
) {
  return `${fromContractAddr}-${toContractAddr}`;
}

export function getEvmSwapRoute(
  chainId: string,
  fromContractAddr: string,
  toContractAddr: string
): string[] | undefined {
  const chainRoutes = swapEvmRoutes[chainId];
  let route: string[] | undefined =
    chainRoutes[buildSwapRouterKey(fromContractAddr, toContractAddr)];
  if (route) return route;
  // because the route can go both ways. Eg: WBNB->AIRI, if we want to swap AIRI->WBNB, then first we find route WBNB->AIRI, then we reverse the route
  route = chainRoutes[buildSwapRouterKey(toContractAddr, fromContractAddr)];
  if (route) {
    return [].concat(route).reverse();
  }
  return undefined;
}

export function isEvmSwappable(data: {
  fromChainId: string;
  toChainId: string;
  fromContractAddr?: string;
  toContractAddr?: string;
}): boolean {
  const { fromChainId, fromContractAddr, toChainId, toContractAddr } = data;
  // cant swap if they are not on the same evm chain
  if (fromChainId !== toChainId) return false;
  // cant swap on evm if chain id is not eth or bsc
  if (fromChainId !== '0x01' && fromChainId !== '0x38') return false;
  // if the tokens do not have contract addresses then we skip
  if (!fromContractAddr || !toContractAddr) return false;
  // only swappable if there's a route to swap from -> to
  if (!getEvmSwapRoute(fromChainId, fromContractAddr, toContractAddr))
    return false;
  return true;
}

export { fetchTokenInfo, fetchTokenInfos };
