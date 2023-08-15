import {
  CosmWasmClient,
  fromBinary,
  toBinary
} from '@cosmjs/cosmwasm-stargate';
import { StargateClient } from '@cosmjs/stargate';
import { MulticallQueryClient } from '@oraichain/common-contracts-sdk';
import { OraiswapTokenTypes } from '@oraichain/oraidex-contracts-sdk';
import bech32 from 'bech32';
import tokenABI from '@src/screens/universal-swap/config/abi/erc20.json';
import flatten from 'lodash/flatten';
import { ContractCallResults, Multicall } from 'ethereum-multicall';
import {
  chainInfos,
  CustomChainInfo,
  evmChains
} from '@src/screens/universal-swap/config/chainInfos';
import { Address } from '@owallet/crypto';
import { network } from '@src/screens/universal-swap/config/networks';
import {
  cosmosTokens,
  evmTokens,
  oraichainTokens,
  tokenMap
} from '@src/screens/universal-swap/config/bridgeTokens';
import { getEvmAddress } from '@src/screens/universal-swap/helper';

export type LoadTokenParams = {
  refresh?: boolean;
  metamaskAddress?: string;
  oraiAddress?: string;
  tronAddress?: string;
  kwtAddress?: string;
  client?: CosmWasmClient;
};
type AmountDetails = { [denom: string]: string };

async function loadNativeBalance(
  updateAmounts: Function,
  address: string,
  tokenInfo: { chainId?: string; rpc?: string }
) {
  if (!address) return;
  const client = await StargateClient.connect(tokenInfo.rpc);
  const amountAll = await client.getAllBalances(address);
  let amountDetails: AmountDetails = {};

  // reset native balances
  cosmosTokens
    .filter(t => t.chainId === tokenInfo.chainId && !t.contractAddress)
    .forEach(t => {
      amountDetails[t.denom] = '0';
    });

  Object.assign(
    amountDetails,
    Object.fromEntries(
      amountAll
        .filter(coin => tokenMap[coin.denom])
        .map(coin => [coin.denom, coin.amount])
    )
  );

  updateAmounts(amountDetails);
}

async function loadTokens(
  updateAmounts: Function,
  {
    oraiAddress,
    metamaskAddress,
    tronAddress,
    kwtAddress,
    client
  }: LoadTokenParams
) {
  console.log('tronAddress', tronAddress);

  await Promise.all(
    [
      oraiAddress && loadTokensCosmos(updateAmounts, oraiAddress),
      oraiAddress && loadCw20Balance(updateAmounts, oraiAddress, client),
      // different cointype but also require keplr connected by checking oraiAddress
      kwtAddress && loadKawaiiSubnetAmount(updateAmounts, kwtAddress),
      metamaskAddress &&
        loadEvmAmounts(updateAmounts, metamaskAddress, evmChains),
      tronAddress &&
        loadEvmAmounts(
          updateAmounts,
          Address.getEvmAddress(tronAddress),
          chainInfos.filter(c => c.chainId == '0x2b6653dc')
        )
    ].filter(Boolean)
  );
}

async function loadTokensCosmos(updateAmounts: Function, address: string) {
  //   await handleCheckWallet();
  const { words, prefix } = bech32.decode(address);
  const cosmosInfos = chainInfos.filter(
    chainInfo => chainInfo.bip44.coinType === 118
  );
  for (const chainInfo of cosmosInfos) {
    const networkPrefix = chainInfo.bech32Config.bech32PrefixAccAddr;
    const cosmosAddress =
      networkPrefix === prefix ? address : bech32.encode(networkPrefix, words);
    loadNativeBalance(updateAmounts, cosmosAddress, chainInfo);
  }
}

async function loadCw20Balance(
  updateAmounts: Function,
  address: string,
  client: CosmWasmClient
) {
  if (!address) return;
  // get all cw20 token contract
  const cw20Tokens = oraichainTokens.filter(t => t.contractAddress);
  const data = toBinary({
    balance: { address }
  });

  const multicall = new MulticallQueryClient(client, network.multicall);

  const res = await multicall.aggregate({
    queries: cw20Tokens.map(t => ({
      address: t.contractAddress,
      data
    }))
  });

  const amountDetails = Object.fromEntries(
    cw20Tokens.map((t, ind) => {
      if (!res.return_data[ind].success) {
        return [t.denom, 0];
      }
      const balanceRes = fromBinary(
        res.return_data[ind].data
      ) as OraiswapTokenTypes.BalanceResponse;
      const amount = balanceRes.balance;
      return [t.denom, amount];
    })
  );
  updateAmounts(amountDetails);
}

async function loadEvmEntries(
  address: string,
  chain: CustomChainInfo,
  multicallCustomContractAddress?: string
): Promise<[string, string][]> {
  const tokens = evmTokens.filter(t => t.chainId === chain.chainId);
  console.log('tokens === 1', tokens, chain.rpc);

  if (!tokens.length) return [];
  const multicall = new Multicall({
    nodeUrl: chain.rpc,
    multicallCustomContractAddress
  });
  const input = tokens.map(token => ({
    reference: token.denom,
    contractAddress: token.contractAddress,
    abi: tokenABI,
    calls: [
      {
        reference: token.denom,
        methodName: 'balanceOf(address)',
        methodParameters: [address]
      }
    ]
  }));

  console.log('input', input);

  try {
    const results: ContractCallResults = await multicall.call(input);

    console.log('results', results);

    return tokens.map(token => {
      const amount =
        results.results[token.denom].callsReturnContext[0].returnValues[0].hex;
      return [token.denom, amount];
    });
  } catch (err) {
    console.log('err 2', err);
  }
}

async function loadEvmAmounts(
  updateAmounts: Function,
  evmAddress: string,
  chains: CustomChainInfo[]
) {
  console.log('get here 2');

  const amountDetails = Object.fromEntries(
    flatten(
      await Promise.all(chains.map(chain => loadEvmEntries(evmAddress, chain)))
    )
  );

  console.log('amountDetails', amountDetails);

  updateAmounts(amountDetails);
}

async function loadKawaiiSubnetAmount(
  updateAmounts: Function,
  kwtAddress: string
) {
  if (!kwtAddress) return;
  const kawaiiInfo = chainInfos.find(c => c.chainId === 'kawaii_6886-1');
  loadNativeBalance(updateAmounts, kwtAddress, kawaiiInfo);

  const kwtSubnetAddress = getEvmAddress(kwtAddress);
  const kawaiiEvmInfo = chainInfos.find(c => c.chainId === '0x1ae6');
  let amountDetails = Object.fromEntries(
    await loadEvmEntries(kwtSubnetAddress, kawaiiEvmInfo)
  );
  // update amounts
  updateAmounts(amountDetails);
}

export default function useLoadTokens(
  updateAmounts
): (params: LoadTokenParams) => Promise<void> {
  return loadTokens.bind(null, updateAmounts);
}
