import React, { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { AccountCard } from './account-card';
import { AppState, AppStateStatus, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useStore } from '../../stores';
import { EarningCard } from './earning-card';
import { observer } from 'mobx-react-lite';
import { TokensCard } from './tokens-card';
import { usePrevious } from '../../hooks';
import { BIP44Selectable } from './bip44-selectable';
import { useTheme } from '@src/themes/theme-provider';
import { useFocusEffect } from '@react-navigation/native';
import { ChainUpdaterService } from '@owallet/background';
import { AccountCardEVM } from './account-card-evm';
import { DashboardCard } from './dashboard';
import { UndelegationsCard } from '../stake/dashboard/undelegations-card';
import { TronTokensCard } from './tron-tokens-card';
import { AccountCardBitcoin } from './account-card-bitcoin';
import { TokensBitcoinCard } from './tokens-bitcoin-card';
import { getAddress, getBase58Address, ChainIdEnum, delay } from '@owallet/common';
import { TokensCardAll } from './tokens-card-all';
import { AccountBoxAll } from './account-box-all';
import { oraichainNetwork } from '@oraichain/oraidex-common';
import { useCoinGeckoPrices, useLoadTokens } from '@owallet/hooks';
import { getTokenInfos, showToast } from '@src/utils/helper';

export const HomeScreen: FunctionComponent = observer(props => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshDate, setRefreshDate] = React.useState(Date.now());
  const { colors } = useTheme();

  const styles = styling(colors);
  const { chainStore, accountStore, queriesStore, priceStore, keyRingStore, appInitStore, universalSwapStore } =
    useStore();

  const scrollViewRef = useRef<ScrollView | null>(null);

  const currentChain = chainStore.current;
  const currentChainId = currentChain?.chainId;
  const account = accountStore.getAccount(chainStore.current.chainId);
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(chainStoreIsInitializing, true);
  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
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
      if (state === 'active') {
        checkAndUpdateChainInfo();
      }
    };
    const subscription = AppState.addEventListener('change', appStateHandler);
    return () => {
      subscription.remove();
    };
  }, [checkAndUpdateChainInfo]);

  useFocusEffect(
    useCallback(() => {
      if (
        (chainStoreIsInitializing !== previousChainStoreIsInitializing && !chainStoreIsInitializing) ||
        currentChainId !== previousChainId
      ) {
        checkAndUpdateChainInfo();
      }
    }, [
      chainStoreIsInitializing,
      previousChainStoreIsInitializing,
      currentChainId,
      previousChainId,
      checkAndUpdateChainInfo
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
    if (chainStore.current.networkType === 'bitcoin') {
      await queries.bitcoin.queryBitcoinBalance.getQueryBalance(address).waitFreshResponse();
      setRefreshing(false);
      setRefreshDate(Date.now());
      return;
    } else {
      await Promise.all([
        priceStore.waitFreshResponse(),
        ...queries.queryBalances.getQueryBech32Address(address).balances.map(bal => {
          return bal.waitFreshResponse();
        }),
        queries.cosmos.queryRewards.getQueryBech32Address(address).waitFreshResponse(),
        queries.cosmos.queryDelegations.getQueryBech32Address(address).waitFreshResponse(),
        queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(address).waitFreshResponse()
      ]);
    }

    setRefreshing(false);
    setRefreshDate(Date.now());
  }, [address, chainStore.current.chainId]);

  // This section for getting all tokens of all chains

  let accounts = {};

  Object.keys(ChainIdEnum).map(key => {
    let defaultAddress = accountStore.getAccount(ChainIdEnum[key]).bech32Address;
    if (ChainIdEnum[key] === ChainIdEnum.TRON) {
      accounts[ChainIdEnum[key]] = getBase58Address(accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress);
    } else if (defaultAddress.startsWith('evmos')) {
      accounts[ChainIdEnum[key]] = accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress;
    } else {
      accounts[ChainIdEnum[key]] = defaultAddress;
    }
  });

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async accounts => {
    let loadTokenParams = {};

    try {
      if (
        accounts?.[ChainIdEnum.TRON] &&
        accounts?.[ChainIdEnum.Ethereum] &&
        accountOrai.bech32Address &&
        accounts?.[ChainIdEnum.Oraichain] &&
        accounts?.[ChainIdEnum.Injective]
      ) {
        const cwStargate = {
          account: accountOrai,
          chainId: ChainIdEnum.Oraichain,
          rpc: oraichainNetwork.rpc
        };
        loadTokenParams = {
          ...loadTokenParams,
          oraiAddress: accounts[ChainIdEnum.Oraichain],
          cwStargate
        };
        loadTokenParams = {
          ...loadTokenParams,
          metamaskAddress: accounts[ChainIdEnum.Ethereum]
        };
        loadTokenParams = {
          ...loadTokenParams,
          kwtAddress: getAddress(accounts[ChainIdEnum.Injective], 'oraie')
        };
        loadTokenParams = {
          ...loadTokenParams,
          tronAddress: accounts[ChainIdEnum.TRON]
        };
        loadTokenAmounts(loadTokenParams);
      }
    } catch (error) {
      console.log('error loadTokenAmounts', error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: 'danger'
      });
    }
  };

  const delayedFunction = useCallback(async () => {
    await delay(1700);
    Object.keys(ChainIdEnum).map(key => {
      let defaultAddress = accountStore.getAccount(ChainIdEnum[key]).bech32Address;
      if (ChainIdEnum[key] === ChainIdEnum.TRON) {
        accounts[ChainIdEnum[key]] = getBase58Address(accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress);
      } else if (defaultAddress.startsWith('evmos')) {
        accounts[ChainIdEnum[key]] = accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress;
      } else {
        accounts[ChainIdEnum[key]] = defaultAddress;
      }
    });

    handleFetchAmounts(accounts);
  }, []);

  useEffect(() => {
    universalSwapStore.clearAmounts();
    delayedFunction();
  }, [accountOrai.bech32Address]);

  // This section is for PnL display

  const { data: prices } = useCoinGeckoPrices();

  useEffect(() => {
    appInitStore.updatePrices(prices);
  }, [prices]);

  const updatePriceFeed = async () => {
    await delay(4000);
    if (Object.keys(universalSwapStore.getAmount).length > 0) {
      appInitStore.updatePriceFeed(
        accountOrai.bech32Address,
        getTokenInfos({ tokens: universalSwapStore.getAmount, prices })
      );
    }
  };

  useEffect(() => {
    updatePriceFeed();
  }, [universalSwapStore.getAmount, accountOrai.bech32Address, prices]);

  const renderAccountCard = (() => {
    if (appInitStore.getInitApp.isAllNetworks) {
      return <AccountBoxAll />;
    } else if (chainStore.current.networkType === 'bitcoin') {
      return <AccountCardBitcoin containerStyle={styles.containerStyle} />;
    } else if (chainStore.current.networkType === 'evm') {
      return <AccountCardEVM containerStyle={styles.containerStyle} />;
    }
    return <AccountCard containerStyle={styles.containerStyle} />;
  })();

  const renderTokenCard = () => {
    if (appInitStore.getInitApp.isAllNetworks) {
      return <TokensCardAll />;
    } else if (chainStore.current.networkType === 'bitcoin') {
      return <TokensBitcoinCard refreshDate={refreshDate} />;
    } else if (chainStore.current.chainId === ChainIdEnum.TRON) {
      return <TronTokensCard />;
    }
    return <TokensCard refreshDate={refreshDate} />;
  };

  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
      // backgroundColor={colors['background']}
      ref={scrollViewRef}
    >
      <BIP44Selectable />
      {renderAccountCard}
      <DashboardCard />
      {renderTokenCard()}
      {chainStore.current.networkType === 'cosmos' ? <UndelegationsCard /> : null}
      {chainStore.current.networkType === 'cosmos' ? <EarningCard containerStyle={styles.containerEarnStyle} /> : null}
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = colors =>
  StyleSheet.create({
    containerStyle: {
      paddingBottom: 12,
      backgroundColor: colors['background-box']
    },
    containerEarnStyle: {
      backgroundColor: colors['background-box']
    }
  });
