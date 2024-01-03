import React, { FunctionComponent, ReactElement, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { OWBox } from '../../components/card';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from '@src/components/text';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStore } from '../../stores';
import { LoadingSpinner } from '../../components/spinner';
import { useSmartNavigation } from '../../navigation.provider';
import { DownArrowIcon } from '../../components/icon';
import { BuyIcon, DepositIcon, SendDashboardIcon } from '../../components/icon/button';
import { metrics, spacing, typography } from '../../themes';

import MyWalletModal from './components/my-wallet-modal/my-wallet-modal';
import { useTheme } from '@src/themes/theme-provider';
import { OWButton } from '@src/components/button';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { navigate } from '@src/router/root';
import { SCREENS } from '@src/common/constants';
import RadioGroup from 'react-native-radio-buttons-group';
import { AddressBtcType } from '@owallet/types';
import { getKeyDerivationFromAddressType } from '@owallet/common';
import { useBIP44Option } from '../register/bip44';
export const AccountBox: FunctionComponent<{
  totalBalance?: string | React.ReactNode;
  totalAmount?: string | React.ReactNode;
  name?: string;
  hdPath?: string;
  addressComponent?: React.ReactNode;
  onPressBtnMain?: (name?: string) => void;
}> = observer(({ totalBalance, addressComponent, name, hdPath, totalAmount, onPressBtnMain }) => {
  const { colors } = useTheme();

  const styles = styling(colors);
  const { chainStore, accountStore, queriesStore, keyRingStore, modalStore } = useStore();

  const smartNavigation = useSmartNavigation();
  const { networkType, coinType, chainId, bip44 } = chainStore.current;
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const bip44Option = useBIP44Option();
  const queryStakable = queries.queryBalances.getQueryBech32Address(account.bech32Address).stakable;

  const _onPressMyWallet = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false
      }
    });
    modalStore.setChildren(MyWalletModal());
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
  const radioButtons = [
    {
      id: AddressBtcType.Bech32,
      label: 'SegWit(BECH32)',
      value: AddressBtcType.Bech32,
      borderColor: colors['primary-text'],
      labelStyle: {
        color: colors['primary-text']
      }
    },
    {
      id: AddressBtcType.Legacy,
      label: 'Bitcoin(LEGACY)',
      value: AddressBtcType.Legacy,
      borderColor: colors['primary-text'],
      labelStyle: {
        color: colors['primary-text']
      }
    }
  ];
  const onPressRadioButton = (type: AddressBtcType) => {
    account.setAddressTypeBtc(type);
    const keyDerivation = (() => {
      const keyMain = getKeyDerivationFromAddressType(type);
      return keyMain;
    })();

    if (account.isNanoLedger) {
      const path = `${keyDerivation}'/${bip44.coinType ?? coinType}'/${bip44Option.bip44HDPath.account}'/${
        bip44Option.bip44HDPath.change
      }/${bip44Option.bip44HDPath.addressIndex}`;

      keyRingStore.setKeyStoreLedgerAddress(path, chainId);
    }
  };
  return (
    <View
      style={{
        marginHorizontal: 24
      }}
    >
      <OWBox style={styles.containerOWBox} type="gradient">
        <View style={styles.overview}>
          <Text style={styles.titleTotalBalance}>Total Balance</Text>
          {!!totalBalance ? (
            <Text variant="h1" style={styles.textCenter} color={colors['white']}>
              {totalBalance || 0}
            </Text>
          ) : null}
          {!!totalAmount && typeof totalAmount == 'string' && (
            <Text style={styles.labelTotalAmount}>{totalAmount}</Text>
          )}
        </View>
        <View style={styles.containerBtnHeader}>
          {['Buy', 'Receive', 'Send'].map((e, i) => (
            <RenderBtnMain key={i} name={e} />
          ))}
        </View>
      </OWBox>

      <OWBox style={styles.containerBox} type="shadow">
        {networkType == 'cosmos' && queryStakable.isFetching && (
          <View style={styles.containerLoading}>
            <LoadingSpinner color={colors['gray-150']} size={22} />
          </View>
        )}

        <View style={styles.container}>
          <View style={styles.containerInfoAccount}>
            <TouchableOpacity onPress={_onPressMyWallet} style={styles.btnAcc}>
              <Image
                style={styles.infoIcon}
                source={require('../../assets/images/default-avatar.png')}
                resizeMode="contain"
                fadeDuration={0}
              />
              <Text style={styles.labelName}>{name}</Text>
              <DownArrowIcon height={15} color={colors['primary-text']} />
            </TouchableOpacity>

            {addressComponent || null}
          </View>
        </View>
        {networkType === 'bitcoin' && (
          <View
            style={{
              paddingTop: 10
            }}
          >
            <RadioGroup
              layout={'row'}
              radioButtons={radioButtons}
              onPress={onPressRadioButton}
              selectedId={account.addressType}
            />
          </View>
        )}
        <OWButton
          onPress={() => {
            smartNavigation.navigateSmart('Transactions', {});
          }}
          textStyle={{
            paddingLeft: 8
          }}
          label="Transactions history"
          type="secondary"
          size="medium"
          style={{
            marginTop: 16
          }}
          icon={<OWIcon color={colors['primary-surface-default']} size={18} name="history" />}
        />
        {chainStore.current.chainId == 'bitcoinTestnet' && (
          <OWButton
            onPress={() => {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.BtcFaucet
              });
            }}
            textStyle={{
              paddingLeft: 8
            }}
            style={{
              marginTop: 16
            }}
            label="BTC Testnet Faucet"
            size="small"
          />
        )}
      </OWBox>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
    labelTotalAmount: {
      textAlign: 'center',
      color: colors['gray-400'],
      fontSize: 16
    },
    textCenter: {
      textAlign: 'center'
    },
    titleTotalBalance: {
      textAlign: 'center',
      color: colors['purple-400'],
      fontSize: 14,
      lineHeight: 20
    },
    overview: {
      marginBottom: 16
    },
    containerOWBox: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0
    },
    containerBox: {
      marginTop: 0,
      paddingHorizontal: 12,
      borderTopLeftRadius: 0,
      paddingVertical: 18,
      borderTopRightRadius: 0,
      backgroundColor: colors['background-box']
    },
    labelName: {
      paddingLeft: spacing['6'],
      paddingRight: 10,
      fontWeight: '700',
      fontSize: 16,
      color: colors['primary-text']
    },
    infoIcon: {
      width: spacing['26'],
      borderRadius: spacing['26'],
      height: spacing['26']
    },
    btnAcc: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing['2']
    },
    containerInfoAccount: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      alignItems: 'center'
    },
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
