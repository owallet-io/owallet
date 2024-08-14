import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { ChainUpdaterService } from "@owallet/background";
import {
  ChainIdEnum,
  DenomHelper,
  getBase58Address,
  MapChainIdToNetwork,
} from "@owallet/common";
import { TokensCardAll } from "./components/tokens-card-all";
import { AccountBoxAll } from "./components/account-box-new";

import { EarningCardNew } from "./components/earning-card-new";
import { InjectedProviderUrl } from "../web/config";
// import { useMultipleAssets } from "@src/screens/home/hooks/use-multiple-assets";
import { IntPretty, PricePretty } from "@owallet/unit";
import {
  chainInfos,
  getTokensFromNetwork,
  oraichainNetwork,
  TokenItemType,
} from "@oraichain/oraidex-common";
import { useCoinGeckoPrices, useLoadTokens } from "@owallet/hooks";
import { flatten } from "lodash";
import { showToast } from "@src/utils/helper";

import { MainTabHome } from "./components";
import { sha256 } from "sha.js";
import { Mixpanel } from "mixpanel-react-native";
import { tracking } from "@src/utils/tracking";
import { API } from "@src/common/api";

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
    tokensStore,
  } = useStore();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const [isPending, startTransition] = useTransition();
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountKawaiiCosmos = accountStore.getAccount(ChainIdEnum.KawaiiCosmos);
  const currentChain = chainStore.current;
  const currentChainId = currentChain?.chainId;
  const account = accountStore.getAccount(chainStore.current.chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
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
  useEffect(() => {
    if (tokensStore.isInitialized) {
      fetchAllErc20();
    }
    return () => {};
  }, [tokensStore.isInitialized, address]);

  const fetchAllErc20 = async () => {
    const chainInfo = chainStore.getChain(ChainIdEnum.BNBChain);
    // Attempt to register the denom in the returned response.
    // If it's already registered anyway, it's okay because the method below doesn't do anything.
    // Better to set it as an array all at once to reduce computed.
    if (!MapChainIdToNetwork[chainInfo.chainId]) return;
    const response = await API.getAllBalancesEvm({
      address: address,
      network: MapChainIdToNetwork[chainInfo.chainId],
    });

    if (!response.result) return;

    const allTokensAddress = response.result
      .filter(
        (token) =>
          !!chainInfo.currencies.find(
            (coin) =>
              new DenomHelper(
                coin.coinMinimalDenom
              ).contractAddress?.toLowerCase() !==
              token.tokenAddress?.toLowerCase()
          ) && MapChainIdToNetwork[chainInfo.chainId]
      )
      .map((coin) => {
        const str = `${
          MapChainIdToNetwork[chainInfo.chainId]
        }%2B${new URLSearchParams(coin.tokenAddress)
          .toString()
          .replace("=", "")}`;
        return str;
      });

    if (allTokensAddress?.length === 0) return;

    const tokenInfos = await API.getMultipleTokenInfo({
      tokenAddresses: allTokensAddress.join(","),
    });
    const infoTokensFilter = tokenInfos.filter(
      (item, index, self) =>
        index ===
          self.findIndex((t) => t.contractAddress === item.contractAddress) &&
        chainInfo.currencies.findIndex(
          (item2) =>
            new DenomHelper(
              item2.coinMinimalDenom
            ).contractAddress.toLowerCase() ===
            item.contractAddress.toLowerCase()
        ) < 0
    );
    const infoTokens = tokenInfos
      .filter(
        (item, index, self) =>
          index ===
            self.findIndex((t) => t.contractAddress === item.contractAddress) &&
          chainInfo.currencies.findIndex(
            (item2) =>
              new DenomHelper(
                item2.coinMinimalDenom
              ).contractAddress.toLowerCase() ===
              item.contractAddress.toLowerCase()
          ) < 0
      )
      .map((tokeninfo) => {
        const infoToken = {
          coinImageUrl: tokeninfo.imgUrl,
          coinDenom: tokeninfo.abbr,
          coinGeckoId: tokeninfo.coingeckoId,
          coinDecimals: tokeninfo.decimal,
          coinMinimalDenom: `erc20:${tokeninfo.contractAddress}:${tokeninfo.name}`,
          contractAddress: tokeninfo.contractAddress,
          type: "erc20",
        };
        // tokensStore.addToken(ChainIdEnum.BNBChain, infoToken);
        return infoToken;
      });
    console.log(infoTokensFilter, "infoTokensFilter");
    //@ts-ignore
    // chainInfo.addCurrencies(...infoTokens);
  };

  const onRefresh = async () => {
    try {
      if (chainStore.current.networkType === "bitcoin") {
        const queries = queriesStore.get(chainStore.current.chainId);
        await queries.bitcoin.queryBitcoinBalance
          .getQueryBalance(account.bech32Address)
          .waitFreshResponse();
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

  const allBalances = hugeQueriesStore.getAllBalances(true);
  const availableTotalPriceEmbedOnlyUSD = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
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
  }, [hugeQueriesStore.allKnownBalances, priceStore]);

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
  }, [
    accountOrai.bech32Address,
    priceStore.defaultVsCurrency,
    availableTotalPriceEmbedOnlyUSD,
  ]);
  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    let balances = hugeQueriesStore.allKnownBalances;
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
  }, [hugeQueriesStore.allKnownBalances, chainStore.current.chainId]);
  const availableTotalPriceByChain = useMemo(() => {
    let result: PricePretty | undefined;
    let balances = hugeQueriesStore.allKnownBalances.filter(
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
  }, [hugeQueriesStore.allKnownBalances, chainStore.current.chainId]);
  const balancesByChain = hugeQueriesStore.filterBalanceTokensByChain(
    allBalances,
    chainStore.current.chainId
  );
  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            onRefresh();
          }}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.containerStyle}
      ref={scrollViewRef}
    >
      <AccountBoxAll
        isLoading={false}
        totalBalanceByChain={availableTotalPriceByChain?.toString()}
        totalPriceBalance={availableTotalPrice?.toString()}
      />
      <EarningCardNew />
      <MainTabHome
        dataTokens={
          appInitStore.getInitApp.isAllNetworks ? allBalances : balancesByChain
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
