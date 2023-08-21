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
