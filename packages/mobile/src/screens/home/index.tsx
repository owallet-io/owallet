import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { AccountCard } from "./account-card";
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
import { BIP44Selectable } from "./bip44-selectable";
import { useTheme } from "@src/themes/theme-provider";
import { useFocusEffect } from "@react-navigation/native";
import { ChainUpdaterService } from "@owallet/background";
import { AccountCardEVM } from "./account-card-evm";
import { DashboardCard } from "./dashboard";
import { AccountCardBitcoin } from "./account-card-bitcoin";
import { getBase58Address, ChainIdEnum } from "@owallet/common";
import { TokensCardAll } from "./tokens-card-all";
import { AccountBoxAll } from "./account-box-new";
import { oraichainNetwork } from "@oraichain/oraidex-common";
import { useCoinGeckoPrices, useLoadTokens } from "@owallet/hooks";
import { showToast } from "@src/utils/helper";
import { EarningCardNew } from "./earning-card-new";
import { InjectedProviderUrl } from "../web/config";

export const HomeScreen: FunctionComponent = observer((props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshDate, setRefreshDate] = React.useState(Date.now());
  const { colors } = useTheme();
  const [isPending, startTransition] = useTransition();

  const styles = styling(colors);
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    browserStore,
    appInitStore,
    universalSwapStore,
  } = useStore();

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
        // queries.cosmos.queryRewards
        //   .getQueryBech32Address(account.bech32Address)
        //   .waitFreshResponse(),
        // queries.cosmos.queryDelegations
        //   .getQueryBech32Address(account.bech32Address)
        //   .waitFreshResponse(),
        // queries.cosmos.queryUnbondingDelegations
        //   .getQueryBech32Address(account.bech32Address)
        //   .waitFreshResponse(),
      ]);
    }
    setRefreshing(false);
    setRefreshDate(Date.now());
    if (
      accountOrai.bech32Address &&
      accountEth.evmosHexAddress &&
      accountTron.evmosHexAddress &&
      accountKawaiiCosmos.bech32Address
    ) {
      const currentDate = Date.now();

      const differenceInMilliseconds = Math.abs(currentDate - refreshDate);
      const differenceInSeconds = differenceInMilliseconds / 1000;

      if (differenceInSeconds > 10) {
        setTimeout(() => {
          universalSwapStore.setLoaded(false);

          handleFetchAmounts(
            accountOrai.bech32Address,
            accountEth.evmosHexAddress,
            accountTron.evmosHexAddress,
            accountKawaiiCosmos.bech32Address
          );
        }, 1400);
      } else {
        console.log("The dates are 30 seconds or less apart.");
      }
    }
  }, [
    chainStore.current.chainId,
    refreshDate,
    universalSwapStore.getTokenReload,
  ]);

  // This section for getting all tokens of all chains

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountKawaiiCosmos = accountStore.getAccount(ChainIdEnum.KawaiiCosmos);

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async (orai?, eth?, tron?, kwt?) => {
    let loadTokenParams = {};

    try {
      const cwStargate = {
        account: accountOrai,
        chainId: ChainIdEnum.Oraichain,
        rpc: oraichainNetwork.rpc,
      };
      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: orai ?? accountOrai.bech32Address,
        metamaskAddress: eth ?? accountEth.evmosHexAddress,
        kwtAddress: kwt ?? accountKawaiiCosmos.bech32Address,
        tronAddress: getBase58Address(tron ?? accountTron.evmosHexAddress),
        cwStargate,
        tokenReload:
          universalSwapStore?.getTokenReload?.length > 0
            ? universalSwapStore.getTokenReload
            : null,
      };

      setTimeout(() => {
        loadTokenAmounts(loadTokenParams);
        universalSwapStore.clearTokenReload();
      }, 1000);
    } catch (error) {
      console.log("error loadTokenAmounts", error);
      universalSwapStore.setLoaded(true);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    universalSwapStore.setLoaded(false);
    universalSwapStore.clearAmounts();
  }, [accountOrai.bech32Address]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    InteractionManager.runAfterInteractions(() => {
      startTransition(() => {
        if (
          accountOrai.bech32Address &&
          accountEth.evmosHexAddress &&
          accountTron.evmosHexAddress &&
          accountKawaiiCosmos.bech32Address
        ) {
          timeoutId = setTimeout(() => {
            handleFetchAmounts(
              accountOrai.bech32Address,
              accountEth.evmosHexAddress,
              accountTron.evmosHexAddress,
              accountKawaiiCosmos.bech32Address
            );
          }, 1400);
        }
      });
    });
    // Clean up the timeout if the component unmounts or the dependency changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    accountOrai.bech32Address,
    accountEth.evmosHexAddress,
    accountTron.evmosHexAddress,
    accountKawaiiCosmos.bech32Address,
  ]);

  const { data: prices } = useCoinGeckoPrices();

  useEffect(() => {
    appInitStore.updatePrices(prices);
  }, [prices]);

  const renderAccountCard = (() => {
    if (chainStore.current.networkType === "bitcoin") {
      return <AccountCardBitcoin containerStyle={styles.containerStyle} />;
    } else if (chainStore.current.networkType === "evm") {
      return <AccountCardEVM containerStyle={styles.containerStyle} />;
    }
    return <AccountCard containerStyle={styles.containerStyle} />;
  })();

  // const renderTokenCard = useMemo(() => {
  //   if (chainStore.current.networkType === 'bitcoin') {
  //     return <TokensBitcoinCard refreshDate={refreshDate} />;
  //   } else if (chainStore.current.chainId === ChainIdEnum.TRON) {
  //     return <TronTokensCard />;
  //   }
  //   return <TokensCard refreshDate={refreshDate} />;
  // }, []);

  const oldUI = false;

  const renderNewTokenCard = useCallback(() => {
    return <TokensCardAll />;
  }, []);

  const renderNewAccountCard = (() => {
    return <AccountBoxAll />;
  })();

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
      {oldUI ? renderAccountCard : renderNewAccountCard}
      <DashboardCard />
      {chainStore.current.networkType === "cosmos" &&
      !appInitStore.getInitApp.isAllNetworks ? (
        <EarningCardNew containerStyle={styles.containerEarnStyle} />
      ) : null}
      {renderNewTokenCard()}
      {/* {chainStore.current.networkType === 'cosmos' ? <UndelegationsCard /> : null} */}
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
