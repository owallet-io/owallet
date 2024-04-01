import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import {
  CustomChainInfo,
  ERC20__factory,
  evmChains,
} from "@oraichain/oraidex-common";
import flatten from "lodash/flatten";
import { ContractCallResults, Multicall } from "@oraichain/ethereum-multicall";
import {
  evmTokens,
  getEvmAddress,
  tronToEthAddress,
} from "@oraichain/oraidex-common";
import { network, chainInfos } from "@oraichain/oraidex-common";
import {
  cosmosTokens,
  oraichainTokens,
  tokenMap,
} from "@oraichain/oraidex-common";
import { isEvmNetworkNativeSwapSupported } from "@owallet/common";
import { CWStargate } from "@owallet/common";
import { AccountWithAll } from "@owallet/stores";

const EVM_BALANCE_RETRY_COUNT = 2;

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
  tokenReload?: Array<string>;
};
type AmountDetails = { [denom: string]: string };

async function loadNativeBalance(
  universalSwapStore: any,
  address: string,
  tokenInfo: { chainId?: string; rpc?: string }
) {
  if (!address) return;
  const client = await StargateClient.connect(tokenInfo.rpc);
  const amountAll = await client.getAllBalances(address);
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
}

const timer = {};
async function loadTokens(
  universalSwapStore: any,
  {
    oraiAddress,
    metamaskAddress,
    tronAddress,
    kwtAddress,
    cwStargate,
    tokenReload,
  }: LoadTokenParams
) {
  if (oraiAddress) {
    clearTimeout(timer[oraiAddress]);
    // case get address when keplr ledger not support kawaii
    timer[oraiAddress] = setTimeout(async () => {
      await Promise.all([
        loadTokensCosmos(
          universalSwapStore,
          kwtAddress,
          oraiAddress,
          tokenReload
        ),
        loadCw20Balance(
          universalSwapStore,
          oraiAddress,
          cwStargate,
          tokenReload
        ),
        // different cointype but also require keplr connected by checking oraiAddress
        loadKawaiiSubnetAmount(universalSwapStore, kwtAddress, tokenReload),
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
        tokenReload
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
        tokenReload
      );
    }, 500);

    universalSwapStore.setLoaded(true);
  }
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
  kwtAddress: string,
  oraiAddress: string,
  tokenReload?: Array<any>
) {
  if (!kwtAddress || !oraiAddress) return;
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
      kwtAddress,
      oraiAddress
    );

    loadNativeBalance(updateAmounts, cosmosAddress, chainInfo);
  }
}

async function loadCw20Balance(
  universalSwapStore: any,
  address: string,
  cwStargate: CWStargateType,
  tokenReload?: any
) {
  if (!address) return;
  // get all cw20 token contract
  let cw20Tokens = oraichainTokens.filter((t) => t.contractAddress);

  if (tokenReload) {
    tokenReload.map((token) => {
      if (token.networkType === "cosmos") {
        cw20Tokens = cw20Tokens.filter(
          (c) => token.contractAddress === c.contractAddress
        );
      }
    });
  }

  const data = toBinary({
    balance: { address },
  });

  const client = await CWStargate.init(
    cwStargate.account,
    cwStargate.chainId,
    cwStargate.rpc
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
  } catch (err) {}
}

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
  tokenReload?: any,
  multicallCustomContractAddress?: string,
  retryCount?: number
): Promise<[string, string][]> {
  try {
    console.log("evmTokens", evmTokens);
    console.log("tokenReload", tokenReload);

    const tokens = evmTokens.filter((t) => {
      let result;
      if (tokenReload) {
        tokenReload.map((token) => {
          if (token.networkType === "evm") {
            console.log("token evm", token);

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

    const nativeEvmToken = evmTokens.find(
      (t) =>
        !t.contractAddress &&
        isEvmNetworkNativeSwapSupported(chain.chainId) &&
        chain.chainId === t.chainId
    );

    if (!tokens.length) return [];
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
    return entries;
  } catch (error) {
    console.log("error querying EVM balance: ", error);
    let retry = retryCount ? retryCount + 1 : 1;
    if (retry >= EVM_BALANCE_RETRY_COUNT)
      throw `Cannot query EVM balance with error: ${error}`;
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return loadEvmEntries(
      address,
      chain,
      tokenReload,
      multicallCustomContractAddress,
      retry
    );
  }
}

async function loadEvmAmounts(
  universalSwapStore: any,
  evmAddress: string,
  chains: CustomChainInfo[],
  tokenReload?: any
) {
  //@ts-ignore
  const amountDetails = Object.fromEntries(
    flatten(
      await Promise.all(
        chains.map((chain) => loadEvmEntries(evmAddress, chain, tokenReload))
      )
    )
  );

  universalSwapStore.updateAmounts(amountDetails);
}

export async function loadKawaiiSubnetAmount(
  universalSwapStore: any,
  kwtAddress: string,
  tokenReload?: any
) {
  if (!kwtAddress) return;
  const kawaiiInfo = chainInfos.find((c) => c.chainId === "kawaii_6886-1");
  try {
    loadNativeBalance(universalSwapStore, kwtAddress, kawaiiInfo);

    const kwtSubnetAddress = getEvmAddress(kwtAddress);
    const kawaiiEvmInfo = chainInfos.find((c) => c.chainId === "0x1ae6");
    //@ts-ignore
    let amountDetails = Object.fromEntries(
      await loadEvmEntries(kwtSubnetAddress, kawaiiEvmInfo, tokenReload)
    );

    universalSwapStore.updateAmounts(amountDetails);
  } catch (err) {
    console.log("loadKawaiiSubnetAmount err", err);
  }
}

export function useLoadTokens(
  universalSwapStore: any
): (params: LoadTokenParams) => Promise<void> {
  return loadTokens.bind(null, universalSwapStore);
}
