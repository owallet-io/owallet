import React, {
  FunctionComponent,
  useCallback,
  useEffect,
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
} from "react-native";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { usePrevious } from "../../hooks";
import { useTheme } from "@src/themes/theme-provider";
import { useFocusEffect } from "@react-navigation/native";
import { ChainUpdaterService } from "@owallet/background";
import { ChainIdEnum, getBase58Address } from "@owallet/common";
import { TokensCardAll } from "./tokens-card-all";
import { AccountBoxAll } from "./account-box-new";

import { EarningCardNew } from "./earning-card-new";
import { InjectedProviderUrl } from "../web/config";
import { useMultipleAssets } from "@src/screens/home/hooks/use-multiple-assets";
import { PricePretty } from "@owallet/unit";
import {
  chainInfos,
  getTokensFromNetwork,
  oraichainNetwork,
  TokenItemType,
} from "@oraichain/oraidex-common";
import { useCoinGeckoPrices, useLoadTokens } from "@owallet/hooks";
import { flatten } from "lodash";
import { showToast } from "@src/utils/helper";

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
  const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } =
    useMultipleAssets(
      accountStore,
      priceStore,
      hugeQueriesStore,
      chainStore.current.chainId,
      appInitStore.getInitApp.isAllNetworks,
      appInitStore,
      refreshing,
      accountOrai.bech32Address
    );
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
      if (Object.keys(keyRingStore.keyRingLedgerAddresses).length > 0) {
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
  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            onRefresh();
            setTimeout(() => {
              setRefreshing(false);
            }, 500);
          }}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.containerStyle}
      ref={scrollViewRef}
    >
      <AccountBoxAll
        isLoading={isLoading}
        totalBalanceByChain={new PricePretty(
          fiatCurrency,
          dataTokensByChain?.[chainStore.current.chainId]?.totalBalance
        ).toString()}
        totalPriceBalance={new PricePretty(
          fiatCurrency,
          totalPriceBalance
        ).toString()}
      />
      {chainStore.current.networkType === "cosmos" &&
      !appInitStore.getInitApp.isAllNetworks ? (
        <EarningCardNew />
      ) : null}
      {/*(*/}
      {/*<EarningCardNew defaultChain={ChainIdEnum.Oraichain} />*/}
      {/*)*/}
      <TokensCardAll dataTokens={dataTokens} />
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
