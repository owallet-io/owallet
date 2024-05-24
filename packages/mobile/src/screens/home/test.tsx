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
import { CoinPretty } from "@owallet/unit";
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

  const [dataTokens, setDataTokens] = useState<ViewToken[]>();

  const allChain = Array.from(hugeQueriesStore.getAllChainMap.values());
  const tokens: ViewToken[] = [];
  const price = priceStore.getPrice(
    chainStore.current.stakeCurrency.coinGeckoId
  );
  // console.log(price, 'price');
  // if (!price)
  //   return (
  //     <OwLoading />
  //   );
  // console.log(data,"daat");
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

      setDataTokens(tokens);
    } catch (e) {
      console.log(e, "e22");
    } finally {
      // setDataTokens([...mergedMaps.values()]);
      // console.log([...mergedMaps.values()], 'mergedMaps');
    }
  };
  const getBalanceNativeEvm = async (address, chainInfo: ChainInfo) => {
    const web3 = new Web3(getRpcByChainId(chainInfo, chainInfo.chainId));
    const ethBalance = await web3.eth.getBalance(address);
    if (!ethBalance) return;
    const balance = new CoinPretty(chainInfo.stakeCurrency, Number(ethBalance));
    tokens.push({
      price: priceStore.calculatePrice(balance),
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
    const totalBalance = data.reduce((accumulator, currentValue) => {
      console.log(accumulator, currentValue, "kk");
      return accumulator + currentValue.value;
    }, initialValue);
    const balance = new CoinPretty(chainInfo.stakeCurrency, totalBalance);
    tokens.push({
      token: balance,
      chainInfo,
      price: chainInfo.stakeCurrency.coinGeckoId
        ? priceStore.calculatePrice(balance)
        : undefined,
      isFetching: false,
      error: null,
    });

    console.log(totalBalance, data, "data");
  };
  const getBalanceNativeCosmos = async (address, chainInfo: ChainInfo) => {
    const mergedMaps = chainInfo.currencyMap;
    const client = axios.create({
      baseURL: chainInfo.rest,
    });
    const url = `/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
    const { data } = await client.get(url);
    data.balances.map(({ denom, amount }, index) => {
      const token = mergedMaps.get(denom) as AppCurrency;
      if (!token) {
        // console.log(hasToken, 'faile test');
      } else {
        const balance = new CoinPretty(token, amount);
        tokens.push({
          token: balance,
          chainInfo,
          price: token.coinGeckoId
            ? priceStore.calculatePrice(balance)
            : undefined,
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

      return tokensCw20.map((t, ind) => {
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
          tokens.push({
            token: balance,
            chainInfo: allChainMap.get(ChainIdEnum.Oraichain).chainInfo,
            price: token.coinGeckoId
              ? priceStore.calculatePrice(balance)
              : undefined,
            isFetching: false,
            error: null,
          });
        }
        return mergedMaps;
      });
    } catch (e) {
      console.log(e, "Error getBalanceCW20Oraichain");
    }
  };
  const getBalanceOasis = async (address, chainInfo: ChainInfo) => {
    const nic = getOasisNic(chainInfo.raw.grpc);
    const publicKey = await addressToPublicKey(address);
    const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
    const grpcBalance = parseRpcBalance(account);
    if (!grpcBalance) return;
    console.log(grpcBalance, "grpcBalance");
    const balance = new CoinPretty(
      chainInfo.stakeCurrency,
      grpcBalance.available
    );
    tokens.push({
      chainInfo,
      token: balance,
      price: priceStore.calculatePrice(balance),
      isFetching: false,
      error: null,
    });
  };
  const getBalanceErc20 = async (address, chainInfo: ChainInfo) => {
    if (chainInfo.chainId === ChainIdEnum.TRON) {
      console.log(
        getRpcByChainId(chainInfo, chainInfo.chainId),
        "getRpcByChainId(chainInfo, chainInfo.chainId)"
      );
    }
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
    tokensErc20.map((token) => {
      const amount =
        results.results[token.coinDenom].callsReturnContext[0].returnValues[0]
          .hex;
      const balance = new CoinPretty(token, Number(amount));
      tokens.push({
        token: balance,
        chainInfo,
        error: null,
        isFetching: null,
        price: priceStore.calculatePrice(balance),
      });
    });
    console.log(results, "results");
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
