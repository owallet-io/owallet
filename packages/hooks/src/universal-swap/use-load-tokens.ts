import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { CustomChainInfo, ERC20__factory } from "@oraichain/oraidex-common";
import flatten from "lodash/flatten";
import { ContractCallResults, Multicall } from "@oraichain/ethereum-multicall";
import { tronToEthAddress } from "@oraichain/oraidex-common";

import { ChainIdEnum, isEvmNetworkNativeSwapSupported } from "@owallet/common";
import { CWStargate } from "@owallet/common";
import { uniqBy } from "lodash";
// import axios from 'axios';

// export const getUtxos = async (address: string, baseUrl: string) => {
//   if (!address) throw Error('Address is not empty');
//   if (!baseUrl) throw Error('BaseUrl is not empty');
//   const { data } = await axios({
//     baseURL: baseUrl,
//     method: 'get',
//     url: `/address/${address}/utxo`
//   });
//   return data;
// };

const EVM_BALANCE_RETRY_COUNT = 2;
// const COSMOS_BALANCE_RETRY_COUNT = 4;

const flattenObject = (array) => {
  return array.reduce((acc, obj) => {
    if (obj && typeof obj === "object") {
      return { ...acc, ...obj };
    }
    return acc; // Skip null or invalid entries
  }, {});
};

export type CWStargateType = {
  account: any;
  chainId: string;
  rpc: string;
};

export type LoadTokenParams = {
  cosmosTokens;
  tokenMap;
  chainInfos;
  oraichainTokens;
  network;
  evmChains;
  evmTokens;
  refresh?: boolean;
  metamaskAddress?: string;
  oraiAddress?: string;
  tronAddress?: string;
  injAddress?: string;
  cwStargate?: CWStargateType;
  tokenReload?: Array<any>;
  customChainInfos?: Array<any>;
};
type AmountDetails = { [denom: string]: string };

async function loadNativeBalance(
  universalSwapStore: any,
  address: string,
  tokenInfo: { chainId: string; rpc: string },
  cosmosTokens,
  tokenMap,
  retryCount?: number
) {
  if (!address) return;
  if (address.startsWith("oraie") || address.startsWith("oraibtc")) return;
  try {
    const client = await StargateClient.connect(tokenInfo.rpc);
    let amountAll = await client.getAllBalances(address);
    let amountDetails: AmountDetails = {};

    // reset native balances
    cosmosTokens
      .filter((t) => t.chainId === tokenInfo.chainId && !t.contractAddress)
      .forEach((t) => {
        amountDetails[t.denom] = "0";
      });

    Object.assign(
      amountDetails, //@ts-ignore
      Object.fromEntries(
        amountAll
          .filter((coin) => tokenMap[coin.denom])
          .map((coin) => [coin.denom, coin.amount])
      )
    );
    universalSwapStore.updateAmounts(amountDetails);
  } catch (err) {
    console.log("error address,", address, err);
    console.log("retryCount", retryCount);

    let retry = retryCount ? retryCount + 1 : 1;
    if (retry >= EVM_BALANCE_RETRY_COUNT) {
      throw `Cannot loadNativeBalance with error: ${err}`;
    }

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("try again with address ", address);

    return loadNativeBalance(
      universalSwapStore,
      address,
      tokenInfo,
      cosmosTokens,
      tokenMap,
      retry
    );
  }
}

const timer = {};

