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
  // useEffect(() => {
  //   if (!totalPriceBalance || !accountOrai.bech32Address) return;
  //   const hashedAddress = new sha256().update(accountOrai.bech32Address).digest("hex");

  //   const amount = new IntPretty(totalPriceBalance || "0")
  //     .maxDecimals(2)
  //     .shrink(true)
  //     .trim(true)
  //     .locale(false)
  //     .inequalitySymbol(true);

  //   const logEvent = {
  //     userId: hashedAddress,
  //     totalPrice: amount?.toString() || "0",
  //     currency: priceStore.defaultVsCurrency
  //   };
  //   if (mixpanel) {
  //     mixpanel.track("OWallet - Assets Managements", logEvent);
  //   }
  //   return () => {};
  // }, [totalPriceBalance, accountOrai.bech32Address, priceStore.defaultVsCurrency]);
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
            `${item.chainInfo.chainId}-${item.token.currency.coinMinimalDenom}`,
            item
          );
        });

        // Add new balances to the map (overwriting duplicates)
        pendingUpdates.forEach((item) => {
          balanceMap.set(
            `${item.chainInfo.chainId}-${item.token.currency.coinMinimalDenom}`,
            item
          );
        });

        // Convert the map values back to an array for the state
        return Array.from(balanceMap.values());
      });
      // setDataBalances((prev) => [...prev, ...pendingUpdates]);
      pendingUpdates = [];
    }
  }, 50);

  // Function to add new balances to the pending updates
  const updateDataBalances = (newBalances: ViewToken[]) => {
    pendingUpdates = [...pendingUpdates, ...newBalances];
    applyPendingUpdates();
  };

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

  const fetchAllBalances = () => {
    setDataBalances([]);
    pendingUpdates = [];
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
          console.log(legacyAddress, "legacyAddress");
          getBalanceBtc(address, chainInfo);
          if (!legacyAddress) break;
          getBalanceBtc(legacyAddress, chainInfo);
          break;
      }
    }
  };
  useEffect(() => {
    fetchAllBalances();
    return () => {};
  }, [accountOrai.bech32Address]);
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
      const contractWeth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

      const res = await API.getAllBalancesEvm({ address, network });
      console.log(res, "res");
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
      console.log(tokenInfos, "tokenInfos");
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
  const allBalancesSorted = dataBalances && dataBalances.sort(sortByPrice);
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
  }, [dataBalances, chainStore.current.chainId]);
  const balancesByChain = allBalancesSorted.filter(
    (item) => item.chainInfo.chainId === chainStore.current.chainId
  );
  // const legacyAddress = accountStore.getAccount(ChainIdEnum.Bitcoin).legacyAddress;
  // useEffect(() => {
  //   fetchDataTest(legacyAddress);
  // }, [legacyAddress]);
  // // const fetchDataTest = async (legacyAddress) => {
  // //   try {
  // //     const start = Date.now();
  // //     const res = await fetchWithCache(
  // //       `https://tx-history-backend.oraidex.io/v1/token-info/by-addresses?tokenAddresses=bsc-mainnet%2B0xd5da8318ce7ca005e8f5285db0e750ca9256586e,bsc-mainnet%2B0x55d398326f99059ff775485246999027b3197955,bsc-mainnet%2B0xa325ad6d9c92b55a3fc5ad7e412b1518f96441c0,bsc-mainnet%2B0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d,bsc-mainnet%2B0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c,bsc-mainnet%2B0x00d7c7b0326b3f0c7ba225036eec29ff9eda353d,bsc-mainnet%2B0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82,bsc-mainnet%2B0x111111111117dc0aa78b770fa6a738034120c302,bsc-mainnet%2B0xaec945e04baf28b135fa7c640f624f8d90f1c3a6,bsc-mainnet%2B0x3ae45a25f4f73d0157a0c0e3e47f8e7ffa16e99e,bsc-mainnet%2B0x25d887ce7a35172c62febfd67a1856f20faebb00,bsc-mainnet%2B0x6fe3d0f096fc932a905accd1eb1783f6e4cec717,bsc-mainnet%2B0xcd6a51559254030ca30c2fb2cbdf5c492e8caf9c,bsc-mainnet%2B0xe8e8d862589ad17948abdc6eb99779c6ece9cfdd,bsc-mainnet%2B0x6d989357b4ab8684ff5eca0aeeae797b4f10ebf9,bsc-mainnet%2B0x02472aed8bc2f5a92a415f26d7de2bac9da81f82,bsc-mainnet%2B0x7c2dfffb9927f448e64a2d2f0216ad199c5ef128,bsc-mainnet%2B0x5f7a1a4dafd0718caee1184caa4862543f75edb1,bsc-mainnet%2B0x71753d0586ea6b979dfccbb492a45e611e0e0ad6`
  // //     );
  // //     console.log(res, "Res Btc");
  // //     const end = Date.now() - start;
  // //     console.log(end, "timer taker");
  // //   } catch (error) {
  // //     console.error("Failed to load data:", error);
  // //   } finally {
  // //   }
  // // };

  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            onRefresh();
            fetchAllBalances();
            // fetchDataTest(legacyAddress);
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
            ? allBalancesSorted
            : balancesByChain
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
