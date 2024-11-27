import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { Clipboard, InteractionManager, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useStore } from '../../stores';
import { observer } from 'mobx-react-lite';
import { useTheme } from '@src/themes/theme-provider';
import { AccountBoxAll } from './components/account-box-new';
import { InjectedProviderUrl } from '../web/config';
import { MainTabHome } from './components';
import { StakeCardAll } from './components/stake-card-all';
import { NewThemeModal } from '@src/modals/theme-modal/theme';
import messaging from '@react-native-firebase/messaging';
import { Text } from '@src/components/text';
// import { NewThemeModal } from "@src/modals/theme/new-theme";

export const useIsNotReady = () => {
  const { chainStore, queriesStore } = useStore();
  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos.queryRPCStatus;
  return query.response == null && query.error == null;
};
export const HomeScreen: FunctionComponent = observer(props => {
  const { colors } = useTheme();
  const [token, setToken] = useState('');
  const styles = styling(colors);
  const { chainStore, queriesStore, priceStore, appInitStore, browserStore, allAccountStore, bitcoinAccountStore } =
    useStore();

  const scrollViewRef = useRef<ScrollView | null>(null);
  useEffect(() => {
    // for (const embedChainInfo of EmbedChainInfos) {
    //   const hasChain = chainStore.hasChain(embedChainInfo.chainId);
    //   if (!hasChain) continue;
    //   const chainInfo = chainStore.getChain(embedChainInfo.chainId);
    //   chainInfo.addCurrencies(...embedChainInfo.currencies);
    // }
    appInitStore.selectAllNetworks(true);
  }, []);
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      fetch(InjectedProviderUrl)
        .then(res => {
          return res.text();
        })
        .then(res => {
          browserStore.update_inject(res);
        })
        .catch(err => console.log(err));
    });
  }, []);

  // Request permission for notifications
  const requestUserPermission = async () => {
    const settings = await messaging().requestPermission();

    if (settings) {
      console.log('Permission granted!');
      getToken();
    }
  };

  // Get the device token
  const getToken = async () => {
    const token = await messaging().getToken();
    if (token) {
      console.log('Device Token:', token);
      setToken(token);
    }
  };

  useEffect(() => {
    // Call the function to request permission and get the device token
    requestUserPermission();
  }, []);

  const [isThemOpen, setThemeOpen] = useState(false);
  useEffect(() => {
    if (!appInitStore.getInitApp.isSelectTheme) {
      setThemeOpen(true);
    }
  }, [appInitStore.getInitApp.isSelectTheme]);
  const isNotReady = useIsNotReady();
  const onRefresh = async () => {
    if (isNotReady) {
      return;
    }
    priceStore.fetch();

    for (const chainInfo of chainStore.chainInfosInUI) {
      let account = allAccountStore.getAccount(chainInfo.chainId);
      if (account.addressDisplay === '') {
        continue;
      }
      const queries = queriesStore.get(chainInfo.chainId);
      const queryBalance = queries.queryBalances.getQueryBech32Address(account.addressDisplay);
      const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(account.addressDisplay);
      queryBalance.fetch();
      queryRewards.fetch();
      const queryUnbonding = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(account.addressDisplay);
      const queryDelegation = queries.cosmos.queryDelegations.getQueryBech32Address(account.addressDisplay);
      queryUnbonding.fetch();
      queryDelegation.fetch();
    }
  };
  const [refreshing, _] = useState(false);
  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.containerStyle}
      ref={scrollViewRef}
    >
      <NewThemeModal
        isOpen={isThemOpen}
        close={() => {
          setThemeOpen(false);
          appInitStore.updateSelectTheme();
        }}
        colors={colors}
      />
      <AccountBoxAll isLoading={false} />
      <Text>{token}</Text>
      <TouchableOpacity
        onPress={() => {
          Clipboard.setString(token);
        }}
      >
        <Text>{'Copy'}</Text>
      </TouchableOpacity>
      {appInitStore.getInitApp.isAllNetworks ? <StakeCardAll /> : null}
      <MainTabHome />
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = colors =>
  StyleSheet.create({
    containerStyle: {
      paddingBottom: 4,
      backgroundColor: colors['neutral-surface-bg']
    },
    containerEarnStyle: {
      backgroundColor: colors['neutral-surface-bg2']
    }
  });
