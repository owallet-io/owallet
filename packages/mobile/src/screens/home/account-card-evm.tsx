import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { ViewStyle } from 'react-native';
import { useStore } from '../../stores';
import { AddressCopyable } from '../../components/address-copyable';
import { useSmartNavigation } from '../../navigation.provider';
import { navigate } from '../../router/root';
import { AddressQRCodeModal } from './components';
import { AccountBox } from './account-box';
import { findLedgerAddressWithChainId, isBase58 } from '@src/utils/helper';
import { TRON_ID } from '@owallet/common';
import { Address } from '@owallet/crypto';
import Big from 'big.js';

export const AccountCardEVM: FunctionComponent<{
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
    keyStore => keyStore?.selected
  );

  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  let total;
  if (account.evmosHexAddress) {
    if (keyRingStore.keyRingType === 'ledger') {
      if (keyRingStore.keyRingLedgerAddresses) {
        const address = findLedgerAddressWithChainId(
          keyRingStore.keyRingLedgerAddresses,
          chainStore.current.chainId
        );
        total = queries.evm.queryEvmBalance.getQueryBalance(
          chainStore.current.chainId === TRON_ID && isBase58(address)
            ? Address.getEvmAddress(address)
            : address
        )?.balance;
      }
    } else {
      total = queries.evm.queryEvmBalance.getQueryBalance(
        account.evmosHexAddress
      )?.balance;
    }
  }

  const onPressBtnMain = name => {
    if (name === 'Buy') {
      navigate('MainTab', { screen: 'Browser', path: 'https://oraidex.io' });
    }
    if (name === 'Receive') {
      _onPressReceiveModal();
    }
    if (name === 'Send') {
      if (chainStore.current.chainId === TRON_ID) {
        smartNavigation.navigateSmart('SendTron', {
          currency: chainStore.current.stakeCurrency.coinMinimalDenom
        });
      } else {
        smartNavigation.navigateSmart('Send', {
          currency: chainStore.current.stakeCurrency.coinMinimalDenom
        });
      }
    }
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

  return (
    <AccountBox
      totalBalance={
        chainStore.current.chainId !== TRON_ID && total?.amount
          ? parseFloat(
              new Big(parseInt(total.amount.int.value))
                .div(new Big(10).pow(36))
                .toString()
            ).toFixed(5) + ` ${chainStore.current?.stakeCurrency.coinDenom}`
          : chainStore.current.chainId === TRON_ID && total?.amount
          ? parseFloat(
              new Big(parseInt(total?.amount?.int))
                .div(new Big(10).pow(24))
                .toString()
            ).toFixed(6) + ` ${chainStore.current?.stakeCurrency.coinDenom}`
          : 0
      }
      totalAmount={
        chainStore.current.chainId !== TRON_ID && total?.amount
          ? (
              parseFloat(
                new Big(parseInt(total?.amount?.int?.value))
                  .div(new Big(10).pow(36))
                  .toString()
              ) *
              priceStore?.getPrice(
                chainStore?.current?.stakeCurrency?.coinGeckoId
              )
            ).toFixed(6)
          : chainStore.current.chainId === TRON_ID && total?.amount
          ? (
              parseFloat(
                new Big(parseInt(total?.amount?.int))
                  .div(new Big(10).pow(24))
                  .toString()
              ) *
              priceStore?.getPrice(
                chainStore?.current?.stakeCurrency?.coinGeckoId
              )
            ).toFixed(6)
          : 0
      }
      addressComponent={
        <AddressCopyable
          address={
            keyRingStore.keyRingLedgerAddresses &&
            keyRingStore.keyRingType === 'ledger'
              ? findLedgerAddressWithChainId(
                  keyRingStore.keyRingLedgerAddresses,
                  chainStore.current.chainId
                )
              : chainStore.current.chainId === TRON_ID &&
                account.evmosHexAddress
              ? Address.getBase58Address(account.evmosHexAddress)
              : account.evmosHexAddress
          }
          maxCharacters={22}
        />
      }
      name={account?.name || '...'}
      coinType={`${
        keyRingStore.keyRingType === 'ledger'
          ? chainStore?.current?.bip44?.coinType
          : selected?.bip44HDPath?.coinType ??
            chainStore?.current?.bip44?.coinType
      }`}
      networkType={'evm'}
      onPressBtnMain={onPressBtnMain}
    />
  );
});
