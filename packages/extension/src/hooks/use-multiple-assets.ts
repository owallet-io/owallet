// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import {
  addressToPublicKey,
  API,
  ChainIdEnum,
  CWStargate,
  DenomHelper,
  getBase58Address,
  getEvmAddress,
  getOasisNic,
  getRpcByChainId,
  MapChainIdToNetwork,
  parseRpcBalance,
} from "@owallet/common";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@owallet/unit";
import Web3 from "web3";
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
  AddressBtcType,
  AppCurrency,
  ChainInfo,
  IMultipleAsset,
  ViewRawToken,
  ViewTokenData,
} from "@owallet/types";
import {
  AccountStore,
  AccountWithAll,
  CoinGeckoPriceStore,
} from "@owallet/stores";
import { ChainStore } from "../stores";

export const initPrice = new PricePretty(
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  new Dec("0")
);

export const sortTokensByPrice = (tokens: ViewRawToken[]) => {
  return tokens.sort((a, b) => Number(b.price) - Number(a.price));
};
var bech32AddressCache = "";
export const useMultipleAssets = (
  accountStore: AccountStore<AccountWithAll>,
  priceStore: CoinGeckoPriceStore,
  chainStore: ChainStore,
  isRefreshing: boolean,
  bech32Address,
  hugeQueriesStore
): IMultipleAsset => {
  const isAllNetwork = chainStore.isAllNetwork;
  const { chainId } = chainStore.current;
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const [isLoading, setIsLoading] = useState(false);
  const coinIds = new Map<string, boolean>();
  if (!fiatCurrency) return;

  const tokensByChainId:
    | Record<ChainIdEnum | string, ViewTokenData>
    | undefined = {};
  const overallTotalBalance = "0";
  const allTokens: ViewRawToken[] = [];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (bech32AddressCache !== bech32Address) {
      bech32AddressCache = bech32Address;
      setTimeout(() => {
        init();
      }, 1000);
    }
  }, [bech32Address, priceStore.defaultVsCurrency]);
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
    if (!chainInfo.chainName?.toLowerCase().includes("test")) {
      allTokens.push({
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
      });
    }

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
          return getBalancessErc20(address, chainInfo);
        case ChainIdEnum.TRON:
          return getBalancessTrc20(address, chainInfo);
      }
    });
    return Promise.all(allBalanceChains);
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
          if (!address) return;
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
              const btcAddress = accountStore.getAccount(
                ChainIdEnum.Bitcoin
              ).legacyAddress;
              return Promise.all([
                getBalanceBtc(address, chainInfo, AddressBtcType.Bech32),
                getBalanceBtc(btcAddress, chainInfo, AddressBtcType.Legacy),
              ]);
          }
        }
      );

      await Promise.allSettled(allBalancePromises);
      setIsLoading(false);
      chainStore.setMultipleAsset({
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
  const getBalancessErc20 = async (address, chainInfo: ChainInfo) => {
    try {
      const res = await API.getAllBalancesEvm({
        address,
        network: MapChainIdToNetwork[chainInfo.chainId],
      });
      if (((res && res.result) || [])?.length <= 0) return;
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
      console.log(e, "e1");
    }
  };
  const getBalancessTrc20 = async (address, chainInfo: ChainInfo) => {
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

  const getBalanceNativeEvm = async (address, chainInfo: ChainInfo) => {
    const web3 = new Web3(getRpcByChainId(chainInfo, chainInfo.chainId));
    const ethBalance = await web3.eth.getBalance(address);
    if (ethBalance) {
      pushTokenQueue(chainInfo.stakeCurrency, Number(ethBalance), chainInfo);
    }
  };

  const getBalanceBtc = async (
    address,
    chainInfo: ChainInfo,
    type: AddressBtcType
  ) => {
    const data = await API.getBtcBalance({
      address,
      baseUrl: chainInfo.rest,
    });
    if (data) {
      const totalBtc = data.reduce((acc, curr) => acc + curr.value, 0);
      pushTokenQueue(chainInfo.stakeCurrency, totalBtc, chainInfo, type);
    }
  };

  const getBalanceNativeCosmos = async (address, chainInfo: ChainInfo) => {
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
    if (allTokensAddress?.length === 0) return;
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

  const getBalanceOasis = async (address, chainInfo: ChainInfo) => {
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

  const dataTokens = isAllNetwork
    ? [...(chainStore.multipleAssets.dataTokens || [])]
    : [
        ...(chainStore.multipleAssets.dataTokensByChain?.[chainId]?.tokens ||
          []),
      ];

  let totalPrice = initPrice;
  const dataTokensWithPrice = (dataTokens || []).map(
    (item: ViewRawToken, index) => {
      const coinData = new CoinPretty(item.token.currency, item.token.amount);
      const priceData = priceStore.calculatePrice(coinData);
      totalPrice = totalPrice.add(priceData || initPrice);
      return {
        ...item,
        price: priceData?.toDec()?.toString() || initPrice?.toDec()?.toString(),
      };
    }
  );

  return {
    totalPriceBalance: totalPrice?.toDec()?.toString(),
    dataTokens: dataTokensWithPrice,
    dataTokensByChain: chainStore.multipleAssets.dataTokensByChain,
    isLoading: isLoading,
  };
};
