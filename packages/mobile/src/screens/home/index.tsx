import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { AccountCard } from "./account-card";
import {
  AppState,
  AppStateStatus,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useStore } from "../../stores";
import { EarningCard } from "./earning-card";
import { observer } from "mobx-react-lite";
import { TokensCard } from "./tokens-card";
import { usePrevious } from "../../hooks";
import { BIP44Selectable } from "./bip44-selectable";
import { useTheme } from "@src/themes/theme-provider";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ChainUpdaterService } from "@owallet/background";
import { AccountCardEVM } from "./account-card-evm";
import { DashboardCard } from "./dashboard";
import { UndelegationsCard } from "../stake/dashboard/undelegations-card";
import { TronTokensCard } from "./tron-tokens-card";
import { AccountCardBitcoin } from "./account-card-bitcoin";
import { TokensBitcoinCard } from "./tokens-bitcoin-card";
import { TRON_ID } from "@owallet/common";
import { InjectedProviderUrl } from "../web/config";
import { InteractionManager } from "react-native";

export const HomeScreen: FunctionComponent = observer((props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshDate, setRefreshDate] = React.useState(Date.now());
  const { colors } = useTheme();

  const styles = styling(colors);
  const { chainStore, accountStore, queriesStore, priceStore, browserStore } =
    useStore();

  const scrollViewRef = useRef<ScrollView | null>(null);

  const currentChain = chainStore.current;
  const currentChainId = currentChain?.chainId;
  const account = accountStore.getAccount(chainStore.current.chainId);
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
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0 });
    }
  }, [chainStore.current.chainId]);

  useEffect(() => {
    onRefresh();
    return () => {};
  }, []);

  const onRefresh = React.useCallback(async () => {
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.
    if (chainStore.current.networkType === "bitcoin") {
      await queries.bitcoin.queryBitcoinBalance
        .getQueryBalance(account.bech32Address)
        .waitFreshResponse();
      setRefreshing(false);
      setRefreshDate(Date.now());
      return;
    } else {
      await Promise.all([
        priceStore.waitFreshResponse(),
        ...queries.queryBalances
          .getQueryBech32Address(account.bech32Address)
          .balances.map((bal) => {
            return bal.waitFreshResponse();
          }),
        queries.cosmos.queryRewards
          .getQueryBech32Address(account.bech32Address)
          .waitFreshResponse(),
        queries.cosmos.queryDelegations
          .getQueryBech32Address(account.bech32Address)
          .waitFreshResponse(),
        queries.cosmos.queryUnbondingDelegations
          .getQueryBech32Address(account.bech32Address)
          .waitFreshResponse(),
      ]);
    }

    setRefreshing(false);
    setRefreshDate(Date.now());
  }, [account.bech32Address, chainStore.current.chainId]);
  const renderAccountCard = (() => {
    if (chainStore.current.networkType === "bitcoin") {
      return <AccountCardBitcoin containerStyle={styles.containerStyle} />;
    } else if (chainStore.current.networkType === "evm") {
      return <AccountCardEVM containerStyle={styles.containerStyle} />;
    }
    return <AccountCard containerStyle={styles.containerStyle} />;
  })();
  const renderTokenCard = useMemo(() => {
    if (chainStore.current.networkType === "bitcoin") {
      return <TokensBitcoinCard refreshDate={refreshDate} />;
    } else if (chainStore.current.chainId === TRON_ID) {
      return <TronTokensCard />;
    }
    return <TokensCard refreshDate={refreshDate} />;
  }, [chainStore.current.networkType, chainStore.current.chainId]);
  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      // backgroundColor={colors['background']}
      ref={scrollViewRef}
    >
      <BIP44Selectable />
      {renderAccountCard}
      <DashboardCard />
      {renderTokenCard}
      {chainStore.current.networkType === "cosmos" ? (
        <UndelegationsCard />
      ) : null}
      {chainStore.current.networkType === "cosmos" ? (
        <EarningCard containerStyle={styles.containerEarnStyle} />
      ) : null}
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerStyle: {
      paddingBottom: 12,
      backgroundColor: colors["background-box"],
    },
    containerEarnStyle: {
      backgroundColor: colors["background-box"],
    },
  });
