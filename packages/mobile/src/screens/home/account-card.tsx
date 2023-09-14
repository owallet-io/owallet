import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, ViewStyle, Image, StyleSheet } from 'react-native';
import { useStore } from '../../stores';
import { AddressCopyable } from '../../components/address-copyable';
import { useSmartNavigation } from '../../navigation.provider';
import { colors, metrics, spacing, typography } from '../../themes';
import { navigate } from '../../router/root';
import { AddressQRCodeModal } from './components';
import { AccountBox } from './account-box';
import { SCREENS } from '@src/common/constants';
import {
  findLedgerAddressWithChainId,
  getAddressFromLedgerWhenChangeNetwork
} from '@src/utils/helper';

export const AccountCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
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
  const totalBalance = useMemo(() => {
    if (!!totalPrice) {
      return totalPrice?.toString();
    }
    return total
      .shrink(true)
      .maxDecimals(chainStore.current.stakeCurrency.coinDecimals)
      ?.toString();
  }, [
    totalPrice,
    total,
    chainStore.current.stakeCurrency.coinDecimals,
    chainStore.current.networkType,
    chainStore.current.chainId,
    account?.bech32Address
  ]);

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

  const _onPressReceiveModal = () => {
    modalStore.setOptions();
    modalStore.setChildren(
      AddressQRCodeModal({
        account,
        chainStore: chainStore.current
      })
    );
  };
  const handleAddress = () => {
    if (keyRingStore.keyRingType === 'ledger') {
      console.log(
        '🚀 ~ file: account-card.tsx:101 ~ handleAddress ~ account.bech32Address:',
        account.bech32Address
      );
      const addressLedger = findLedgerAddressWithChainId(
        keyRingStore.keyRingLedgerAddresses,
        chainStore.current.chainId
      );
      console.log(
        '🚀 ~ file: account-card.tsx:104 ~ handleAddress ~ addressLedger:',
        addressLedger
      );
      return getAddressFromLedgerWhenChangeNetwork(
        account.bech32Address,
        addressLedger
      );
    }
    return account.bech32Address;
  };
  return (
    <AccountBox
      totalBalance={totalBalance}
      addressComponent={
        <AddressCopyable address={account.bech32Address} maxCharacters={22} />
      }
      name={account?.name || '..'}
      coinType={`${
        keyRingStore.keyRingType === 'ledger'
          ? chainStore?.current?.bip44?.coinType
          : selected?.bip44HDPath?.coinType ??
            chainStore?.current?.bip44?.coinType
      }`}
      networkType={'cosmos'}
      onPressBtnMain={onPressBtnMain}
    />
  );
});

const styles = StyleSheet.create({
  textLoadMore: {
    ...typography['h7'],
    color: colors['purple-700']
  },
  containerBtn: {
    alignItems: 'center',
    marginTop: spacing['18'],
    justifyContent: 'center',
    backgroundColor: colors['gray-50'],
    width: metrics.screenWidth - 68,
    height: spacing['40'],
    paddingVertical: spacing['10'],
    borderRadius: spacing['12']
  }
});
