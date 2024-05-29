import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";
import {
  addressToPublicKey,
  ChainIdEnum,
  CWStargate,
  DenomHelper,
  getOasisNic,
  getRpcByChainId,
  parseRpcBalance,
} from "@owallet/common";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import Web3 from "web3";
import axios from "axios";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import { ContractCallResults, Multicall } from "@oraichain/ethereum-multicall";
import {
  ERC20__factory,
  network,
  oraichainNetwork,
} from "@oraichain/oraidex-common";
import {
  HugeQueriesStore,
  ViewRawToken,
  ViewToken,
  ViewTokenData,
} from "@src/stores/huge-queries";
import { ChainInfo } from "@owallet/types";
import {
  AccountStore,
  AccountWithAll,
  CoinGeckoPriceStore,
  TokensStore,
} from "@owallet/stores";
import { AppInit } from "@src/stores/app_init";
import {
  fetchRetry,
  mapChainIdToChainEndpoint,
  urlTxHistory,
} from "@src/common/constants";
import { MapChainIdToNetwork } from "@src/utils/helper";

export const initPrice = new PricePretty(
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  new Dec("0")
);

export interface IMultipleAsset {
  totalPriceBalance: string;
  dataTokens: ViewRawToken[];
  dataTokensByChain: Record<ChainIdEnum, ViewTokenData>;
}

