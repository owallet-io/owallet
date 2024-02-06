import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, ViewStyle, Image, StyleSheet } from 'react-native';
import { useStore } from '../../stores';
import { AddressCopyable } from '../../components/address-copyable';
import { useSmartNavigation } from '../../navigation.provider';
import { colors, metrics, spacing, typography } from '../../themes';
import { navigate } from '../../router/root';
import { AddressQRCodeModal } from './components';
import { formatBalance, getExchangeRate, getBalanceValue, getBaseDerivationPath } from '@owallet/bitcoin';
import { AccountBox } from './account-box';
import { btcToFiat } from '@owallet/bitcoin';
import { CoinPretty } from '@owallet/unit';
import { SCREENS } from '@src/common/constants';

export const AccountCardBitcoin: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, priceStore, modalStore, keyRingStore } = useStore();

  const selected = keyRingStore?.multiKeyStoreInfo.find(keyStore => keyStore?.selected);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const balanceBtc = queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.balance;
  const priceBalance = priceStore.calculatePrice(balanceBtc);
  const totalAmount = useMemo(() => {
    const amount = formatBalance({
      balance: Number(balanceBtc?.toCoin().amount),
      cryptoUnit: 'BTC',
      coin: chainStore.current.chainId
    });
    return amount;
  }, [chainStore.current.chainId, address, chainStore.current.networkType, balanceBtc]);

  const onPressBtnMain = name => {
    if (name === 'Buy') {
      navigate(SCREENS.STACK.Others, {
        screen: SCREENS.BuyFiat
      });
    }
    if (name === 'Receive') {
      _onPressReceiveModal();
    }
    if (name === 'Send') {
      navigate(SCREENS.STACK.Others, {
        screen: SCREENS.SendBtc
      });
      return;
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
      totalBalance={!!totalAmount ? totalAmount : null}
      addressComponent={<AddressCopyable address={address} maxCharacters={22} />}
      name={account?.name || '..'}
      coinType={`${
        keyRingStore.keyRingType === 'ledger'
          ? chainStore?.current?.bip44?.coinType
          : selected?.bip44HDPath?.coinType ?? chainStore?.current?.bip44?.coinType
      }`}
      totalAmount={priceBalance?.toString() || '$0'}
      // networkType={'cosmos'}
      onPressBtnMain={onPressBtnMain}
    />
  );
});

const styles = StyleSheet.create({
  textLoadMore: {
    ...typography['h7'],
    color: colors['primary-surface-default']
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