async function loadTokens(
  universalSwapStore: any,
  {
    oraiAddress,
    metamaskAddress,
    tronAddress,
    injAddress,
    cwStargate,
    cosmosTokens,
    tokenMap,
    chainInfos,
    tokenReload,
    customChainInfos,
    oraichainTokens,
    network,
    evmChains,
    evmTokens,
  }: LoadTokenParams
) {
  const customEvmTokens = uniqBy(
    customChainInfos.filter(
      (token) =>
        // !token.contractAddress &&
        token.denom &&
        !token.cosmosBased &&
        token.coinGeckoId &&
        token.chainId !== "kawaii_6886-1"
    ),
    (c) => c.denom
  );
  if (tokenReload) {
    tokenReload.map((t) => {
      if (t.networkType === "cosmos") {
        if (oraiAddress) {
          clearTimeout(timer[oraiAddress]);
          // case get address when keplr ledger not support kawaii
          timer[oraiAddress] = setTimeout(async () => {
            await Promise.all([
              loadTokensCosmos(
                universalSwapStore,
                injAddress,
                oraiAddress,
                cosmosTokens,
                tokenMap,
                chainInfos,
                tokenReload
              ),
              loadCw20Balance(
                universalSwapStore,
                oraiAddress,
                cwStargate,
                oraichainTokens,
                network
              ),
              // different cointype but also require keplr connected by checking oraiAddress
              // loadKawaiiSubnetAmount(universalSwapStore, injAddress, tokenReload)
            ]);
          }, 500);
        }
      }
      if (t.networkType === "evm") {
        if (t.chainId === ChainIdEnum.TRON) {
          if (tronAddress) {
            clearTimeout(timer[tronAddress]);
            timer[tronAddress] = setTimeout(() => {
              loadEvmAmounts(
                universalSwapStore,
                tronToEthAddress(tronAddress),
                chainInfos.filter((c) => c.chainId == "0x2b6653dc"),
                true,
                evmTokens,
                tokenReload
              );
            }, 500);
          }
        } else {
          if (metamaskAddress) {
            clearTimeout(timer[metamaskAddress]);
            timer[metamaskAddress] = setTimeout(() => {
              loadEvmAmounts(
                universalSwapStore,
                metamaskAddress,
                evmChains,
                false,
                evmTokens,
                tokenReload
              );
            }, 500);
          }
        }
      }
    });
    universalSwapStore.setLoaded(true);
    return;
  }

  if (oraiAddress) {
    clearTimeout(timer[oraiAddress]);
    // case get address when keplr ledger not support kawaii
    timer[oraiAddress] = setTimeout(async () => {
      await Promise.all([
        loadTokensCosmos(
          universalSwapStore,
          injAddress,
          oraiAddress,
          cosmosTokens,
          tokenMap,
          chainInfos,
          tokenReload
        ),
        loadCw20Balance(
          universalSwapStore,
          oraiAddress,
          cwStargate,
          oraichainTokens,
          network
        ),
        // different cointype but also require keplr connected by checking oraiAddress
        // loadKawaiiSubnetAmount(universalSwapStore, injAddress, tokenReload)
      ]);
    }, 500);
  }

  if (metamaskAddress) {
    clearTimeout(timer[metamaskAddress]);
    timer[metamaskAddress] = setTimeout(() => {
      loadEvmAmounts(
        universalSwapStore,
        metamaskAddress,
        evmChains,
        false,
        evmTokens,
        tokenReload,
        customEvmTokens
      );
    }, 500);
  }

  if (tronAddress) {
    clearTimeout(timer[tronAddress]);
    timer[tronAddress] = setTimeout(() => {
      loadEvmAmounts(
        universalSwapStore,
        tronToEthAddress(tronAddress),
        chainInfos.filter((c) => c.chainId == "0x2b6653dc"),
        true,
        evmTokens,
        tokenReload
      );
    }, 500);
  }
  universalSwapStore.setLoaded(true);
}

const getAddress = (addr, prefix: string) => {
  const { data } = fromBech32(addr);
  return toBech32(prefix, data);
};

export const genAddressCosmos = (info, address60, address118) => {
  const mapAddress = {
    60: address60,
    118: address118,
  };
  const addr = mapAddress[info.bip44.coinType || 118];
  const cosmosAddress = getAddress(addr, info.bech32Config.bech32PrefixAccAddr);
  return { cosmosAddress };
};

