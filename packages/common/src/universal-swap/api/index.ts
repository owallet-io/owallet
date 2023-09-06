import { MulticallQueryClient } from '@oraichain/common-contracts-sdk';
import { network } from '../config/networks';
import { fromBinary, toBinary } from '@cosmjs/cosmwasm-stargate';
import { TokenItemType } from '../config/bridgeTokens';
import {
  AssetInfo,
  OraiswapTokenQueryClient,
  OraiswapTokenTypes,
  SwapOperation
} from '@oraichain/oraidex-contracts-sdk';
import { TokenInfo } from '../types/token';
import { toTokenInfo } from '../libs/utils';
import { ORAI_INFO, swapEvmRoutes } from '../config/constants';
import { Pairs } from '../config/pools';
import isEqual from 'lodash/isEqual';
import { coin, Coin } from '@cosmjs/stargate';

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

function parseTokenInfo(tokenInfo: TokenItemType, amount?: string | number) {
  if (!tokenInfo?.contractAddress) {
    if (amount)
      return {
        fund: { denom: tokenInfo.denom, amount: amount.toString() },
        info: { native_token: { denom: tokenInfo.denom } }
      };
    return { info: { native_token: { denom: tokenInfo.denom } } };
  }
  return { info: { token: { contract_addr: tokenInfo?.contractAddress } } };
}

const generateSwapOperationMsgs = (
  offerInfo: AssetInfo,
  askInfo: AssetInfo
): SwapOperation[] => {
  const pairExist = Pairs.pairs.some(pair => {
    let assetInfos = pair.asset_infos;
    return (
      (isEqual(assetInfos[0], offerInfo) && isEqual(assetInfos[1], askInfo)) ||
      (isEqual(assetInfos[1], offerInfo) && isEqual(assetInfos[0], askInfo))
    );
  });

  return pairExist
    ? [
        {
          orai_swap: {
            offer_asset_info: offerInfo,
            ask_asset_info: askInfo
          }
        }
      ]
    : [
        {
          orai_swap: {
            offer_asset_info: offerInfo,
            ask_asset_info: ORAI_INFO
          }
        },
        {
          orai_swap: {
            offer_asset_info: ORAI_INFO,
            ask_asset_info: askInfo
          }
        }
      ];
};

const handleSentFunds = (...funds: (Coin | undefined)[]): Coin[] | null => {
  let sent_funds = [];
  for (let fund of funds) {
    if (fund) sent_funds.push(fund);
  }
  if (sent_funds.length === 0) return null;
  sent_funds.sort((a, b) => a.denom.localeCompare(b.denom));
  return sent_funds;
};

