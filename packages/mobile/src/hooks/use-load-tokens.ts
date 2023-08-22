import { fromBinary, toBinary } from '@cosmjs/cosmwasm-stargate';
import { StargateClient } from '@cosmjs/stargate';
import { MulticallQueryClient } from '@oraichain/common-contracts-sdk';
import { OraiswapTokenTypes } from '@oraichain/oraidex-contracts-sdk';
import bech32 from 'bech32';
import tokenABI from '@src/screens/universal-swap/config/abi/erc20.json';
import flatten from 'lodash/flatten';
import { ContractCallResults } from 'ethereum-multicall';
import { Multicall } from '@src/screens/universal-swap/libs/multicall';

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
import { UniversalSwapStore } from '@src/stores/universal_swap';
import { CWStargate } from '@src/common/cw-stargate';
import { OWallet } from '@owallet/provider';
import { AccountWithAll } from '@owallet/stores';

export type CWStargateType = {
  account: AccountWithAll;
  chainId: string;
  rpc: string;
};

export type LoadTokenParams = {
  refresh?: boolean;
  metamaskAddress?: string;
  oraiAddress?: string;
  tronAddress?: string;
  kwtAddress?: string;
  cwStargate?: CWStargateType;
};
type AmountDetails = { [denom: string]: string };

async function loadNativeBalance(
  updateAmounts: UniversalSwapStore,
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

  updateAmounts.updateAmounts(amountDetails);
}

async function loadTokens(
  universalSwapStore: any,
  {
    oraiAddress,
    metamaskAddress,
    tronAddress,
    kwtAddress,
    cwStargate
  }: LoadTokenParams
) {
  await Promise.all(
    [
      oraiAddress && loadTokensCosmos(universalSwapStore, oraiAddress),
      oraiAddress &&
        cwStargate &&
        loadCw20Balance(universalSwapStore, oraiAddress, cwStargate),
      // different cointype but also require keplr connected by checking oraiAddress
      kwtAddress && loadKawaiiSubnetAmount(universalSwapStore, kwtAddress),
      metamaskAddress &&
        loadEvmAmounts(universalSwapStore, metamaskAddress, evmChains),
      tronAddress &&
        loadEvmAmounts(
          universalSwapStore,
          Address.getEvmAddress(tronAddress),
          chainInfos.filter(c => c.chainId == '0x2b6653dc')
        )
    ].filter(Boolean)
  );
}

async function loadTokensCosmos(
  updateAmounts: UniversalSwapStore,
  address: string
) {
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
  universalSwapStore: UniversalSwapStore,
  address: string,
  cwStargate: CWStargateType
) {
  if (!address) return;
  // get all cw20 token contract
  const cw20Tokens = oraichainTokens.filter(t => t.contractAddress);
  console.log('loadCw20Balance oraichainTokens', oraichainTokens);

  const data = toBinary({
    balance: { address }
  });

  const client = await CWStargate.init(
    cwStargate.account,
    cwStargate.chainId,
    cwStargate.rpc
  );

  try {
    const multicall = new MulticallQueryClient(client, network.multicall);
    console.log('loadCw20Balance multicall', multicall);
    console.log('loadCw20Balance cw20Tokens', cw20Tokens);
    console.log('loadCw20Balance data', data);

    const res = await multicall.aggregate({
      queries: cw20Tokens.map(t => ({
        address: t.contractAddress,
        data
      }))
    });
    console.log('loadCw20Balance res', res);

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

    console.log('loadCw20Balance amountDetails', amountDetails);

    universalSwapStore.updateAmounts(amountDetails);
  } catch (err) {
    console.log('loadCw20Balance error', err);
  }
}

async function loadEvmEntries(
  address: string,
  chain: CustomChainInfo,
  multicallCustomContractAddress?: string
): Promise<[string, string][]> {
  const tokens = evmTokens.filter(t => t.chainId === chain.chainId);

  if (!tokens.length) return [];
  const multicall = new Multicall({
    nodeUrl: chain.rpc,
    multicallCustomContractAddress,
    chainId: Number(chain.chainId)
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

  try {
    const results: ContractCallResults = await multicall.call(input);

    return tokens.map(token => {
      const amount =
        results.results[token.denom].callsReturnContext[0].returnValues[0].hex;
      return [token.denom, amount];
    });
  } catch (err) {
    console.log('loadEvmEntries error', err);
  }
}

async function loadEvmAmounts(
  universalSwapStore: UniversalSwapStore,
  evmAddress: string,
  chains: CustomChainInfo[]
) {
  const amountDetails = Object.fromEntries(
    flatten(
      await Promise.all(chains.map(chain => loadEvmEntries(evmAddress, chain)))
    )
  );

  universalSwapStore.updateAmounts(amountDetails);
}

export async function loadKawaiiSubnetAmount(
  universalSwapStore: UniversalSwapStore,
  kwtAddress: string
) {
  if (!kwtAddress) return;
  const kawaiiInfo = chainInfos.find(c => c.chainId === 'kawaii_6886-1');
  try {
    loadNativeBalance(universalSwapStore, kwtAddress, kawaiiInfo);

    const kwtSubnetAddress = getEvmAddress(kwtAddress);
    const kawaiiEvmInfo = chainInfos.find(c => c.chainId === '0x1ae6');
    let amountDetails = Object.fromEntries(
      await loadEvmEntries(kwtSubnetAddress, kawaiiEvmInfo)
    );

    universalSwapStore.updateAmounts(amountDetails);
  } catch (err) {
    console.log('loadKawaiiSubnetAmount err', err);
  }
}

export default function useLoadTokens(
  universalSwapStore: UniversalSwapStore
): (params: LoadTokenParams) => Promise<void> {
  return loadTokens.bind(null, universalSwapStore);
}