async function loadTokensCosmos(
  updateAmounts: any,
  injectiveAddress: string,
  oraiAddress: string,
  cosmosTokens,
  tokenMap,
  chainInfos,
  tokenReload?: Array<any>
) {
  if (!injectiveAddress || !oraiAddress) return;
  let cosmosInfos = chainInfos.filter(
    (chainInfo) =>
      chainInfo.networkType === "cosmos" || chainInfo.bip44.coinType === 118
  );

  if (tokenReload) {
    tokenReload.map((token) => {
      if (token.networkType === "cosmos") {
        cosmosInfos = cosmosInfos.filter((c) => token.chainId == c.chainId);
      }
    });
  }

  for (const chainInfo of cosmosInfos) {
    const { cosmosAddress } = genAddressCosmos(
      chainInfo,
      injectiveAddress,
      oraiAddress
    );

    loadNativeBalance(
      updateAmounts,
      cosmosAddress,
      chainInfo,
      cosmosTokens,
      tokenMap
    );
  }
}

async function loadCw20Balance(
  universalSwapStore: any,
  address: string,
  cwStargate: CWStargateType,
  oraichainTokens,
  network,
  // tokenReload?: any,
  retryCount?: number
) {
  if (!address) return;
  // get all cw20 token contract
  let cw20Tokens = oraichainTokens.filter((t) => t.contractAddress);

  // if (tokenReload) {
  //   tokenReload.map((token) => {
  //     if (token.networkType === "cosmos") {
  //       cw20Tokens = cw20Tokens.filter(
  //         (c) => token.contractAddress === c.contractAddress
  //       );
  //     }
  //   });
  // }

  const data = toBinary({
    balance: { address },
  });

  const client = await CWStargate.init(
    cwStargate.account,
    cwStargate.chainId,
    cwStargate.rpc,
    network
  );

  try {
    const multicall = new MulticallQueryClient(client, network.multicall);

    const res = await multicall.aggregate({
      queries: cw20Tokens.map((t) => ({
        address: t.contractAddress,
        data,
      })),
    });

    //@ts-ignore
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

    universalSwapStore.updateAmounts(amountDetails);
  } catch (err) {
    console.log("error querying loadCw20Balance: ", err);
    let retry = retryCount ? retryCount + 1 : 1;
    if (retry >= EVM_BALANCE_RETRY_COUNT) {
      console.error(`Cannot query loadCw20Balance balance with error: ${err}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return loadCw20Balance(
      universalSwapStore,
      address,
      cwStargate,
      oraichainTokens,
      network,
      retry
    );
  }
}

// async function loadBtcAmounts(  universalSwapStore: any,
//    btcAddress: string, chains: CustomChainInfo[]) {
//   const amountDetails = Object.fromEntries(
//     flatten(await Promise.all(chains.map(chain => loadBtcEntries(btcAddress, chain))))
//   );

//   universalSwapStore.updateAmounts(amountDetails);
// }

// async function loadNativeBtcBalance(address: string, chain: CustomChainInfo) {
//   const data = await getUtxos(address, chain.rest);
//   const total = reduce(
//     data,
//     function (sum, n) {
//       return sum + n.value;
//     },
//     0
//   );

//   return total;
// }

// async function loadBtcEntries(
//   address: string,
//   chain: CustomChainInfo,

//   retryCount?: number
// ): Promise<[string, string][]> {
//   try {
//     const nativeBtc = btcTokens.find(t => chain.chainId === t.chainId);

//     const nativeBalance = await loadNativeBtcBalance(address, chain);
//     let entries: [string, string][] = [[nativeBtc.denom, nativeBalance.toString()]];
//     return entries;
//   } catch (error) {
//     console.log('error querying BTC balance: ', error);
//     let retry = retryCount ? retryCount + 1 : 1;
//     if (retry >= EVM_BALANCE_RETRY_COUNT) throw (`Cannot query BTC balance with error: ${error}`);
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     return loadBtcEntries(address, chain, retry);
//   }
// }

async function loadNativeEvmBalance(address: string, chain: CustomChainInfo) {
  try {
    const client = new JsonRpcProvider(chain.rpc);
    const balance = await client.getBalance(address);
    return balance;
  } catch (error) {
    console.log("error load native evm balance: ", error);
  }
}

async function loadEvmEntries(
  address: string,
  chain: CustomChainInfo,
  evmTokens: any,
  tokenReload?: Array<any>,
  customEvmTokens?: Array<any>,
  multicallCustomContractAddress?: string,
  retryCount?: number
  // ): Promise<[string, string][]> {
): Promise<Object> {
  try {
    const tokensEVM = customEvmTokens ?? evmTokens;
    const tokens = tokensEVM.filter((t) => {
      let result;
      if (tokenReload) {
        tokenReload.map((token) => {
          if (token.networkType === "evm") {
            if (
              token.contractAddress === t.contractAddress ||
              token.chainId === chain.chainId
            ) {
              result = t.chainId === chain.chainId && t.contractAddress;
            }
          }
        });
      } else {
        result = t.chainId === chain.chainId && t.contractAddress;
      }

      return !!result;
    });

    const nativeEvmToken = tokensEVM.find(
      (t) =>
        !t.contractAddress &&
        isEvmNetworkNativeSwapSupported(chain.chainId) &&
        chain.chainId === t.chainId
    );

    if (!tokens?.length) return [];
    const multicall = new Multicall({
      nodeUrl: chain.rpc,
      multicallCustomContractAddress,
      chainId: Number(chain.chainId),
    });
    const input = tokens.map((token) => ({
      reference: token.denom,
      contractAddress: token.contractAddress,
      abi: ERC20__factory.abi,
      calls: [
        {
          reference: token.denom,
          methodName: "balanceOf(address)",
          methodParameters: [address],
        },
      ],
    }));

    const results: ContractCallResults = await multicall.call(input as any);
    const nativeBalance = nativeEvmToken
      ? await loadNativeEvmBalance(address, chain)
      : 0;
    let entries: [string, string][] = tokens.map((token) => {
      const amount =
        results.results[token.denom].callsReturnContext[0].returnValues[0].hex;
      return [token.denom, amount];
    });
    if (nativeEvmToken)
      entries.push([nativeEvmToken.denom, nativeBalance.toString()]);

    return Object.fromEntries(entries);
  } catch (error) {
    console.log("error querying EVM balance: ", error);
    let retry = retryCount ? retryCount + 1 : 1;
    if (retry >= EVM_BALANCE_RETRY_COUNT) {
      console.error(`Cannot query EVM balance with error: ${error}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return loadEvmEntries(
      address,
      chain,
      evmTokens,
      tokenReload,
      customEvmTokens,
      multicallCustomContractAddress,
      retry
    );
  }
}

async function loadEvmAmounts(
  universalSwapStore: any,
  evmAddress: string,
  chains: CustomChainInfo[],
  isTronAddress: boolean,
  evmTokens,
  tokenReload?: Array<any>,
  customEvmTokens?: Array<any>
) {
  try {
    const amountDetails = flatten(
      await Promise.all(
        chains.map((chain) =>
          loadEvmEntries(
            evmAddress,
            chain,
            evmTokens,
            tokenReload,
            customEvmTokens
          )
        )
      )
    );

    const tokens = flattenObject(amountDetails);

    if (!isTronAddress) {
      Object.keys(tokens).forEach(function (key) {
        if (key.startsWith("trx")) {
          delete tokens[key];
        }
      });
    }

    universalSwapStore.updateAmounts(tokens);
  } catch (error) {
    console.log("error on loadEvmAmounts: ", error);
  }
}

// export async function loadKawaiiSubnetAmount(universalSwapStore: any, injAddress: string, tokenReload?: any) {
//   if (!injAddress) return;
//   const kawaiiInfo = chainInfos.find(c => c.chainId === 'kawaii_6886-1');
//   try {
//     loadNativeBalance(universalSwapStore, injAddress, kawaiiInfo);

//     const kwtSubnetAddress = getEvmAddress(injAddress);
//     const kawaiiEvmInfo = chainInfos.find(c => c.chainId === '0x1ae6');
//     //@ts-ignore
//     let amountDetails = Object.fromEntries(await loadEvmEntries(kwtSubnetAddress, kawaiiEvmInfo, tokenReload));

//     universalSwapStore.updateAmounts(amountDetails);
//   } catch (err) {
//     console.log('loadKawaiiSubnetAmount err', err);
//   }
// }

export function useLoadTokens(
  universalSwapStore: any
): (params: LoadTokenParams) => Promise<void> {
  return loadTokens.bind(null, universalSwapStore);
}
