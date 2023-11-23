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

export const AccountCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, priceStore, modalStore, keyRingStore } = useStore();

  const selected = keyRingStore?.multiKeyStoreInfo.find((keyStore) => keyStore?.selected);
  const smartNavigation = useSmartNavigation();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const addressDisplay = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);

  const queryStakable = queries.queryBalances.getQueryBech32Address(addressDisplay).stakable;

  const stakable = queryStakable.balance;
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(addressDisplay);
  const delegated = queryDelegated.total;

  const queryUnbonding = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(addressDisplay);
  const unbonding = queryUnbonding.total;

  const stakedSum = delegated.add(unbonding);

  const totalStake = stakable.add(stakedSum);

  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const queryBalances = queries.queryBalances.getQueryBech32Address(address);
  const tokens = queryBalances.positiveNativeUnstakables.concat(queryBalances.nonNativeBalances);
  const totalPrice = useMemo(() => {
    const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
    if (!fiatCurrency) {
      return undefined;
    }
    if (!totalStake.isReady) {
      return undefined;
    }
    let res = priceStore.calculatePrice(totalStake);
    for (const token of tokens) {
      const price = priceStore.calculatePrice(token.balance);
      if (price) {
        res = res.add(price);
      }
    }

    return res;
  }, [totalStake]);

  const totalBalance = useMemo(() => {
    if (!!totalPrice) {
      return totalPrice?.toString();
    }
    return totalStake.shrink(true).maxDecimals(chainStore.current.stakeCurrency.coinDecimals)?.toString();
  }, [
    totalPrice,
    totalStake,
    chainStore.current.stakeCurrency.coinDecimals,
    chainStore.current.networkType,
    chainStore.current.chainId,
    addressDisplay
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
        chainStore: chainStore.current,
        keyRingStore: keyRingStore
      })
    );
  };

  return (
    <AccountBox
      totalBalance={totalBalance}
      addressComponent={<AddressCopyable address={addressDisplay} maxCharacters={22} />}
      name={account?.name || '..'}
      coinType={`${
        keyRingStore.keyRingType === 'ledger'
          ? chainStore?.current?.bip44?.coinType
          : selected?.bip44HDPath?.coinType ?? chainStore?.current?.bip44?.coinType
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
