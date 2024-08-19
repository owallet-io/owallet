import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { useStore } from "../../stores";
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
  withTimeout,
} from "@owallet/common";
import {
  sortTokensByPrice,
  useMultipleAssets,
} from "../../hooks/use-multiple-assets";

import { StakeView } from "./stake";
import { ChainInfo } from "@owallet/types";
import { ChainInfoInner } from "@owallet/stores";
import { ChainInfoWithEmbed } from "@owallet/background";
import { ViewToken } from "stores/huge-queries";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@owallet/unit";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { network } from "@oraichain/oraidex-common";
import Web3 from "web3";
import { debounce } from "lodash";
export const HomePage = observer(() => {
  // const [refreshing, setRefreshing] = React.useState(false);
  const {
    chainStore,
    hugeQueriesStore,
    accountStore,
    priceStore,
    keyRingStore,
    queriesStore,
  } = useStore();
  const selected = keyRingStore?.multiKeyStoreInfo?.find(
    (keyStore) => keyStore?.selected
  );
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const [dataBalances, setDataBalances] = useState<ViewToken[]>([]);
  const address = accountStore
    .getAccount(chainStore.current.chainId)
    .getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);
  // const debouncedSetDataBalances = useCallback(
  //   debounce((updateFunction) => {
  //     setDataBalances((prev) => updateFunction(prev));
  //     const updateDataBalances = (newBalances: ViewToken[]) => {
  //       pendingUpdates = [...pendingUpdates, ...newBalances];
  //       applyPendingUpdates();
  //     };

  //   }, 300), // 300ms debounce delay
  //   []
  // );
  // Initialize an array to hold pending updates
  let pendingUpdates: ViewToken[] = [];

  // Debounced function to apply pending updates
  const applyPendingUpdates = useCallback(
    debounce(() => {
      if (pendingUpdates.length > 0) {
        setDataBalances((prev) => [...prev, ...pendingUpdates]);
        pendingUpdates = [];
      }
    }, 75),
    []
  ); // Adjust the delay as needed

  // Function to add new balances to the pending updates
  const updateDataBalances = (newBalances: ViewToken[]) => {
    pendingUpdates = [...pendingUpdates, ...newBalances];
    applyPendingUpdates();
  };
  // const updateDataBalances = (newBalances) => {
  //   debouncedSetDataBalances((prev) => [...prev, ...newBalances]);
  // };
  // const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } = useMultipleAssets(
  //   accountStore,
  //   priceStore,
  //   chainStore,
  //   selected,
  //   accountOrai.bech32Address,
  //   hugeQueriesStore
  // );
  // useEffect(() => {
  //   fetchBalance();
  // }, [address]);
  console.log(dataBalances, "dataBalances");
  // const fetchBalance = async () => {
  //   const queries = queriesStore.get(chainStore.current.chainId);
  //   // Because the components share the states related to the queries,
  //   // fetching new query responses here would make query responses on all other components also refresh.
  //   if (chainStore.current.networkType === "bitcoin") {
  //     await queries.bitcoin.queryBitcoinBalance.getQueryBalance(address).waitFreshResponse();

  //     return;
  //   } else {
  //     await Promise.all([
  //       priceStore.waitFreshResponse(),
  //       ...queries.queryBalances.getQueryBech32Address(address).balances.map((bal) => {
  //         return bal.waitFreshResponse();
  //       })
  //     ]);
  //   }
  // };
  // const allBalances = hugeQueriesStore.getAllAddrByChain;
  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of dataBalances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [dataBalances]);
  useEffect(() => {
    setTimeout(() => {
      const allChain = Array.from(hugeQueriesStore.getAllChainMap.values());
      for (const { address, chainInfo } of allChain) {
        if (!address) continue;

        switch (chainInfo.networkType) {
          case "cosmos":
            if (chainInfo.chainId === ChainIdEnum.Oraichain) {
              getBalanceCW20Oraichain(address, chainInfo);
            }
            getBalanceNativeCosmos(address, chainInfo);
            break;
          case "evm":
            getBalanceNativeEvm(address, chainInfo);
            if (
              chainInfo.chainId === ChainIdEnum.BNBChain ||
              chainInfo.chainId === ChainIdEnum.Ethereum
            ) {
              getBalancesErc20(address, chainInfo);
            } else if (chainInfo.chainId === ChainIdEnum.TRON) {
              getBalancessTrc20(address, chainInfo);
            }
            break;
          case "bitcoin":
            const legacyAddress = accountStore.getAccount(
              ChainIdEnum.Bitcoin
            ).legacyAddress;
            getBalanceBtc(address, chainInfo);
            if (!legacyAddress) break;
            getBalanceBtc(legacyAddress, chainInfo);
            break;
          default:
            break;
        }
        console.log(address, "chain");
      }
    }, 500);
    return () => {};
  }, []);
  const getBalanceBtc = async (
    address,
    chainInfo: ChainInfoInner<ChainInfoWithEmbed>
    // type: AddressBtcType
  ) => {
    const data = await API.getBtcBalance({
      address,
      baseUrl: chainInfo.rest,
    });
    if (data) {
      const totalBtc = data.reduce((acc, curr) => acc + curr.value, 0);
      // pushTokenQueue(chainInfo.stakeCurrency, totalBtc, chainInfo, type);
      if (totalBtc) {
        const token = new CoinPretty(chainInfo.stakeCurrency, totalBtc);
        updateDataBalances([
          {
            token,
            price: priceStore.calculatePrice(token),
            chainInfo,
            isFetching: false,
            error: null,
          },
        ]);
      }
    }
  };
  const getBalanceNativeCosmos = async (
    address: string,
    chainInfo: ChainInfoInner<ChainInfoWithEmbed>
  ) => {
    const { balances } = await API.getAllBalancesNativeCosmos({
      address,
      baseUrl: chainInfo.rest,
    });

    const balanceObj = balances.reduce((obj, { denom, amount }) => {
      obj[denom] = amount;
      return obj;
    }, {});

    const allTokensAddress: string[] = [];
    const newDataBalances = [];

    balances.forEach(({ denom, amount }) => {
      const currency = chainInfo.currencyMap.get(denom);

      if (currency) {
        const token = new CoinPretty(currency, amount);
        newDataBalances.push({
          token,
          price: priceStore.calculatePrice(token),
          chainInfo,
          isFetching: false,
          error: null,
        });
      } else if (MapChainIdToNetwork[chainInfo.chainId]) {
        const str = `${
          MapChainIdToNetwork[chainInfo.chainId]
        }%2B${new URLSearchParams(denom).toString().replace("=", "")}`;
        allTokensAddress.push(str);
      }
    });
    updateDataBalances(newDataBalances);

    if (allTokensAddress.length > 0) {
      const tokenInfos = await API.getMultipleTokenInfo({
        tokenAddresses: allTokensAddress.join(","),
      });

      const newCurrencies = tokenInfos
        .map((tokeninfo) => {
          const existingToken = chainInfo.currencies.find(
            (item) =>
              item.coinDenom?.toUpperCase() === tokeninfo.abbr?.toUpperCase()
          );

          if (!existingToken) {
            const infoToken = {
              coinImageUrl: tokeninfo.imgUrl,
              coinDenom: tokeninfo.abbr,
              coinGeckoId: tokeninfo.coingeckoId,
              coinDecimals: tokeninfo.decimal,
              coinMinimalDenom: tokeninfo.denom,
            };

            const token = new CoinPretty(
              infoToken,
              balanceObj[tokeninfo.denom]
            );
            newDataBalances.push({
              token,
              price: priceStore.calculatePrice(token),
              chainInfo,
              isFetching: false,
              error: null,
            });

            return infoToken;
          }
          return null;
        })
        .filter(Boolean);
      updateDataBalances(newDataBalances);

      if (newCurrencies.length > 0) {
        chainInfo.addCurrencies(...newCurrencies);
      }
    }
  };

  const getBalanceCW20Oraichain = async (address, chainInfo) => {
    const data = toBinary({ balance: { address } });

    try {
      const account = accountStore.getAccount(ChainIdEnum.Oraichain);
      const client = await CWStargate.init(
        account,
        ChainIdEnum.Oraichain,
        chainInfo.rpc
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

      const newDataBalances = res.return_data.reduce(
        (acc, { success, data }, index) => {
          if (success) {
            const balanceRes = fromBinary(data);
            const currency = chainInfo.currencyMap.get(
              tokensCw20[index].coinMinimalDenom
            );

            if (currency) {
              const token = new CoinPretty(currency, balanceRes.balance);
              acc.push({
                token,
                price: priceStore.calculatePrice(token),
                chainInfo,
                isFetching: false,
                error: null,
              });
            }
          }
          return acc;
        },
        []
      );
      updateDataBalances(newDataBalances);
    } catch (error) {
      console.error("Error fetching CW20 balance:", error);
    }
  };
  const getBalancesErc20 = async (
    address: string,
    chainInfo: ChainInfoInner<ChainInfoWithEmbed>
  ) => {
    try {
      const network = MapChainIdToNetwork[chainInfo.chainId];

      const res = await API.getAllBalancesEvm({ address, network });

      const balances = res?.result || [];
      if (balances.length === 0) return;

      const tokenAddresses = balances
        .map(({ tokenAddress }) => `${network}%2B${tokenAddress}`)
        .join(",");
      const tokenInfos = await API.getMultipleTokenInfo({ tokenAddresses });

      const existingCurrencies = new Set(
        chainInfo.currencies.map((currency) =>
          currency.coinDenom?.toUpperCase()
        )
      );

      const newCurrencies = tokenInfos
        .filter(
          (tokenInfo, index) =>
            !existingCurrencies.has(tokenInfo.abbr?.toUpperCase()) &&
            tokenInfos.findIndex(
              (c) => c.contractAddress === tokenInfo.contractAddress
            ) === index
        )
        .map((tokenInfo) => ({
          coinImageUrl: tokenInfo.imgUrl,
          coinDenom: tokenInfo.abbr,
          coinGeckoId: tokenInfo.coingeckoId,
          coinDecimals: tokenInfo.decimal,
          coinMinimalDenom: `erc20:${tokenInfo.contractAddress}:${tokenInfo.name}`,
          contractAddress: tokenInfo.contractAddress,
        }));

      if (newCurrencies.length === 0) return;
      // console.log(newCurrencies, "newCurrencies");
      chainInfo.addCurrencies(...newCurrencies);

      const newDataBalances = chainInfo.currencies
        .map((item) => {
          const balance = balances.find(
            (balance) =>
              balance.tokenAddress.toLowerCase() ===
              new DenomHelper(
                item.coinMinimalDenom
              )?.contractAddress.toLowerCase()
          );
          if (!balance) return undefined;
          const token = new CoinPretty(
            item,
            new Dec(balance.balance).mul(
              DecUtils.getTenExponentN(item.coinDecimals)
            )
          );

          return {
            token,
            price: priceStore.calculatePrice(token),
            chainInfo,
            isFetching: false,
            error: null,
          };
        })
        .filter((balance) => balance !== undefined);

      if (newDataBalances.length > 0) {
        updateDataBalances(newDataBalances);
      }
    } catch (error) {
      console.error("Error fetching ERC-20 balances:", error);
    }
  };
  const getBalanceNativeEvm = async (
    address: string,
    chainInfo: ChainInfoInner<ChainInfoWithEmbed>
  ) => {
    try {
      if (chainInfo.chainId === ChainIdEnum.Oasis) {
        getBalanceOasis(address, chainInfo);
        return;
      } else if (chainInfo.chainId === ChainIdEnum.KawaiiEvm) {
        return;
      }
      const web3 = new Web3(getRpcByChainId(chainInfo, chainInfo.chainId));
      const ethBalance = await web3.eth.getBalance(address);
      const token = new CoinPretty(chainInfo.stakeCurrency, ethBalance);
      updateDataBalances([
        {
          token,
          price: priceStore.calculatePrice(token),
          chainInfo,
          isFetching: false,
          error: null,
        },
      ]);
    } catch (error) {
      console.log(error, chainInfo.chainName, "error native evm");
    }
  };
  const getBalancessTrc20 = async (
    address: string,
    chainInfo: ChainInfoInner<ChainInfoWithEmbed>
  ) => {
    try {
      const res = await API.getAllBalancesEvm({
        address: getBase58Address(address),
        network: MapChainIdToNetwork[chainInfo.chainId],
      });
      console.log(res?.trc20, "res?.trc20");
      if (!res?.trc20) return;
      const tokenAddresses = res?.trc20
        .map((item, index) => {
          return `${MapChainIdToNetwork[chainInfo.chainId]}%2B${
            Object.keys(item)[0]
          }`;
        })
        .join(",");
      const tokenInfos = await API.getMultipleTokenInfo({ tokenAddresses });

      const existingCurrencies = new Set(
        chainInfo.currencies.map((currency) =>
          currency.coinDenom?.toUpperCase()
        )
      );

      const newCurrencies = tokenInfos
        .filter(
          (tokenInfo, index) =>
            !existingCurrencies.has(tokenInfo.abbr?.toUpperCase()) &&
            tokenInfos.findIndex(
              (c) => c.contractAddress === tokenInfo.contractAddress
            ) === index
        )
        .map((tokenInfo) => ({
          coinImageUrl: tokenInfo.imgUrl,
          coinDenom: tokenInfo.abbr,
          coinGeckoId: tokenInfo.coingeckoId,
          coinDecimals: tokenInfo.decimal,
          coinMinimalDenom: `erc20:${getEvmAddress(
            tokenInfo.contractAddress
          )}:${tokenInfo.name}`,
          contractAddress: tokenInfo.contractAddress,
        }));
      chainInfo.addCurrencies(...newCurrencies);
      const newDataBalances = chainInfo.currencies
        .map((item) => {
          const contract = res.trc20.find(
            (obj) =>
              Object.keys(obj)[0] ===
              getBase58Address(
                new DenomHelper(item.coinMinimalDenom)?.contractAddress
              )
          );

          if (!contract) return undefined;

          const token = new CoinPretty(
            item,
            Number(Object.values(contract)[0])
          );

          return {
            token,
            price: priceStore.calculatePrice(token),
            chainInfo,
            isFetching: false,
            error: null,
          };
        })
        .filter((balance) => balance !== undefined);

      if (newDataBalances.length > 0) {
        updateDataBalances(newDataBalances);
      }
    } catch (e) {
      console.log(e, "err get Trc20 balances");
    }
  };
  const getBalanceOasis = async (
    address: string,
    chainInfo: ChainInfoInner<ChainInfoWithEmbed>
  ) => {
    const nic = getOasisNic(chainInfo.raw.grpc);
    const publicKey = await addressToPublicKey(address);
    const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
    const grpcBalance = parseRpcBalance(account);
    if (grpcBalance) {
      const token = new CoinPretty(
        chainInfo.stakeCurrency,
        grpcBalance.available
      );
      updateDataBalances([
        {
          token,
          price: priceStore.calculatePrice(token),
          chainInfo,
          isFetching: false,
          error: null,
        },
      ]);
    }
  };
  return (
    <FooterLayout>
      {/* {<p>{availableTotalPrice?.toString()}</p>} */}
      <InfoAccountCard
        isLoading={false}
        totalPrice={availableTotalPrice?.toString()}
      />
      {/*TODO:// need check again Claim reward */}
      {/* <ClaimReward /> */}
      {chainStore.isAllNetwork ||
      chainStore.current.networkType !== "cosmos" ? null : (
        <StakeView />
      )}
      {/* <TokensCard dataTokens={sortTokensByPrice(dataTokens)} /> */}
      {dataBalances &&
        dataBalances.map((item, index) => (
          <div>
            <span>
              {item.token.currency.coinDenom}-{item.chainInfo.chainName}:
              {item.price?.toString()}
            </span>
          </div>
        ))}
    </FooterLayout>
  );
});
