import { observer } from "mobx-react-lite";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import {
  ChainIdEnum,
  CWStargate,
  DenomHelper,
  EmbedChainInfos,
} from "@owallet/common";
import { useEffect, useState } from "react";
import {
  ERC20__factory,
  network,
  oraichainNetwork,
} from "@oraichain/oraidex-common";
import { useStore } from "@src/stores";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import axios from "axios";
import { InteractionManager, Text, View } from "react-native";
import { CoinPretty } from "@owallet/unit";
import { AppCurrency } from "@owallet/types";
import { ContractCallResults, Multicall } from "@oraichain/ethereum-multicall";

export const TestScreen = observer(() => {
  const { accountStore, chainStore, keyRingStore } = useStore();

  const addressOrai = "orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2";
  const addressOsmos = "osmo1hvr9d72r5um9lvt0rpkd4r75vrsqtw6y86jn8t";
  const addressCosmos = "cosmos1hvr9d72r5um9lvt0rpkd4r75vrsqtw6y0ppr3e";
  const addressInj = "inj133lq4pqjdxspcz4n388glv70z59ffeuh3ktnaj";
  const addressNoble = "noble1hvr9d72r5um9lvt0rpkd4r75vrsqtw6y8z5tfh";
  const addressKawai = "oraie133lq4pqjdxspcz4n388glv70z59ffeuh89sq4z";
  const addressNeutaro = "neutaro1hvr9d72r5um9lvt0rpkd4r75vrsqtw6ywxyjru";
  // const oraiChain = chainStore.getChain(ChainIdEnum.Oraichain);
  // const injChain = chainStore.getChain(ChainIdEnum.Injective);
  // const cosmosChain = chainStore.getChain(ChainIdEnum.CosmosHub);
  // const nobleChain = chainStore.getChain(ChainIdEnum.Noble);
  // const osmosChain = chainStore.getChain(ChainIdEnum.Osmosis);
  // const neutaroChain = chainStore.getChain(ChainIdEnum.Neutaro);
  // const kawaiiChain = chainStore.getChain(ChainIdEnum.KawaiiCosmos);
  const tokens = EmbedChainInfos[0].currencies;
  const tokensBnb = EmbedChainInfos.find(
    (item, index) => item.chainId === "0x38"
  ).currencies;
  const [dataTokens, setDataTokens] = useState<any>();
  const currencyMap = (currencies): Map<string, AppCurrency> => {
    const result: Map<string, AppCurrency> = new Map();
    for (const currency of currencies) {
      result.set(currency.coinMinimalDenom, currency);
    }
    return result;
  };
  const mergedMaps = new Map([
    ...currencyMap(EmbedChainInfos[0].currencies),
    ...currencyMap(EmbedChainInfos[3].currencies),
    ...currencyMap(EmbedChainInfos[8].currencies),
    ...currencyMap(EmbedChainInfos[7].currencies),
    ...currencyMap(EmbedChainInfos[10].currencies),
    ...currencyMap(EmbedChainInfos[5].currencies),
    ...currencyMap(EmbedChainInfos[1].currencies),
  ]);

  const arrAddress = [
    {
      address: addressOrai,
      lcd: EmbedChainInfos[0].rest,
    },
    {
      address: addressOsmos,
      lcd: EmbedChainInfos[8].rest,
    },
    {
      address: addressCosmos,
      lcd: EmbedChainInfos[7].rest,
    },
    {
      address: addressInj,
      lcd: EmbedChainInfos[3].rest,
    },
    {
      address: addressNoble,
      lcd: EmbedChainInfos[10].rest,
    },
    {
      address: addressKawai,
      lcd: EmbedChainInfos[5].rest,
    },
    {
      address: addressNeutaro,
      lcd: EmbedChainInfos[1].rest,
    },
  ];
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      init();
    });
  }, []);
  const init = async () => {
    try {
      console.log("start init");

      const allBalance = arrAddress.map(({ address, lcd }, index) =>
        getBalanceNativeCosmos(address, lcd)
      );
      //@ts-ignore
      const allData = await Promise.allSettled([
        getBalanceCW20Oraichain(),
        getBalanceErc20(),
        ...allBalance,
      ]);
      console.log(allData, "allData");
      // const allDataClean = allData.filter((item, index) => item.status === 'fulfilled');
    } catch (e) {
      console.log(e, "e");
    } finally {
      setDataTokens([...mergedMaps.values()]);
      console.log([...mergedMaps.values()], "mergedMaps");
    }
  };
  const getBalanceNativeCosmos = async (address, lcd) => {
    const client = axios.create({
      baseURL: lcd,
    });
    const url = `/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
    const { data } = await client.get(url);
    console.log(data.balances, "balances");
    data.balances.map(({ denom, amount }, index) => {
      const hasToken = mergedMaps.get(denom);
      if (!hasToken) {
        console.log(hasToken, "faile test");
      } else {
        mergedMaps.set(hasToken.coinMinimalDenom, {
          ...hasToken,
          amount,
        } as any);
      }
    });
    return data.balances;
  };
  const getBalanceCW20Oraichain = async () => {
    try {
      console.log("start");
      const data = toBinary({
        balance: { address: addressOrai },
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
      const tokensCw20 = tokens.filter((item, index) => {
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
        const hasToken = mergedMaps.get(t.coinMinimalDenom);
        if (!hasToken) {
          console.log(hasToken, "faile test");
        } else {
          mergedMaps.set(t.coinMinimalDenom, { ...t, amount } as any);
        }
        return;
      });
    } catch (e) {
      console.log(e, "E");
    }
  };
  const getBalanceErc20 = async () => {
    const multicall = new Multicall({
      nodeUrl: "https://bsc-dataseed1.ninicoin.io",
      multicallCustomContractAddress: null,
      chainId: Number("0x38"),
    });
    const tokensBnbErc20 = tokensBnb.filter(
      (item, index) => new DenomHelper(item.coinMinimalDenom).type !== "native"
    );
    const input = tokensBnbErc20.map((token) => ({
      reference: token.coinDenom,
      contractAddress: new DenomHelper(token.coinMinimalDenom).contractAddress,
      abi: ERC20__factory.abi,
      calls: [
        {
          reference: token.coinDenom,
          methodName: "balanceOf(address)",
          methodParameters: ["0x8c7E0A841269a01c0Ab389Ce8Fb3Cf150A94E797"],
        },
      ],
    }));

    const results: ContractCallResults = await multicall.call(input as any);
    console.log(results, "results");
  };
  return (
    <View>
      {dataTokens &&
        dataTokens.map((item, index) => {
          return (
            <Text key={item.coinMinimalDenom}>
              {item.coinDenom} -{" "}
              {new CoinPretty(
                {
                  ...item,
                },
                item.amount
              )
                .trim(true)
                .toString()}
            </Text>
          );
        })}
    </View>
  );
});
