import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";
import {
  addressToPublicKey,
  ChainIdEnum,
  CWStargate,
  DenomHelper,
  FiatCurrencies,
  getBase58Address,
  getEvmAddress,
  getOasisNic,
  getRpcByChainId,
  MapChainIdToNetwork,
  parseRpcBalance,
  timeoutBtc,
  withTimeout,
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
  ViewTokenData,
} from "@src/stores/huge-queries";
import { AddressBtcType, AppCurrency, ChainInfo } from "@owallet/types";
import {
  AccountStore,
  AccountWithAll,
  ChainInfoInner,
  CoinGeckoPriceStore,
} from "@owallet/stores";
import { AppInit } from "@src/stores/app_init";
import { delay } from "@src/utils/helper";
import { API } from "@src/common/api";
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
  isLoading?: boolean;
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
  const coinIds = new Map<string, boolean>();
  if (!fiatCurrency) return;

  const tokensByChainId: Record<ChainIdEnum, ViewTokenData> = {};

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      init();
    });
  }, [bech32Address, priceStore.defaultVsCurrency]);
  useEffect(() => {
    if (!isRefreshing) return;
    InteractionManager.runAfterInteractions(() => {
      init();
    });
  }, [isRefreshing]);
  const pushTokenQueue = async (
    token: AppCurrency,
    amount: string | number,
    chainInfo: ChainInfo,
    type?: string
  ) => {
    const balance = new CoinPretty(token, amount);
    coinIds.set(token?.coinGeckoId, true);
    const price = token?.coinGeckoId
      ? priceStore.calculatePrice(balance)
      : initPrice;
    const rawChainInfo = {
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      chainImage: chainInfo.stakeCurrency.coinImageUrl,
    };
    tokensByChainId[chainInfo.chainId] = {
      tokens: [
        ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
        {
          token: {
            currency: balance.currency,
            amount: amount,
          },
          chainInfo: rawChainInfo,
          // price: price.toDec().toString(),
          type: type
            ? type === AddressBtcType.Bech32
              ? "Segwit"
              : "Legacy"
            : null,
        },
      ],
      // totalBalance: '0'
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
  };
  const fetchAllBalancesEvm = async (chains) => {
    const allBalanceChains = chains.map((chain, index) => {
      const { address, chainInfo } = hugeQueriesStore.getAllChainMap.get(chain);
      switch (chain) {
        case ChainIdEnum.BNBChain:
        case ChainIdEnum.Ethereum:
          return withTimeout(getBalancessErc20(address, chainInfo));
        case ChainIdEnum.TRON:
          return withTimeout(getBalancessTrc20(address, chainInfo));
      }
    });
    return Promise.allSettled(allBalanceChains);
  };
  const init = async () => {
    setIsLoading(true);
    try {
      const allChain = Array.from(hugeQueriesStore.getAllChainMap.values());
      const chainIdsEvm = [
        ChainIdEnum.Ethereum,
        ChainIdEnum.BNBChain,
        ChainIdEnum.TRON,
      ];
      await fetchAllBalancesEvm(chainIdsEvm);
      const allBalancePromises = allChain.map(
        async ({ address, chainInfo }) => {
          switch (chainInfo.networkType) {
            case "cosmos":
              return chainInfo.chainId === ChainIdEnum.Oraichain
                ? Promise.allSettled([
                    withTimeout(getBalanceCW20Oraichain()),
                    withTimeout(getBalanceNativeCosmos(address, chainInfo)),
                  ])
                : withTimeout(getBalanceNativeCosmos(address, chainInfo));
            case "evm":
              return chainInfo.chainId === ChainIdEnum.Oasis
                ? withTimeout(getBalanceOasis(address, chainInfo))
                : Promise.allSettled([
                    withTimeout(getBalanceNativeEvm(address, chainInfo)),
                    withTimeout(getBalanceErc20(address, chainInfo)),
                  ]);
          }
        }
      );

      await Promise.allSettled(allBalancePromises);
      setIsLoading(false);
      const currencies = FiatCurrencies.map(({ currency }) => currency);
      priceStore.updateURL(Array.from(coinIds.keys()), currencies, true);
      await delay(300);
      let overallTotalBalance = "0";
      let allTokens: ViewRawToken[] = [];
      // Loop through each key in the data object
      for (const chain in tokensByChainId) {
        if (
          tokensByChainId.hasOwnProperty(chain) &&
          !tokensByChainId[chain]?.tokens?.[0].chainInfo?.chainName
            ?.toLowerCase()
            ?.includes("test")
        ) {
          let totalBalance = initPrice;
          const tokensData = await Promise.all(
            tokensByChainId[chain].tokens.map(async (infoToken) => {
              const { token } = infoToken;
              const balance = new CoinPretty(token.currency, token.amount);
              const price = token?.currency?.coinGeckoId
                ? await priceStore.waitCalculatePrice(balance)
                : initPrice;
              totalBalance = totalBalance.add(price);
              return { ...infoToken, price: price.toDec().toString() };
            })
          );
          tokensByChainId[chain].totalBalance = totalBalance.toDec().toString();
          tokensByChainId[chain].tokens = tokensData;
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
          allTokens = allTokens.concat(tokensData);
        }
      }

      appInit.updateMultipleAssets({
        dataTokens: allTokens,
        totalPriceBalance: overallTotalBalance,
        dataTokensByChain: tokensByChainId,
      });
      const btcAddress = accountStore.getAccount(
        ChainIdEnum.Bitcoin
      ).legacyAddress;
      const { address, chainInfo } = hugeQueriesStore.getAllChainMap.get(
        ChainIdEnum.Bitcoin
      );
      await Promise.allSettled([
        withTimeout(
          getBalanceBtc(address, chainInfo, AddressBtcType.Bech32),
          timeoutBtc
        ),
        withTimeout(
          getBalanceBtc(btcAddress, chainInfo, AddressBtcType.Legacy),
          timeoutBtc
        ),
      ]);

      if (
        tokensByChainId.hasOwnProperty(ChainIdEnum.Bitcoin) &&
        !tokensByChainId[ChainIdEnum.Bitcoin]?.tokens?.[0].chainInfo?.chainName
          ?.toLowerCase()
          ?.includes("test")
      ) {
        let totalBalance = initPrice;
        const tokensData = await Promise.all(
          tokensByChainId[ChainIdEnum.Bitcoin].tokens.map(async (infoToken) => {
            const { token } = infoToken;
            const balance = new CoinPretty(token.currency, token.amount);
            const price = token?.currency?.coinGeckoId
              ? await priceStore.waitCalculatePrice(balance)
              : initPrice;
            totalBalance = totalBalance.add(price);
            return { ...infoToken, price: price.toDec().toString() };
          })
        );
        tokensByChainId[ChainIdEnum.Bitcoin].totalBalance = totalBalance
          .toDec()
          .toString();
        tokensByChainId[ChainIdEnum.Bitcoin].tokens = tokensData;
        // Add the total balance for each chain to the overall total balance
        overallTotalBalance = new PricePretty(fiatCurrency, overallTotalBalance)
          .add(
            new PricePretty(
              fiatCurrency,
              tokensByChainId[ChainIdEnum.Bitcoin].totalBalance
            )
          )
          .toDec()
          .toString();
        // Concatenate the tokens for each chain to the allTokens array
        allTokens = allTokens.concat(tokensData);
      }
      appInit.updateMultipleAssets({
        dataTokens: allTokens,
        totalPriceBalance: overallTotalBalance,
        dataTokensByChain: tokensByChainId,
      });
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const getBalancessErc20 = async (address, chainInfo: ChainInfoInner) => {
    try {
      const res = await API.getAllBalancesEvm({
        address,
        network: MapChainIdToNetwork[chainInfo.chainId],
      });
      if (((res && res.result) || []).length <= 0) return;
      const tokenAddresses = res.result
        .map((item, index) => {
          return `${MapChainIdToNetwork[chainInfo.chainId]}%2B${
            item.tokenAddress
          }`;
        })
        .join(",");
      const tokenInfos = await API.getMultipleTokenInfo({ tokenAddresses });
      tokenInfos.forEach((tokeninfo, index) => {
        const token = chainInfo.currencies.find(
          (item, index) =>
            item.coinDenom?.toUpperCase() === tokeninfo.abbr?.toUpperCase()
        );
        if (!token) {
          const infoToken: any = [
            {
              coinImageUrl: tokeninfo.imgUrl,
              coinDenom: tokeninfo.abbr,
              coinGeckoId: tokeninfo.coingeckoId,
              coinDecimals: tokeninfo.decimal,
              coinMinimalDenom: `erc20:${tokeninfo.contractAddress}:${tokeninfo.name}`,
              contractAddress: tokeninfo.contractAddress,
            },
          ];
          chainInfo.addCurrencies(...infoToken);
        }
      });
    } catch (e) {
      console.error(e);
    }
  };
  const getBalancessTrc20 = async (address, chainInfo: ChainInfoInner) => {
    try {
      const res = await API.getAllBalancesEvm({
        address: getBase58Address(address),
        network: MapChainIdToNetwork[chainInfo.chainId],
      });
      if (!res?.trc20) return;
      const tokenAddresses = res?.trc20
        .map((item, index) => {
          return `${MapChainIdToNetwork[chainInfo.chainId]}%2B${
            Object.keys(item)[0]
          }`;
        })
        .join(",");
      const tokenInfos = await API.getMultipleTokenInfo({ tokenAddresses });
      tokenInfos.forEach((tokeninfo, index) => {
        const token = chainInfo.currencies.find(
          (item, index) =>
            item.coinDenom?.toUpperCase() === tokeninfo.abbr?.toUpperCase()
        );
        if (!token) {
          const infoToken: any = [
            {
              coinImageUrl: tokeninfo.imgUrl,
              coinDenom: tokeninfo.abbr,
              coinGeckoId: tokeninfo.coingeckoId,
              coinDecimals: tokeninfo.decimal,
              coinMinimalDenom: `erc20:${getEvmAddress(
                tokeninfo.contractAddress
              )}:${tokeninfo.name}`,
              contractAddress: tokeninfo.contractAddress,
            },
          ];
          chainInfo.addCurrencies(...infoToken);
        }
      });
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
      pushTokenQueue(chainInfo.stakeCurrency, Number(ethBalance), chainInfo);
    }
  };

  const getBalanceBtc = async (
    address,
    chainInfo: ChainInfoInner,
    type: AddressBtcType
  ) => {
    const client = axios.create({ baseURL: chainInfo.rest });
    const { data } = await client.get(`/address/${address}/utxo`);
    if (data) {
      const totalBtc = data.reduce((acc, curr) => acc + curr.value, 0);
      pushTokenQueue(chainInfo.stakeCurrency, totalBtc, chainInfo, type);
    }
  };

  const getBalanceNativeCosmos = async (address, chainInfo: ChainInfoInner) => {
    const res = await API.getAllBalancesNativeCosmos({
      address: address,
      baseUrl: chainInfo.rest,
    });
    const mergedMaps = chainInfo.currencyMap;
    const allTokensAddress = [];
    const balanceObj = res.balances.reduce((obj, item) => {
      obj[item.denom] = item.amount;
      return obj;
    }, {});
    res.balances.forEach(({ denom, amount }) => {
      const token = mergedMaps.get(denom);
      if (token) {
        pushTokenQueue(token, amount, chainInfo);
      } else {
        if (!MapChainIdToNetwork[chainInfo.chainId]) return;
        const str = `${
          MapChainIdToNetwork[chainInfo.chainId]
        }%2B${new URLSearchParams(denom).toString().replace("=", "")}`;
        allTokensAddress.push(str);
      }
    });
    if (allTokensAddress.length === 0) return;
    const tokenInfos = await API.getMultipleTokenInfo({
      tokenAddresses: allTokensAddress.join(","),
    });
    tokenInfos.forEach((tokeninfo, index) => {
      const token = chainInfo.currencies.find(
        (item, index) =>
          item.coinDenom?.toUpperCase() === tokeninfo.abbr?.toUpperCase()
      );
      if (!token) {
        const infoToken: any = [
          {
            coinImageUrl: tokeninfo.imgUrl,
            coinDenom: tokeninfo.abbr,
            coinGeckoId: tokeninfo.coingeckoId,
            coinDecimals: tokeninfo.decimal,
            coinMinimalDenom: tokeninfo.denom,
          },
        ];
        pushTokenQueue(infoToken[0], balanceObj[tokeninfo.denom], chainInfo);
        chainInfo.addCurrencies(...infoToken);
      }
    });
  };

  const getBalanceCW20Oraichain = async () => {
    const oraiNetwork = hugeQueriesStore.getAllChainMap.get(
      ChainIdEnum.Oraichain
    );
    const chainInfo = oraiNetwork.chainInfo;
    const mergedMaps = chainInfo.currencyMap;
    const data = toBinary({
      balance: {
        address: oraiNetwork.address,
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
            pushTokenQueue(token, balanceRes.balance, chainInfo);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching CW20 balance:", error);
    }
  };

  const getBalanceOasis = async (address, chainInfo: ChainInfoInner) => {
    const nic = getOasisNic(chainInfo.raw.grpc);
    const publicKey = await addressToPublicKey(address);
    const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
    const grpcBalance = parseRpcBalance(account);
    if (grpcBalance) {
      pushTokenQueue(chainInfo.stakeCurrency, grpcBalance.available, chainInfo);
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
      pushTokenQueue(token, Number(amount), chainInfo);
    });
  };
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
