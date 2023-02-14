import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { AccountCard } from './account-card';
import {
  AppState,
  AppStateStatus,
  RefreshControl,
  ScrollView,
  StyleSheet
} from 'react-native';
import { useStore } from '../../stores';
import { EarningCard } from './earning-card';
import { observer } from 'mobx-react-lite';
import { TokensCard } from './tokens-card';
import { usePrevious } from '../../hooks';
import { BIP44Selectable } from './bip44-selectable';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ChainUpdaterService } from '@owallet/background';
import { colors } from '../../themes';
import { AccountCardEVM } from './account-card-evm';
import { DashboardCard } from './dashboard';
import { UndelegationsCard } from '../stake/dashboard/undelegations-card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { API } from '../../common/api';

export const HomeScreen: FunctionComponent = observer(props => {
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    notificationStore
  } = useStore();
  const navigation = useNavigation();

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

    AppState.addEventListener('change', appStateHandler);

    return () => {
      AppState.removeEventListener('change', appStateHandler);
    };
  }, [checkAndUpdateChainInfo]);

  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage
      );
      navigation.navigate('Others', {
        screen: 'Notifications'
      });
    });
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        // const data = JSON.parse(remoteMessage?.data?.data);
        // console.log('message', data.message);
      });
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // const formatData = JSON.parse(remoteMessage?.data?.data);
      // console.log('raw', remoteMessage?.data);
      // console.log('formattedData', formatData);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (Object.keys(notificationStore?.getNotiData ?? {}).length > 0) {
      // Do something with the notification data here
      navigation.navigate('Others', {
        screen: 'Notifications'
      });
      notificationStore.removeNotidata();
    }
  }, [notificationStore]);

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
      checkAndUpdateChainInfo
    ])
  );

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0 });
    }
  }, [chainStore.current.chainId]);

  useEffect(() => {
    onSubscribeToTopic();
  }, []);

  const onSubscribeToTopic = React.useCallback(async () => {
    const fcmToken = await AsyncStorage.getItem('FCM_TOKEN');

    if (fcmToken) {
      const subcriber = await API.subcribeToTopic(
        {
          subcriber: fcmToken,
          topic:
            chainStore.current.networkType === 'cosmos'
              ? account.bech32Address.toString()
              : account.evmosHexAddress.toString()
        },
        {
          baseURL: 'https://tracking-tx.orai.io'
        }
      );
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    await Promise.all([
      priceStore.waitFreshResponse(),
      ...queries.queryBalances
        .getQueryBech32Address(account.bech32Address)
        .balances.map(bal => {
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
        .waitFreshResponse()
    ]);

    setRefreshing(false);
  }, [accountStore, chainStore, priceStore, queriesStore]);
  // const queries = queriesStore.get(chainStore.current.chainId);

  // const queryBalances = queriesStore
  //   .get(chainStore.current.chainId)
  //   .queryBalances.getQueryBech32Address(
  //     accountStore.getAccount(chainStore.current.chainId).bech32Address
  //   );

  // const queryBalancesEVM = queries.evm.queryEvmBalance.getQueryBalance(
  //   accountStore.getAccount(chainStore.current.chainId).evmosHexAddress
  // );

  // const tokens = queryBalances.balances;

  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ref={scrollViewRef}
    >
      <BIP44Selectable />
      {chainStore.current.networkType === 'cosmos' ? (
        <AccountCard containerStyle={styles.containerStyle} />
      ) : (
        <AccountCardEVM containerStyle={styles.containerStyle} />
      )}

      <DashboardCard />
      <TokensCard />
      {chainStore.current.networkType === 'cosmos' ? (
        <UndelegationsCard />
      ) : null}
      {chainStore.current.networkType === 'cosmos' ? (
        <EarningCard containerStyle={styles.containerEarnStyle} />
      ) : null}

      {/* {currentChain.networkType === 'cosmos' && (
        <>
          <MyRewardCard
            containerStyle={style.flatten(['margin-bottom-card-gap'])}
          />
          <StakingInfoCard
            containerStyle={style.flatten(['margin-bottom-card-gap'])}
          />
          <GovernanceCard
            containerStyle={style.flatten(['margin-bottom-card-gap'])}
          />
        </>
      )} */}
    </PageWithScrollViewInBottomTabView>
  );
});

const styles = StyleSheet.create({
  containerStyle: {
    paddingBottom: 12,
    backgroundColor: colors['gray-100']
  },
  containerEarnStyle: {
    backgroundColor: colors['gray-100']
  }
});
