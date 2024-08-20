import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import {
  AppState,
  AppStateStatus,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { usePrevious } from "../../hooks";
import { useTheme } from "@src/themes/theme-provider";
import { useFocusEffect } from "@react-navigation/native";
import { ChainInfoWithEmbed, ChainUpdaterService } from "@owallet/background";
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
import { TokensCardAll } from "./components/tokens-card-all";
import { AccountBoxAll } from "./components/account-box-new";

import { EarningCardNew } from "./components/earning-card-new";
import { InjectedProviderUrl } from "../web/config";
import {
  initPrice,
  useMultipleAssets,
} from "@src/screens/home/hooks/use-multiple-assets";
import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
} from "@owallet/unit";
import {
  chainInfos,
  getTokensFromNetwork,
  network,
  oraichainNetwork,
  TokenItemType,
} from "@oraichain/oraidex-common";
import { useCoinGeckoPrices, useLoadTokens } from "@owallet/hooks";
import { debounce, flatten } from "lodash";
import { fetchWithCache, showToast } from "@src/utils/helper";

import { MainTabHome } from "./components";
import { sha256 } from "sha.js";
import { Mixpanel } from "mixpanel-react-native";
import { tracking } from "@src/utils/tracking";
import { ChainInfoInner } from "@owallet/stores";
import Web3 from "web3";
import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { ViewToken } from "@src/stores/huge-queries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AddressBtcType } from "@owallet/types";