export const useMultipleAssets = (
  accountStore: AccountStore<AccountWithAll>,
  priceStore: CoinGeckoPriceStore,
  hugeQueriesStore: HugeQueriesStore,
  chainId: string,
  isAllNetwork: boolean,
  appInit: AppInit,
  isRefreshing: boolean,
  bech32Address
): IMultipleAsset => {
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const [isLoading, setIsLoading] = useState(false);
  if (!fiatCurrency) return;

  const tokensByChainId: Record<ChainIdEnum, ViewTokenData> = {};

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      init();
    });
  }, [bech32Address]);
  useEffect(() => {
    if (!isRefreshing) return;
    InteractionManager.runAfterInteractions(() => {
      init();
    });
  }, [isRefreshing]);

  const init = async () => {
    setIsLoading(true);
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
              if (ChainIdEnum.BNBChain || ChainIdEnum.Ethereum) {
                await getBalancessErc20(address, chainInfo);
              }

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
      let overallTotalBalance = "0";
      let allTokens: ViewRawToken[] = [];
      // Loop through each key in the data object
      for (const chain in tokensByChainId) {
        if (tokensByChainId.hasOwnProperty(chain)) {
          // Add the total balance for each chain to the overall total balance
          overallTotalBalance = new PricePretty(
            fiatCurrency,
            overallTotalBalance
          )
            .add(
              new PricePretty(fiatCurrency, tokensByChainId[chain].totalBalance)
            )
            .toDec()
            .toString();
          // Concatenate the tokens for each chain to the allTokens array
          allTokens = allTokens.concat(tokensByChainId[chain].tokens);
        }
      }

      appInit.updateMultipleAssets({
        dataTokens: allTokens,
        totalPriceBalance: overallTotalBalance,
        dataTokensByChain: tokensByChainId,
      });
      console.log("done");
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const getBalancessErc20 = async (address, chainInfo: ChainInfo) => {
    try {
      const url = `https://api.tatum.io/v4/data/balances?chain=${
        mapChainIdToChainEndpoint[chainInfo.chainId]
      }&addresses=${address}&tokenTypes=fungible`;
      const res = await fetchRetry(url, {
        headers: {
          "Content-Type": "application/json",
          "x-cg-pro-api-key": process.env.TATUM_KEY,
        },
      });
      if (!res?.result) return;
      await Promise.all(
        res.result.map(async (item, index) => {
          try {
            const url = `${urlTxHistory}v1/token-info/${
              MapChainIdToNetwork[chainInfo.chainId]
            }/${item.tokenAddress}`;
            const res = await fetchRetry(url);
            if (!res?.data) return;
            const { data } = res;
            const token = chainInfo.currencies.find(
              (item, index) => item.coinGeckoId === data.coingeckoId
            );
            if (!token) {
              const infoToken: any = [
                {
                  coinImageUrl: data.imgUrl,
                  coinDenom: data.abbr,
                  coinGeckoId: data.coingeckoId,
                  coinDecimals: data.decimal,
                  coinMinimalDenom: `erc20:${data.contractAddress}:${data.name}`,
                },
              ];
              chainInfo.addCurrencies(...infoToken);
              console.log(data, "res22");
            }
          } catch (e) {
            console.log(e, "E2");
          }
        })
      );
      console.log(res.result, "resss");
    } catch (e) {
      console.log(e, "e1");
    }
  };
  const sortTokensByPrice = (tokens: ViewRawToken[]) => {
    return tokens.sort((a, b) => Number(b.price) - Number(a.price));
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
      tokensByChainId[chainInfo.chainId] = {
        tokens: [
          ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
          {
            token: {
              currency: balance.currency,
              amount: Number(ethBalance),
            },
            chainInfo: {
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              chainImage: chainInfo.stakeCurrency.coinImageUrl,
            },
            price: price.toDec().toString(),
          },
        ],
        totalBalance: (
          new PricePretty(
            fiatCurrency,
            tokensByChainId[chainInfo.chainId]?.totalBalance
          ) || initPrice
        )
          .add(price)
          .toDec()
          .toString(),
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
      tokensByChainId[chainInfo.chainId] = {
        tokens: [
          ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
          {
            token: {
              currency: balance.currency,
              amount: totalBtc,
            },
            chainInfo: {
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              chainImage: chainInfo.stakeCurrency.coinImageUrl,
            },
            price: price.toDec().toString(),
          },
        ],
        totalBalance: (
          new PricePretty(
            fiatCurrency,
            tokensByChainId[chainInfo.chainId]?.totalBalance
          ) || initPrice
        )
          .add(price)
          .toDec()
          .toString(),
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

        tokensByChainId[chainInfo.chainId] = {
          tokens: [
            ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
            {
              token: {
                currency: balance.currency,
                amount: amount,
              },
              chainInfo: {
                chainId: chainInfo.chainId,
                chainName: chainInfo.chainName,
                chainImage: chainInfo.stakeCurrency.coinImageUrl,
              },
              price: price.toDec().toString(),
            },
          ],
          totalBalance: (
            new PricePretty(
              fiatCurrency,
              tokensByChainId[chainInfo.chainId]?.totalBalance
            ) || initPrice
          )
            .add(price)
            .toDec()
            .toString(),
        };
      }
      // else

      // {
      //   console.log(denom,"denom not token");
      //   const url =`${urlTxHistory}v1/token-info/Oraichain/orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg`;
      //   console.log(url,"url");
      //   const res = await fetchRetry(url);
      //   console.log(res,"Ress");
      // }
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
      const chainInfo = hugeQueriesStore.getAllChainMap.get(
        ChainIdEnum.Oraichain
      ).chainInfo;
      const tokensCw20 = chainInfo.currencies.filter(
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
            tokensByChainId[chainInfo.chainId] = {
              tokens: [
                ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
                {
                  token: {
                    currency: balance.currency,
                    amount: balanceRes.balance,
                  },
                  chainInfo: {
                    chainId: chainInfo.chainId,
                    chainName: chainInfo.chainName,
                    chainImage: chainInfo.stakeCurrency.coinImageUrl,
                  },
                  price: price.toDec().toString(),
                },
              ],
              totalBalance: (
                new PricePretty(
                  fiatCurrency,
                  tokensByChainId[chainInfo.chainId]?.totalBalance
                ) || initPrice
              )
                .add(price)
                .toDec()
                .toString(),
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
      tokensByChainId[chainInfo.chainId] = {
        tokens: [
          ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
          {
            token: {
              currency: balance.currency,
              amount: grpcBalance.available,
            },
            chainInfo: {
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              chainImage: chainInfo.stakeCurrency.coinImageUrl,
            },
            price: price.toDec().toString(),
          },
        ],
        totalBalance: (
          new PricePretty(
            fiatCurrency,
            tokensByChainId[chainInfo.chainId]?.totalBalance
          ) || initPrice
        )
          .add(price)
          .toDec()
          .toString(),
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

      tokensByChainId[chainInfo.chainId] = {
        tokens: [
          ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
          {
            token: {
              currency: balance.currency,
              amount: Number(amount),
            },
            chainInfo: {
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              chainImage: chainInfo.stakeCurrency.coinImageUrl,
            },
            price: price.toDec().toString(),
          },
        ],
        totalBalance: (
          new PricePretty(
            fiatCurrency,
            tokensByChainId[chainInfo.chainId]?.totalBalance
          ) || initPrice
        )
          .add(price)
          .toDec()
          .toString(),
      };
    });
  };
  console.log(
    appInit.getMultipleAssets.dataTokens,
    "appInit.getMultipleAssets.dataTokens"
  );
  return {
    totalPriceBalance: appInit.getMultipleAssets.totalPriceBalance,
    dataTokens: isAllNetwork
      ? sortTokensByPrice([...(appInit.getMultipleAssets.dataTokens || [])])
      : sortTokensByPrice([
          ...(appInit.getMultipleAssets.dataTokensByChain?.[chainId]?.tokens ||
            []),
        ]),
    dataTokensByChain: appInit.getMultipleAssets.dataTokensByChain,
    isLoading: isLoading,
  };
};