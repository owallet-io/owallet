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

  const safeAreaInsets = useSafeAreaInsets();
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
  const _onPressMyWallet = () => {
    modalStore.setOpen();
    modalStore.setChildren(MyWalletModal());
  };
  const _onPressReceiveModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      AddressQRCodeModal({
        account,
        chainStore: chainStore.current
      })
    );
  };

  const RenderBtnMain = ({ name }) => {
    let icon: ReactElement;
    switch (name) {
      case 'Buy':
        icon = <BuyIcon />;
        break;
      case 'Receive':
        icon = <DepositIcon />;
        break;
      case 'Send':
        icon = <SendDashboardIcon />;
        break;
    }
    return (
      <OWButton
        style={styles.btnHeaderHome}
        size="small"
        type="primary"
        onPress={() => onPressBtnMain(name)}
        icon={icon}
        label={name}
        textStyle={styles.textBtnHeaderDashboard}
      />
    );
  };

  return (
    <View
      style={{
        marginHorizontal: 24,
      }}
    >
      <OWBox
        style={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        }}
        type="gradient"
      >
        <View
          style={{
            // marginTop: 28,
            marginBottom: 16
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: colors['purple-400'],
              fontSize: 14,
              lineHeight: 20
            }}
          >
            Total Balance
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontWeight: '900',
              fontSize: 34,
              lineHeight: 50
            }}
          >
            {totalPrice
              ? totalPrice.toString()
              : total.shrink(true).maxDecimals(6).toString()}
          </Text>
        </View>
        <View style={styles.containerBtnHeader}>
          {['Buy', 'Receive', 'Send'].map((e, i) => (
            <RenderBtnMain key={i} name={e} />
          ))}
        </View>
      </OWBox>

      <OWBox
        style={{
          marginTop: 0,
          paddingHorizontal: 12,
          borderTopLeftRadius: 0,
          paddingVertical: 18,
          borderTopRightRadius: 0,
          backgroundColor:colors['background-box']
        }}
        type="shadow"
      >
        {queryStakable.isFetching ? (
          <View style={styles.containerLoading}>
            <LoadingSpinner color={colors['gray-150']} size={22} />
          </View>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: spacing['2']
              }}
            >
              <Image
                style={{
                  width: spacing['26'],
                  height: spacing['26']
                }}
                source={require('../../assets/image/address_default.png')}
                fadeDuration={0}
              />
              <Text
                style={{
                  paddingLeft: spacing['6'],
                  fontWeight: '700',
                  fontSize: 16,
                  color: colors['primary-text']
                }}
              >
                {account.name || '...'}
              </Text>
            </View>

            <AddressCopyable
              address={account.bech32Address}
              maxCharacters={22}
            />
            <Text
              style={{
                paddingLeft: spacing['6'],
                fontSize: 14,
                paddingVertical: spacing['6'],
                color: colors['primary-text']
              }}
            >
              {`Coin type: ${
                selected?.bip44HDPath?.coinType ??
                chainStore?.current?.bip44?.coinType
              }`}
            </Text>
          </View>
          <TouchableOpacity onPress={_onPressMyWallet}>
            <DownArrowIcon height={28} color={colors['primary-text']} />
          </TouchableOpacity>
        </View>
        <NetworkErrorView />
        <OWButton
          style={{
            width: '100%'
          }}
          onPress={() => {
            smartNavigation.navigateSmart('Transactions', {});
          }}
          textStyle={{
            paddingLeft: 8
          }}
          label="Transactions history"
          type="secondary"
          size="medium"
          icon={
            <OWIcon color={colors['purple-700']} size={18} name="history" />
          }
        />
        
      </OWBox>
    </View>
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