function generateContractMessages(
  query:
    | SwapQuery
    | ProvideQuery
    | WithdrawQuery
    | IncreaseAllowanceQuery
    | TransferQuery
) {
  const { type, sender, ...params } = query;
  let sent_funds;
  // for withdraw & provide liquidity methods, we need to interact with the oraiswap pair contract
  let contractAddr = network.router;
  let input;
  switch (type) {
    case Type.SWAP:
      const swapQuery = params as SwapQuery;
      const { fund: offerSentFund, info: offerInfo } = parseTokenInfo(
        swapQuery.fromInfo,
        swapQuery.amount.toString()
      );
      const { fund: askSentFund, info: askInfo } = parseTokenInfo(
        swapQuery.toInfo
      );
      sent_funds = handleSentFunds(offerSentFund, askSentFund);
      let inputTemp = {
        execute_swap_operations: {
          operations: generateSwapOperationMsgs(offerInfo, askInfo),
          minimum_receive: swapQuery.minimumReceive
        }
      };
      // if cw20 => has to send through cw20 contract
      if (!swapQuery.fromInfo.contractAddress) {
        input = inputTemp;
      } else {
        input = {
          send: {
            contract: contractAddr,
            amount: swapQuery.amount.toString(),
            msg: toBinary(inputTemp)
          }
        };
        contractAddr = swapQuery.fromInfo.contractAddress;
      }
      break;
    case Type.PROVIDE:
      const provideQuery = params as ProvideQuery;
      const { fund: fromSentFund, info: fromInfoData } = parseTokenInfo(
        provideQuery.fromInfo,
        provideQuery.fromAmount
      );
      const { fund: toSentFund, info: toInfoData } = parseTokenInfo(
        provideQuery.toInfo,
        provideQuery.toAmount
      );
      sent_funds = handleSentFunds(fromSentFund, toSentFund);
      input = {
        provide_liquidity: {
          assets: [
            {
              info: toInfoData,
              amount: provideQuery.toAmount.toString()
            },
            { info: fromInfoData, amount: provideQuery.fromAmount.toString() }
          ],
          slippage_tolerance: provideQuery.slippage
        }
      };
      contractAddr = provideQuery.pair;
      break;
    case Type.WITHDRAW:
      const withdrawQuery = params as WithdrawQuery;

      input = {
        send: {
          // owner: sender,
          contract: withdrawQuery.pair,
          amount: withdrawQuery.amount.toString(),
          msg: 'eyJ3aXRoZHJhd19saXF1aWRpdHkiOnt9fQ==' // withdraw liquidity msg in base64 : {"withdraw_liquidity":{}}
        }
      };
      contractAddr = withdrawQuery.lpAddr;
      break;
    case Type.INCREASE_ALLOWANCE:
      const increaseAllowanceQuery = params as IncreaseAllowanceQuery;
      input = {
        increase_allowance: {
          amount: increaseAllowanceQuery.amount.toString(),
          spender: increaseAllowanceQuery.spender
        }
      };
      contractAddr = increaseAllowanceQuery.token;
      break;
    case Type.TRANSFER:
      const transferQuery = params as TransferQuery;
      input = {
        transfer: {
          recipient: transferQuery.recipientAddress,
          amount: transferQuery.amount
        }
      };
      contractAddr = transferQuery.token;
      break;
    default:
      break;
  }

  const msgs = [
    {
      contract: contractAddr,
      msg: Buffer.from(JSON.stringify(input)),
      sender,
      sent_funds
    }
  ];

  return msgs;
}

export enum Type {
  'TRANSFER' = 'Transfer',
  'SWAP' = 'Swap',
  'PROVIDE' = 'Provide',
  'WITHDRAW' = 'Withdraw',
  'INCREASE_ALLOWANCE' = 'Increase allowance',
  'BOND_LIQUIDITY' = 'Bond liquidity',
  'WITHDRAW_LIQUIDITY_MINING' = 'Withdraw Liquidity Mining Rewards',
  'UNBOND_LIQUIDITY' = 'Unbond Liquidity Tokens',
  'CONVERT_TOKEN' = 'Convert IBC or CW20 Tokens',
  'CLAIM_ORAIX' = 'Claim ORAIX tokens',
  'CONVERT_TOKEN_REVERSE' = 'Convert reverse IBC or CW20 Tokens'
}
export type Uint128 = string;

export type SwapQuery = {
  type: Type.SWAP;
  fromInfo: TokenInfo;
  toInfo: TokenInfo;
  amount: number | string;
  max_spread?: number | string;
  belief_price?: number | string;
  sender: string;
  minimumReceive: Uint128;
};

export type ProvideQuery = {
  type: Type.PROVIDE;
  fromInfo: TokenInfo;
  toInfo: TokenInfo;
  fromAmount: number | string;
  toAmount: number | string;
  slippage?: number | string;
  sender: string;
  pair: string; // oraiswap pair contract addr, handle provide liquidity
};

export type WithdrawQuery = {
  type: Type.WITHDRAW;
  lpAddr: string;
  amount: number | string;
  sender: string;
  pair: string; // oraiswap pair contract addr, handle withdraw liquidity
};

export type TransferQuery = {
  type: Type.TRANSFER;
  amount: number | string;
  sender: string;
  token: string;
  recipientAddress: string;
};

export type IncreaseAllowanceQuery = {
  type: Type.INCREASE_ALLOWANCE;
  amount: number | string;
  sender: string;
  spender: string;
  token: string; //token contract addr
};

export {
  fetchTokenInfo,
  fetchTokenInfos,
  parseTokenInfo,
  generateSwapOperationMsgs
};
