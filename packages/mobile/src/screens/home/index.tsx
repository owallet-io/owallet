import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
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
import { ChainIdEnum } from "@owallet/common";
import { TokensCardAll } from "./tokens-card-all";
import { AccountBoxAll } from "./account-box-new";

import { EarningCardNew } from "./earning-card-new";
import { InjectedProviderUrl } from "../web/config";
import { useMultipleAssets } from "@src/screens/home/hooks/use-multiple-assets";
import { PricePretty } from "@owallet/unit";

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
  } = useStore();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const { totalPriceBalance, dataTokens, dataTokensByChain } =
    useMultipleAssets(
      accountStore,
      priceStore,
      hugeQueriesStore,
      chainStore.current.chainId,
      appInitStore.getInitApp.isAllNetworks,
      appInitStore
    );
  console.log(appInitStore.getMultipleAssets, "appInitStore.getMultipleAssets");
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
    onRefresh();
  }, [address, chainStore.current.chainId]);
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  console.log(chainStore.current.currencies, "chainInfo.currencies3");
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
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
      setRefreshDate(Date.now());
    }
  };

  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.containerStyle}
      ref={scrollViewRef}
    >
      <AccountBoxAll
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
