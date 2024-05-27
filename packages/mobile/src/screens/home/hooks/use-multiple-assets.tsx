import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, InteractionManager, Text, View } from "react-native";
import { useStore } from "@src/stores";
import { ChainIdEnum } from "@owallet/common";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import Web3 from "web3";
import axios from "axios";
import {
  addressToPublicKey,
  getOasisNic,
  getRpcByChainId,
  parseRpcBalance,
} from "@owallet/common";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { CWStargate, DenomHelper } from "@owallet/common";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import { ContractCallResults, Multicall } from "@oraichain/ethereum-multicall";
import {
  ERC20__factory,
  network,
  oraichainNetwork,
} from "@oraichain/oraidex-common";
import OWFlatList from "@src/components/page/ow-flat-list";
import {
  HugeQueriesStore,
  ViewToken,
  ViewTokenData,
} from "@src/stores/huge-queries";
import { AppCurrency, ChainInfo } from "@owallet/types";
import {
  AccountStore,
  AccountWithAll,
  CoinGeckoPriceStore,
} from "@owallet/stores";
import { ChainStore } from "@src/stores/chain";

const initPrice = new PricePretty(
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  new Dec("0")
);
export const useMultipleAssets = (
  accountStore: AccountStore<AccountWithAll>,
  priceStore: CoinGeckoPriceStore,
  hugeQueriesStore: HugeQueriesStore,
  chainId: string,
  isAllNetwork: boolean
) => {
  console.log(chainId, "chainId");
  const [dataTokens, setDataTokens] = useState<ViewToken[]>([]);
  const [totalPriceBalance, setTotalPriceBalance] =
    useState<PricePretty>(initPrice);
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  if (!fiatCurrency) return;
  const tokensByChain = useRef<Record<ChainIdEnum, ViewTokenData>>({});
  const tokensByChainId = tokensByChain.current;
  let overallTotalBalance = initPrice;
  let allTokens: ViewToken[] = [];
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      init();
    });
  }, []);
  console.log(isAllNetwork, tokensByChainId[chainId], "isAllNetwork");
  useEffect(() => {
    if (isAllNetwork) {
      setDataTokens(sortTokensByPrice(allTokens));
      setTotalPriceBalance(overallTotalBalance);
      return;
    } else if (tokensByChainId[chainId]) {
      setDataTokens(sortTokensByPrice(tokensByChainId[chainId].tokens));
      setTotalPriceBalance(tokensByChainId[chainId].totalBalance);
      return;
    }
  }, [chainId, isAllNetwork]);
  const init = async () => {
    try {
      const allChain = Array.from(hugeQueriesStore.getAllChainMap.values());
      const allBalancePromises = allChain.map(
        async ({ address, chainInfo }) => {
          switch (chainInfo.networkType) {
            case "cosmos":
              return chainInfo.chainId === ChainIdEnum.Oraichain
                ? Promise.all([
                    getBalanceCW20Oraichain(),
                    getBalanceNativeCosmos(address, chainInfo),
                  ])
                : getBalanceNativeCosmos(address, chainInfo);
            case "evm":
              return chainInfo.chainId === ChainIdEnum.Oasis
                ? getBalanceOasis(address, chainInfo)
                : Promise.all([
                    getBalanceNativeEvm(address, chainInfo),
                    getBalanceErc20(address, chainInfo),
                  ]);
            case "bitcoin":
              return getBalanceBtc(address, chainInfo);
          }
        }
      );

      const allData = await Promise.allSettled(allBalancePromises);
      // Loop through each key in the data object
      for (const chain in tokensByChainId) {
        if (tokensByChainId.hasOwnProperty(chain)) {
          // Add the total balance for each chain to the overall total balance
          overallTotalBalance = overallTotalBalance.add(
            tokensByChainId[chain].totalBalance
          );
          // Concatenate the tokens for each chain to the allTokens array
          allTokens = allTokens.concat(tokensByChainId[chain].tokens);
        }
      }
      setDataTokens(sortTokensByPrice(allTokens));
      setTotalPriceBalance(overallTotalBalance);
    } catch (error) {
      console.error("Initialization error:", error);
    }
  };

  const sortTokensByPrice = (tokens: ViewToken[]) => {
    return tokens.sort(
      (a, b) =>
        Number(b.price.toDec().toString()) - Number(a.price.toDec().toString())
    );
  };

  const getBalanceNativeEvm = async (address, chainInfo: ChainInfo) => {
    const web3 = new Web3(getRpcByChainId(chainInfo, chainInfo.chainId));
    const ethBalance = await web3.eth.getBalance(address);
    if (ethBalance) {
      const balance = new CoinPretty(
        chainInfo.stakeCurrency,
        Number(ethBalance)
      );

      const price = priceStore.calculatePrice(balance);
      const infoToken = {
        token: balance,
        chainInfo,
        price,
        isFetching: null,
        error: null,
      };
      tokensByChainId[chainInfo.chainId] = {
        tokens: [
          ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
          infoToken,
        ],
        totalBalance: (
          tokensByChainId[chainInfo.chainId]?.totalBalance || initPrice
        ).add(price),
      };
    }
  };

  const getBalanceBtc = async (address, chainInfo: ChainInfo) => {
    const client = axios.create({ baseURL: chainInfo.rest });
    const { data } = await client.get(`/address/${address}/utxo`);
    if (data) {
      const totalBtc = data.reduce((acc, curr) => acc + curr.value, 0);
      const balance = new CoinPretty(chainInfo.stakeCurrency, totalBtc);
      const price = await priceStore.waitCalculatePrice(balance);
      const infoToken = {
        token: balance,
        chainInfo,
        price,
        isFetching: null,
        error: null,
      };
      tokensByChainId[chainInfo.chainId] = {
        tokens: [
          ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
          infoToken,
        ],
        totalBalance: (
          tokensByChainId[chainInfo.chainId]?.totalBalance || initPrice
        ).add(price),
      };
    }
  };

  const getBalanceNativeCosmos = async (address, chainInfo: ChainInfo) => {
    const client = axios.create({ baseURL: chainInfo.rest });
    const { data } = await client.get(
      `/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`
    );
    const mergedMaps = chainInfo.currencyMap;

    data.balances.forEach(({ denom, amount }) => {
      const token = mergedMaps.get(denom);
      if (token) {
        const balance = new CoinPretty(token, amount);
        const price = priceStore.calculatePrice(balance);
        const infoToken = {
          token: balance,
          chainInfo,
          price,
          isFetching: null,
          error: null,
        };
        tokensByChainId[chainInfo.chainId] = {
          tokens: [
            ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
            infoToken,
          ],
          totalBalance: (
            tokensByChainId[chainInfo.chainId]?.totalBalance || initPrice
          ).add(price),
        };
      }
    });
  };

  const getBalanceCW20Oraichain = async () => {
    const mergedMaps = hugeQueriesStore.getAllChainMap.get(
      ChainIdEnum.Oraichain
    ).chainInfo.currencyMap;
    const data = toBinary({
      balance: {
        address: hugeQueriesStore.getAllChainMap.get(ChainIdEnum.Oraichain)
          .address,
      },
    });

    try {
      const cwStargate = {
        account: accountStore.getAccount(ChainIdEnum.Oraichain),
        chainId: ChainIdEnum.Oraichain,
        rpc: oraichainNetwork.rpc,
      };
      const client = await CWStargate.init(
        cwStargate.account,
        cwStargate.chainId,
        cwStargate.rpc
      );
      const tokensCw20 = hugeQueriesStore.getAllChainMap
        .get(ChainIdEnum.Oraichain)
        .chainInfo.currencies.filter(
          (item) => new DenomHelper(item.coinMinimalDenom).contractAddress
        );
      const multicall = new MulticallQueryClient(client, network.multicall);
      const res = await multicall.aggregate({
        queries: tokensCw20.map((t) => ({
          address: new DenomHelper(t.coinMinimalDenom).contractAddress,
          data,
        })),
      });

      tokensCw20.map((t, ind) => {
        if (res.return_data[ind].success) {
          const balanceRes = fromBinary(
            res.return_data[ind].data
          ) as OraiswapTokenTypes.BalanceResponse;
          const token = mergedMaps.get(t.coinMinimalDenom);
          if (token) {
            const balance = new CoinPretty(token, balanceRes.balance);
            const price = priceStore.calculatePrice(balance);
            const infoToken = {
              token: balance,
              chainInfo: hugeQueriesStore.getAllChainMap.get(
                ChainIdEnum.Oraichain
              ).chainInfo,
              price,
              isFetching: null,
              error: null,
            };
            tokensByChainId[ChainIdEnum.Oraichain] = {
              tokens: [
                ...(tokensByChainId[ChainIdEnum.Oraichain]?.tokens || []),
                infoToken,
              ],
              totalBalance: (
                tokensByChainId[ChainIdEnum.Oraichain]?.totalBalance ||
                initPrice
              ).add(price),
            };
          }
        }
      });
    } catch (error) {
      console.error("Error fetching CW20 balance:", error);
    }
  };

  const getBalanceOasis = async (address, chainInfo: ChainInfo) => {
    const nic = getOasisNic(chainInfo.raw.grpc);
    const publicKey = await addressToPublicKey(address);
    const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
    const grpcBalance = parseRpcBalance(account);
    if (grpcBalance) {
      const balance = new CoinPretty(
        chainInfo.stakeCurrency,
        grpcBalance.available
      );
      const price = await priceStore.waitCalculatePrice(balance);
      const infoToken = {
        token: balance,
        chainInfo,
        price,
        isFetching: null,
        error: null,
      };
      tokensByChainId[chainInfo.chainId] = {
        tokens: [
          ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
          infoToken,
        ],
        totalBalance: (
          tokensByChainId[chainInfo.chainId]?.totalBalance || initPrice
        ).add(price),
      };
    }
  };

  const getBalanceErc20 = async (address, chainInfo: ChainInfo) => {
    const multicall = new Multicall({
      nodeUrl: getRpcByChainId(chainInfo, chainInfo.chainId),
      multicallCustomContractAddress: null,
      chainId: Number(chainInfo.chainId),
    });
    const tokensErc20 = chainInfo.currencies.filter(
      (item) => new DenomHelper(item.coinMinimalDenom).type !== "native"
    );
    const input = tokensErc20.map((token) => ({
      reference: token.coinDenom,
      contractAddress: new DenomHelper(token.coinMinimalDenom).contractAddress,
      abi: ERC20__factory.abi,
      calls: [
        {
          reference: token.coinDenom,
          methodName: "balanceOf(address)",
          methodParameters: [address],
        },
      ],
    }));

    const results: ContractCallResults = await multicall.call(input as any);
    tokensErc20.forEach((token) => {
      const amount =
        results.results[token.coinDenom].callsReturnContext[0].returnValues[0]
          .hex;
      const balance = new CoinPretty(token, Number(amount));
      const price = priceStore.calculatePrice(balance);
      const infoToken = {
        token: balance,
        chainInfo,
        price,
        isFetching: null,
        error: null,
      };
      tokensByChainId[chainInfo.chainId] = {
        tokens: [
          ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
          infoToken,
        ],
        totalBalance: (
          tokensByChainId[chainInfo.chainId]?.totalBalance || initPrice
        ).add(price),
      };
    });
  };
  return {
    totalPriceBalance,
    dataTokens,
  };
};
