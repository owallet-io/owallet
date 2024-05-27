import { observer } from "mobx-react-lite";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import {
  addressToPublicKey,
  ChainIdEnum,
  CWStargate,
  DenomHelper,
  EmbedChainInfos,
  getOasisNic,
  getRpcByChainId,
  parseRpcBalance,
} from "@owallet/common";
import React, { useEffect, useState } from "react";
import {
  ERC20__factory,
  network,
  oraichainNetwork,
} from "@oraichain/oraidex-common";
import { useStore } from "@src/stores";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import axios from "axios";
import { FlatList, InteractionManager, Text, View } from "react-native";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";
import { AppCurrency, ChainInfo } from "@owallet/types";
import { ContractCallResults, Multicall } from "@oraichain/ethereum-multicall";
import OWFlatList from "@src/components/page/ow-flat-list";
import { ViewToken } from "@src/stores/huge-queries";
import { EmptyTx } from "@src/screens/transactions/components/empty-tx";
import { OwLoading } from "@src/components/owallet-loading/ow-loading";
import Web3 from "web3";

export const TestScreen = observer(() => {
  const {
    accountStore,
    priceStore,
    hugeQueriesStore,
    chainStore,
    keyRingStore,
  } = useStore();

  const allChainMap = hugeQueriesStore.getAllChainMap;
  const initPriceBalance = new PricePretty(
    {
      currency: "usd",
      symbol: "$",
      maxDecimals: 2,
      locale: "en-US",
    },
    new Dec("0")
  );
  const [dataTokens, setDataTokens] = useState<ViewToken[]>();
  const [totalPriceBalance, setTotalPriceBalance] =
    useState<PricePretty>(initPriceBalance);
  const allChain = Array.from(hugeQueriesStore.getAllChainMap.values());
  console.log(allChain, "allChain");
  const fiat = priceStore.defaultVsCurrency;
  //

  const fiatCurrency = priceStore.getFiatCurrency(fiat);
  if (!fiatCurrency) {
    return undefined;
  }
  const tokens: ViewToken[] = [];
  let totalBalance: PricePretty = new PricePretty(fiatCurrency, new Dec("0"));

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      init();
    });
  }, []);
  const init = async () => {
    try {
      console.log("start init");

      const allBalance = allChain.map(async ({ address, chainInfo }, index) => {
        if (chainInfo.networkType === "cosmos") {
          if (chainInfo.chainId == ChainIdEnum.Oraichain) {
            return Promise.all([
              getBalanceCW20Oraichain(),
              getBalanceNativeCosmos(address, chainInfo),
            ]);
          }
          return getBalanceNativeCosmos(address, chainInfo);
        } else if (chainInfo.networkType === "evm") {
          if (chainInfo.chainId === ChainIdEnum.Oasis) {
            return getBalanceOasis(address, chainInfo);
          }
          return Promise.all([
            getBalanceNativeEvm(address, chainInfo),
            getBalanceErc20(address, chainInfo),
          ]);
        } else if (chainInfo.networkType === "bitcoin") {
          return getBalanceBtc(address, chainInfo);
        }
      });

      //@ts-ignore
      const allData = await Promise.allSettled([...allBalance]);
    } catch (e) {
      console.log(e, "e22");
    } finally {
      setDataTokens(tokens);
      console.log(totalBalance.toString(), "totalBalance");
      console.log(totalPriceBalance.toString(), "totalPriceBalance");
      setTotalPriceBalance(totalBalance);
      // setDataTokens([...mergedMaps.values()]);
      // console.log([...mergedMaps.values()], 'mergedMaps');
    }
  };
  const getBalanceNativeEvm = async (address, chainInfo: ChainInfo) => {
    const web3 = new Web3(getRpcByChainId(chainInfo, chainInfo.chainId));
    const ethBalance = await web3.eth.getBalance(address);
    if (!ethBalance) return;
    const balance = new CoinPretty(chainInfo.stakeCurrency, Number(ethBalance));
    const price = await priceStore.calculatePrice(balance);
    totalBalance = totalBalance.add(price);
    tokens.push({
      price,
      token: balance,
      isFetching: null,
      error: null,
      chainInfo,
    });
  };
  const getBalanceBtc = async (address, chainInfo: ChainInfo) => {
    const client = axios.create({
      baseURL: chainInfo.rest,
    });
    const url = `/address/${address}/utxo`;
    const { data } = await client.get(url);
    if (!data) return;
    const initialValue = 0;
    const totalBtc = data.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.value;
    }, initialValue);
    const balance = new CoinPretty(chainInfo.stakeCurrency, totalBtc);

    const price = await priceStore.waitCalculatePrice(balance);
    totalBalance = totalBalance.add(price);
    tokens.push({
      token: balance,
      chainInfo,
      price,
      isFetching: false,
      error: null,
    });
  };

  const getBalanceNativeCosmos = async (address, chainInfo: ChainInfo) => {
    const mergedMaps = chainInfo.currencyMap;
    const client = axios.create({
      baseURL: chainInfo.rest,
    });
    const url = `/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
    const { data } = await client.get(url);
    data.balances.map(async ({ denom, amount }, index) => {
      const token = mergedMaps.get(denom) as AppCurrency;
      if (!token) {
        // console.log(hasToken, 'faile test');
      } else {
        const balance = new CoinPretty(token, amount);
        const price = await priceStore.waitCalculatePrice(balance);
        totalBalance = totalBalance.add(price);
        tokens.push({
          token: balance,
          chainInfo,
          price,
          isFetching: false,
          error: null,
        });
      }
    });
    return tokens;
  };
  const getBalanceCW20Oraichain = async () => {
    const mergedMaps = allChainMap.get(ChainIdEnum.Oraichain).chainInfo
      .currencyMap;
    try {
      const data = toBinary({
        balance: { address: allChainMap.get(ChainIdEnum.Oraichain).address },
      });
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
      const tokensCw20 = allChainMap
        .get(ChainIdEnum.Oraichain)
        .chainInfo.currencies.filter((item, index) => {
          const { contractAddress } = new DenomHelper(item.coinMinimalDenom);
          if (contractAddress) return true;
          return false;
        });
      const multicall = new MulticallQueryClient(client, network.multicall);
      const res = await multicall.aggregate({
        queries: tokensCw20.map((t) => ({
          address: new DenomHelper(t.coinMinimalDenom).contractAddress,
          data,
        })),
      });

      return tokensCw20.map(async (t, ind) => {
        if (!res.return_data[ind].success) {
          return [t.coinDenom, 0];
        }
        const balanceRes = fromBinary(
          res.return_data[ind].data
        ) as OraiswapTokenTypes.BalanceResponse;
        const amount = balanceRes.balance;
        const token = mergedMaps.get(t.coinMinimalDenom);
        if (!token) {
          console.log(token, "faile test2");
        } else {
          const balance = new CoinPretty(token, amount);
          const price = await priceStore.waitCalculatePrice(balance);
          totalBalance = totalBalance.add(price);
          tokens.push({
            token: balance,
            chainInfo: allChainMap.get(ChainIdEnum.Oraichain).chainInfo,
            price,
            isFetching: false,
            error: null,
          });
        }
        return mergedMaps;
      });
    } catch (e) {
      console.log(e, "Error getBalanceCW20Oraichain");
      return Promise.resolve(true);
    }
  };
  const getBalanceOasis = async (address, chainInfo: ChainIxnfo) => {
    const nic = getOasisNic(chainInfo.raw.grpc);
    const publicKey = await addressToPublicKey(address);
    const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
    const grpcBalance = parseRpcBalance(account);
    if (!grpcBalance) return;
    const balance = new CoinPretty(
      chainInfo.stakeCurrency,
      grpcBalance.available
    );
    const price = await priceStore.waitCalculatePrice(balance);
    totalBalance = totalBalance.add(price);
    tokens.push({
      chainInfo,
      token: balance,
      price,
      isFetching: false,
      error: null,
    });
  };
  const getBalanceErc20 = async (address, chainInfo: ChainInfo) => {
    const multicall = new Multicall({
      nodeUrl: getRpcByChainId(chainInfo, chainInfo.chainId),
      multicallCustomContractAddress: null,
      chainId: Number(chainInfo.chainId),
    });
    const tokensErc20 = chainInfo.currencies.filter(
      (item, index) => new DenomHelper(item.coinMinimalDenom).type !== "native"
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
    tokensErc20.map(async (token) => {
      const amount =
        results.results[token.coinDenom].callsReturnContext[0].returnValues[0]
          .hex;
      const balance = new CoinPretty(token, Number(amount));
      const price = await priceStore.waitCalculatePrice(balance);
      console.log(price, "price new ");
      totalBalance = totalBalance.add(price);
      tokens.push({
        token: balance,
        chainInfo,
        error: null,
        isFetching: null,
        price: price,
      });
    });
  };
  return (
    <View>
      {/*{dataTokens &&*/}
      {/*  dataTokens.map((item, index) => {*/}
      {/*    return (*/}
      {/*      <Text key={item.coinMinimalDenom}>*/}
      {/*        {item.coinDenom} -{' '}*/}
      {/*        {new CoinPretty(*/}
      {/*          {*/}
      {/*            ...item*/}
      {/*          },*/}
      {/*          item.amount*/}
      {/*        )*/}
      {/*          .trim(true)*/}
      {/*          .toString()}*/}
      {/*      </Text>*/}
      {/*    );*/}
      {/*  })}*/}
      <Text>TOTAL BALANCE: {totalPriceBalance.toString()}</Text>

      <FlatList
        data={dataTokens}
        renderItem={({ item, index }) => (
          <Text key={index.toString()}>
            {item.token.trim(true).maxDecimals(4).toString()} -
            {item.chainInfo.chainName} - {item.price?.toString()}
          </Text>
        )}
      />
    </View>
  );
});
