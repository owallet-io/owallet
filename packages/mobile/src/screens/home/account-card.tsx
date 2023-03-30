import React, { FunctionComponent, ReactElement, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardBody, OWBox } from '../../components/card';
import { View, ViewStyle, Image, StyleSheet } from 'react-native';
import { Text } from '@src/components/text';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStore } from '../../stores';
import { AddressCopyable } from '../../components/address-copyable';
import { LoadingSpinner } from '../../components/spinner';
import { useSmartNavigation } from '../../navigation.provider';
import { NetworkErrorView } from './network-error-view';
import { DownArrowIcon } from '../../components/icon';
import {
  BuyIcon,
  DepositIcon,
  SendDashboardIcon
} from '../../components/icon/button';
import { metrics, spacing, typography } from '../../themes';
import { navigate } from '../../router/root';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressQRCodeModal } from './components';
import LinearGradient from 'react-native-linear-gradient';
import MyWalletModal from './components/my-wallet-modal/my-wallet-modal';
import { useTheme } from '@src/themes/theme-provider';
import { OWButton } from '@src/components/button';
import OWIcon from '@src/components/ow-icon/ow-icon';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { AccountBox } from './account-box';

export const AccountCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    modalStore,
    keyRingStore
  } = useStore();

  const selected = keyRingStore?.multiKeyStoreInfo.find(
    (keyStore) => keyStore?.selected
  );

  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;

  const stakable = queryStakable.balance;
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const delegated = queryDelegated.total;

  const queryUnbonding =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    );
  const unbonding = queryUnbonding.total;

  const stakedSum = delegated.add(unbonding);

  const total = stakable.add(stakedSum);

  const totalPrice = priceStore.calculatePrice(total);

  const onPressBtnMain = (name) => {
    if (name === 'Buy') {
      navigate('MainTab', { screen: 'Browser', path: 'https://oraidex.io' });
    }
    if (name === 'Receive') {
      _onPressReceiveModal();
    }
    if (name === 'Send') {
      smartNavigation.navigateSmart('Send', {
        currency: chainStore.current.stakeCurrency.coinMinimalDenom
      });
    }
  };

  // const _onPressNamespace = () => {
  //   modalStore.setOpen();
  //   modalStore.setChildren(NamespaceModal(account));
  // };

  const _onPressReceiveModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      AddressQRCodeModal({
        account,
        chainStore: chainStore.current
      })
    );
  };

  return (
    <AccountBox
      totalBalance={
        totalPrice
          ? totalPrice.toString()
          : total.shrink(true).maxDecimals(6).toString()
      }
      onPressBtnMain={onPressBtnMain}
      addressComponent={
        <AddressCopyable
          address={account.bech32Address}
          maxCharacters={22}
          networkType={chainStore.current.networkType}
        />
      }
      name={account.name}
      networkType={'cosmos'}
      coinType={
        selected?.bip44HDPath?.coinType ?? chainStore?.current?.bip44?.coinType
      }
    />
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerLoading: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    containerBtnHeader: {
      display: 'flex',
      flexDirection: 'row',
      paddingTop: spacing['6'],
      paddingHorizontal: spacing['6'],
      justifyContent: 'center'
    },
    textBtnHeaderDashboard: {
      paddingLeft: spacing['6']
    },
    btnHeaderHome: {
      width: '33.3%',
      marginHorizontal: 6
    },
    textLoadMore: {
      ...typography['h7'],
      color: colors['colored-label']
    },
    containerBtn: {
      alignItems: 'center',
      marginTop: spacing['18'],
      justifyContent: 'center',
      backgroundColor: colors['primary-background'],
      width: metrics.screenWidth - 68,
      height: spacing['40'],
      paddingVertical: spacing['10'],
      borderRadius: spacing['12']
    }
  });