const mixpanel = globalThis.mixpanel as Mixpanel;
export const HomeScreen: FunctionComponent = observer((props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshDate, setRefreshDate] = React.useState(Date.now());
  const { colors } = useTheme();

  const styles = styling(colors);
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    browserStore,
    appInitStore,
    keyRingStore,
    hugeQueriesStore,
    universalSwapStore,
  } = useStore();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  // const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } =
  //   useMultipleAssets(
  //     accountStore,
  //     priceStore,
  //     hugeQueriesStore,
  //     chainStore.current.chainId,
  //     appInitStore.getInitApp.isAllNetworks,
  //     appInitStore,
  //     refreshing,
  //     accountOrai.bech32Address
  //   );
  const [isPending, startTransition] = useTransition();
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountKawaiiCosmos = accountStore.getAccount(ChainIdEnum.KawaiiCosmos);
  const currentChain = chainStore.current;
  const currentChainId = currentChain?.chainId;
  const account = accountStore.getAccount(chainStore.current.chainId);

  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses,
    false
  );
  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(
    chainStoreIsInitializing,
    true
  );

  useEffect(() => {
    tracking("Home Screen");
    InteractionManager.runAfterInteractions(() => {
      fetch(InjectedProviderUrl)
        .then((res) => {
          return res.text();
        })
        .then((res) => {
          browserStore.update_inject(res);
        })
        .catch((err) => console.log(err));
    });
  }, []);

  const checkAndUpdateChainInfo = useCallback(() => {
    if (!chainStoreIsInitializing) {
      (async () => {
        const result = await ChainUpdaterService.checkChainUpdate(currentChain);

        // TODO: Add the modal for explicit chain update.
        if (result.slient) {
          chainStore.tryUpdateChain(currentChainId);
        }
      })();
    }
  }, [chainStore, chainStoreIsInitializing, currentChain, currentChainId]);

  useEffect(() => {
    const appStateHandler = (state: AppStateStatus) => {
      if (state === "active") {
        checkAndUpdateChainInfo();
      }
    };
    const subscription = AppState.addEventListener("change", appStateHandler);
    return () => {
      subscription.remove();
    };
  }, [checkAndUpdateChainInfo]);

  useFocusEffect(
    useCallback(() => {
      if (
        (chainStoreIsInitializing !== previousChainStoreIsInitializing &&
          !chainStoreIsInitializing) ||
        currentChainId !== previousChainId
      ) {
        checkAndUpdateChainInfo();
      }
    }, [
      chainStoreIsInitializing,
      previousChainStoreIsInitializing,
      currentChainId,
      previousChainId,
      checkAndUpdateChainInfo,
    ])
  );
  useEffect(() => {
    if (
      appInitStore.getChainInfos?.length <= 0 ||
      !appInitStore.getChainInfos
    ) {
      appInitStore.updateChainInfos(chainInfos);
    }
  }, []);
  useEffect(() => {
    onRefresh();
  }, [address, chainStore.current.chainId]);

  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const onRefresh = async () => {
    try {
      const queries = queriesStore.get(chainStore.current.chainId);
      // Because the components share the states related to the queries,
      // fetching new query responses here would make query responses on all other components also refresh.
      if (chainStore.current.networkType === "bitcoin") {
        await queries.bitcoin.queryBitcoinBalance
          .getQueryBalance(account.bech32Address)
          .waitFreshResponse();
        return;
      } else {
        await Promise.all([
          priceStore.waitFreshResponse(),
          ...queries.queryBalances
            .getQueryBech32Address(address)
            .balances.map((bal) => {
              return bal.waitFreshResponse();
            }),
        ]);
      }
      if (
        accountOrai.bech32Address &&
        accountEth.evmosHexAddress &&
        accountTron.evmosHexAddress &&
        accountKawaiiCosmos.bech32Address
      ) {
        const customChainInfos = appInitStore.getChainInfos ?? chainInfos;
        const currentDate = Date.now();
        const differenceInMilliseconds = Math.abs(currentDate - refreshDate);
        const differenceInSeconds = differenceInMilliseconds / 1000;
        let timeoutId: NodeJS.Timeout;
        if (differenceInSeconds > 10) {
          universalSwapStore.setLoaded(false);
          onFetchAmount(customChainInfos);
        } else {
          console.log("The dates are 10 seconds or less apart.");
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
      setRefreshDate(Date.now());
    }
  };
  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async (
    params: { orai?: string; eth?: string; tron?: string; kwt?: string },
    customChainInfos
  ) => {
    const { orai, eth, tron, kwt } = params;

    let loadTokenParams = {};
    try {
      const cwStargate = {
        account: accountOrai,
        chainId: ChainIdEnum.Oraichain,
        rpc: oraichainNetwork.rpc,
      };

      // other chains, oraichain
      const otherChainTokens = flatten(
        customChainInfos
          .filter((chainInfo) => chainInfo.chainId !== "Oraichain")
          .map(getTokensFromNetwork)
      );
      const oraichainTokens: TokenItemType[] =
        getTokensFromNetwork(oraichainNetwork);

      const tokens = [otherChainTokens, oraichainTokens];
      const flattenTokens = flatten(tokens);

      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: orai ?? accountOrai.bech32Address,
        metamaskAddress: eth ?? null,
        kwtAddress: kwt ?? accountKawaiiCosmos.bech32Address,
        tronAddress: tron ?? null,
        cwStargate,
        tokenReload:
          universalSwapStore?.getTokenReload?.length > 0
            ? universalSwapStore.getTokenReload
            : null,
        customChainInfos: flattenTokens,
      };

      loadTokenAmounts(loadTokenParams);
      universalSwapStore.clearTokenReload();
    } catch (error) {
      console.log("error loadTokenAmounts", error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: "danger",
      });
    }
  };
  useEffect(() => {
    universalSwapStore.setLoaded(false);
  }, [accountOrai.bech32Address]);

  const onFetchAmount = (customChainInfos) => {
    let timeoutId;
    if (accountOrai.isNanoLedger) {
      if (Object.keys(keyRingStore.keyRingLedgerAddresses)?.length > 0) {
        timeoutId = setTimeout(() => {
          handleFetchAmounts(
            {
              orai: accountOrai.bech32Address,
              eth: keyRingStore.keyRingLedgerAddresses.eth ?? null,
              tron: keyRingStore.keyRingLedgerAddresses.trx ?? null,
              kwt: accountKawaiiCosmos.bech32Address,
            },
            customChainInfos
          );
        }, 800);
      }
    } else if (
      accountOrai.bech32Address &&
      accountEth.evmosHexAddress &&
      accountTron.evmosHexAddress &&
      accountKawaiiCosmos.bech32Address
    ) {
      timeoutId = setTimeout(() => {
        handleFetchAmounts(
          {
            orai: accountOrai.bech32Address,
            eth: accountEth.evmosHexAddress,
            tron: getBase58Address(accountTron.evmosHexAddress),
            kwt: accountKawaiiCosmos.bech32Address,
          },
          customChainInfos
        );
      }, 1000);
    }

    return timeoutId;
  };

  useEffect(() => {
    if (appInitStore.getChainInfos) {
      let timeoutId;
      InteractionManager.runAfterInteractions(() => {
        startTransition(() => {
          timeoutId = onFetchAmount(appInitStore.getChainInfos);
        });
      });
      // Clean up the timeout if the component unmounts or the dependency changes
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [accountOrai.bech32Address, appInitStore.getChainInfos]);

  const { data: prices } = useCoinGeckoPrices();

  useEffect(() => {
    appInitStore.updatePrices(prices);
  }, [prices]);

  let pendingUpdates: ViewToken[] = [];
  const [dataBalances, setDataBalances] = useState<ViewToken[]>([]);
  // Debounced function to apply pending updates
  const applyPendingUpdates = debounce(() => {
    if (pendingUpdates.length > 0) {
      setDataBalances((prev) => {
        // Create a Map to hold unique balances by coinMinimalDenom
        const balanceMap = new Map<string, ViewToken>();

        // Add existing balances to the map
        prev.forEach((item) => {
          balanceMap.set(
            `${item.chainInfo.chainId}-${
              item.typeAddress || item.token.currency.coinMinimalDenom
            }`,
            item
          );
        });

        // Add new balances to the map (overwriting duplicates)
        pendingUpdates.forEach((item) => {
          balanceMap.set(
            `${item.chainInfo.chainId}-${
              item.typeAddress || item.token.currency.coinMinimalDenom
            }`,
            item
          );
        });
        const updatedBalances = Array.from(balanceMap.values());

        // Convert the map values back to an array for the state
        return updatedBalances;
      });

      pendingUpdates = [];
    }
  }, 50);
  const cacheDataAsync = async (cacheKey: string, data: ViewToken[]) => {
    try {
      const dataHandled = data.map((item) => ({
        token: {
          currency: item.token.currency,
          balance: item.token.toCoin().amount,
        },
        chainId: item.chainInfo.chainId,
        typeAddress: item.typeAddress || "",
      }));
      await AsyncStorage.setItem(
        `cachedDataBalances-${cacheKey}`,
        JSON.stringify(dataHandled)
      );
    } catch (e) {
      console.error("Failed to save data to cache", e);
    }
  };
  const loadCachedData = async (cacheKey: string) => {
    // InteractionManager.runAfterInteractions(async () => {
    try {
      const cachedData = await AsyncStorage.getItem(
        `cachedDataBalances-${cacheKey}`
      );
      if (cachedData) {
        const dataBalances: any[] = JSON.parse(cachedData);
        const balances = dataBalances.map((item) => {
          const token = new CoinPretty(
            item.token.currency,
            new Dec(item.token.balance)
          );
          return {
            chainInfo: chainStore.getChain(item.chainId),
            isFetching: false,
            error: null,
            token,
            price: priceStore.calculatePrice(token),
            typeAddress: item.typeAddress || "",
          };
        });
        setDataBalances(balances);
      }
    } catch (e) {
      console.error("Failed to load data from cache", e);
    }
    // });
  };

  // Function to add new balances to the pending updates
  const updateDataBalances = (newBalances: ViewToken[]) => {
    pendingUpdates = [...pendingUpdates, ...newBalances];
    applyPendingUpdates();
  };

  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    let balances = dataBalances;
    for (const bal of balances) {
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
  const sortByPrice = (a: ViewToken, b: ViewToken) => {
    const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? new Dec(0);
    const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? new Dec(0);

    if (aPrice.equals(bPrice)) {
      return 0;
    } else if (aPrice.gt(bPrice)) {
      return -1;
    } else {
      return 1;
    }
  };
  const fetchAllBalances = async () => {
    setDataBalances([]); // Clear existing balances

    // Track the number of ongoing operations
    let pendingOperations = 0;

    // Function to handle balance fetches
    const handleFetch = async (
      fetchFunction,
      address: string,
      chainInfo: ChainInfoInner<ChainInfoWithEmbed>,
      typeAddress?: AddressBtcType
    ) => {
      pendingOperations++;
      try {
        if (chainInfo.chainId === ChainIdEnum.Bitcoin) {
          await fetchFunction(address, chainInfo, typeAddress);
        } else {
          await fetchFunction(address, chainInfo);
        }
      } catch (error) {
        console.error(
          `Error fetching balance for ${chainInfo.chainId}:`,
          error
        );
      } finally {
        pendingOperations--;
        if (pendingOperations === 0 || pendingOperations === 1) {
          setRefreshing(false);
          setDataBalances((prev) => {
            const dataSorted = prev.sort(sortByPrice);
            cacheDataAsync(accountOrai.bech32Address, dataSorted);
            return dataSorted;
          });
        }
      }
    };

    for (const chainInfo of chainStore.chainInfosInUI.filter(
      (chainInfo) => !chainInfo.chainName?.toLowerCase()?.includes("test")
    )) {
      const address = accountStore
        .getAccount(chainInfo.chainId)
        .getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);
      if (!address) {
        console.log(address);
        continue;
      }

      switch (chainInfo.networkType) {
        case "cosmos":
          if (chainInfo.chainId === ChainIdEnum.Oraichain) {
            handleFetch(getBalanceCW20Oraichain, address, chainInfo);
          }
          handleFetch(getBalanceNativeCosmos, address, chainInfo);
          break;
        case "evm":
          handleFetch(getBalanceNativeEvm, address, chainInfo);
          if (
            chainInfo.chainId === ChainIdEnum.BNBChain ||
            chainInfo.chainId === ChainIdEnum.Ethereum
          ) {
            handleFetch(getBalancesErc20, address, chainInfo);
          } else if (chainInfo.chainId === ChainIdEnum.TRON) {
            handleFetch(getBalancessTrc20, address, chainInfo);
          }
          break;
        case "bitcoin":
          const legacyAddress = accountStore.getAccount(
            ChainIdEnum.Bitcoin
          ).legacyAddress;
          console.log(legacyAddress, "legacyAddress");
          handleFetch(getBalanceBtc, address, chainInfo, AddressBtcType.Bech32);
          if (legacyAddress) {
            handleFetch(
              getBalanceBtc,
              legacyAddress,
              chainInfo,
              AddressBtcType.Legacy
            );
          }
          break;
      }
    }
    const isFirst = await AsyncStorage.getItem("isFirst");
    if (!isFirst) {
      await AsyncStorage.setItem("isFirst", "true");
      setTimeout(() => {
        fetchAllBalances();
      }, 3000);
    }
  };
  useEffect(() => {
    loadCachedData(accountOrai.bech32Address);

    fetchAllBalances();
    return () => {};
  }, [accountOrai.bech32Address]);
  const getBalanceBtc = async (
    address,
    chainInfo: ChainInfoInner<ChainInfoWithEmbed>,
    type: AddressBtcType
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
            typeAddress: type,
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
      const contractWeth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

      const res = await API.getAllBalancesEvm({ address, network });

      //Filter err res weth from tatumjs// NOT support weth on Ethereum
      const balances =
        res?.result?.filter(
          (item) => item.tokenAddress?.toLowerCase() !== contractWeth
        ) || [];
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

      if (newCurrencies.length > 0) {
        chainInfo.addCurrencies(...newCurrencies);
      }
      // console.log(newCurrencies, "newCurrencies");

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

  const availableTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of dataBalances) {
      if (bal.price) {
        const price = priceStore.calculatePrice(bal.token, "usd");
        if (price) {
          if (!result) {
            result = price;
          } else {
            result = result.add(price);
          }
        }
      }
    }
    return result;
  }, [dataBalances, priceStore]);

  useEffect(() => {
    if (!availableTotalPriceEmbedOnlyUSD || !accountOrai.bech32Address) return;
    const hashedAddress = new sha256()
      .update(accountOrai.bech32Address)
      .digest("hex");

    const amount = new IntPretty(availableTotalPriceEmbedOnlyUSD || "0")
      .maxDecimals(2)
      .shrink(true)
      .trim(true)
      .locale(false)
      .inequalitySymbol(true);
    const logEvent = {
      userId: hashedAddress,
      totalPrice: amount?.toString() || "0",
      currency: "usd",
    };
    if (mixpanel) {
      mixpanel.track("OWallet - Assets Managements", logEvent);
    }
    return () => {};
  }, [accountOrai.bech32Address, availableTotalPriceEmbedOnlyUSD]);
  const availableTotalPriceByChain = useMemo(() => {
    let result: PricePretty | undefined;
    let balances = dataBalances.filter(
      (token) => token.chainInfo.chainId === chainStore.current.chainId
    );
    for (const bal of balances) {
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

  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            onRefresh();
            fetchAllBalances();
          }}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.containerStyle}
      ref={scrollViewRef}
    >
      <AccountBoxAll
        isLoading={false}
        totalBalanceByChain={(
          availableTotalPriceByChain || initPrice
        )?.toString()}
        totalPriceBalance={(availableTotalPrice || initPrice)?.toString()}
      />
      <EarningCardNew />
      <MainTabHome
        dataTokens={
          appInitStore.getInitApp.isAllNetworks
            ? dataBalances
            : dataBalances.filter(
                (item) => item.chainInfo.chainId === chainStore.current.chainId
              )
        }
      />
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerStyle: {
      paddingBottom: 12,
      backgroundColor: colors["neutral-surface-bg"],
      paddingTop: 16,
    },
    containerEarnStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
    },
  });
