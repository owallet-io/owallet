import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, ViewStyle, Image, StyleSheet } from 'react-native';
import { useStore } from '../../stores';
import { AddressCopyable } from '../../components/address-copyable';
import { useSmartNavigation } from '../../navigation.provider';
import { colors, metrics, spacing, typography } from '../../themes';
import { navigate } from '../../router/root';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressQRCodeModal } from './components';

import {
  formatBalance,
  getExchangeRate,
  getBalanceValue
} from '@owallet/bitcoin';
import MyWalletModal from './components/my-wallet-modal/my-wallet-modal';
import { AccountBox } from './account-box';
import { btcToFiat } from '@src/utils/helper';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '@src/common/constants';

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
  const [totalBalance, setTotalBalance] = useState('0');
  const [totalAmount, setTotalAmount] = useState('0');
  // const queryBitcoin = queries.queryBalances.getQueryBech32Address(account.bech32Address).balances
  const queryStakable = queries.bitcoin.queryBitcoinBalance.getQueryBalance(
    account.bech32Address
  ).balance;
  console.log("🚀 ~ file: account-card.tsx:49 ~ queryStakable:", queryStakable)
  
  const getBalanceBtc = async (address) => {
    // const balanceBtc = await queryBitcoin.balance();
    // const ngon = queryBitcoin.balance;
    // console.log("🚀 ~ file: account-card.tsx:49 ~ ngon:", ngon)
    // const ngon = queryBitcoin.balance;
    // console.log('🚀 ~ file: account-card.tsx:55 ~ getBalanceBtc ~ ngon:', ngon);
    // const exchange = await getExchangeRate({
    //   selectedCurrency: priceStore.defaultVsCurrency
    // });

    // const amountData = getBalanceValue({
    //   balance: Number(balanceBtc?.toCoin().amount),
    //   cryptoUnit: 'BTC'
    // });
    // const exchangeRate = Number(exchange?.data);
    // const priceNative = Number(
    //   priceStore.getPrice(
    //     balanceBtc.currency?.coinGeckoId,
    //     priceStore.defaultVsCurrency
    //   )
    // );
    // const currencyFiat = priceStore.defaultVsCurrency;
    // const fiat = btcToFiat({
    //   amount: amountData as number,
    //   exchangeRate: !!exchangeRate ? exchangeRate : priceNative,
    //   currencyFiat
    // });
    // setTotalBalance(`$${fiat}`);
    // const amount = formatBalance({
    //   balance: Number(balanceBtc?.toCoin().amount),
    //   cryptoUnit: 'BTC',
    //   coin: chainStore.current.chainId
    // });
    // setTotalAmount(amount);
    return;
  };
  useEffect(() => {
    setTotalAmount(null);
    setTotalBalance('0');
    if (chainStore.current.networkType === 'bitcoin') {
      getBalanceBtc(account?.bech32Address);
    }

    const queryStakable = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    ).stakable;

    const stakable = queryStakable.balance;
    const queryDelegated =
      queries.cosmos.queryDelegations.getQueryBech32Address(
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
    if (!!totalPrice) {
      setTotalBalance(totalPrice.toString());
      return;
    }
    setTotalBalance(
      total
        .shrink(true)
        .maxDecimals(chainStore.current.stakeCurrency.coinDecimals)
        .toString()
    );
    return () => {};
  }, [chainStore.current.chainId, account?.bech32Address]);

  const onPressBtnMain = (name) => {
    if (name === 'Buy') {
      navigate('MainTab', { screen: 'Browser', path: 'https://oraidex.io' });
    }
    if (name === 'Receive') {
      _onPressReceiveModal();
    }
    if (name === 'Send') {
      if (chainStore.current.networkType === 'bitcoin') {
        navigate(SCREENS.STACK.Others, {
          screen: SCREENS.SendBtc
        });
        return;
      }
      smartNavigation.navigateSmart('Send', {
        currency: chainStore.current.stakeCurrency.coinMinimalDenom
      });
    }
  };

  const _onPressMyWallet = () => {
    modalStore.setOptions();
    modalStore.setChildren(MyWalletModal());
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
      totalAmount={!!totalAmount ? totalAmount : null}
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
