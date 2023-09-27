import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { View, ViewStyle } from 'react-native';
import { useStore } from '../../stores';
import { AddressCopyable } from '../../components/address-copyable';
import { useSmartNavigation } from '../../navigation.provider';
import { navigate } from '../../router/root';
import { AddressQRCodeModal } from './components';
import Big from 'big.js';
import { Text } from '@src/components/text';
import { AccountBox } from './account-box';
import { TRON_ID } from '@owallet/common';
import { Address } from '@owallet/crypto';
import { findLedgerAddressWithChainId, isBase58 } from '@src/utils/helper';

export const AccountCardEVM: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({}) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    modalStore,
    keyRingStore
  } = useStore();

  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const selected = keyRingStore?.multiKeyStoreInfo.find(
    (keyStore) => keyStore?.selected
  );

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

  const onPressBtnMain = (name) => {
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
  const renderAddress = () => {
    if (
      keyRingStore.keyRingLedgerAddresses &&
      keyRingStore.keyRingType === 'ledger'
    ) {
      return (
        <AddressCopyable
          address={findLedgerAddressWithChainId(
            keyRingStore.keyRingLedgerAddresses,
            chainStore.current.chainId
          )}
          maxCharacters={22}
        />
      );
    } else if (chainStore.current.chainId === TRON_ID) {
      return (
        <View>
          <View>
            <Text>Base58: </Text>
            <AddressCopyable
              address={Address.getBase58Address(account?.evmosHexAddress)}
              maxCharacters={22}
            />
          </View>
          <View>
            <Text>Evmos: </Text>
            <AddressCopyable
              address={account?.evmosHexAddress}
              maxCharacters={22}
            />
          </View>
        </View>
      );
    }
    return (
      <AddressCopyable address={account?.evmosHexAddress} maxCharacters={22} />
    );
  };
  return (
    <AccountBox
      totalBalance={
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontWeight: '900',
            fontSize: 34,
            lineHeight: 50
          }}
        >
          {chainStore.current.chainId !== TRON_ID && total
            ? `${new Big(parseInt(total?.amount?.int))
                .div(new Big(10).pow(36))
                .toFixed(8)}` +
              ` ${chainStore.current?.stakeCurrency.coinDenom}`
            : null}

          {chainStore.current.chainId === TRON_ID && total
            ? `${new Big(parseInt(total?.amount?.int))
                .div(new Big(10).pow(24))
                .toFixed(6)}` +
              ` ${chainStore.current?.stakeCurrency.coinDenom}`
            : null}
        </Text>
      }
      coinType={`${
        keyRingStore.keyRingType === 'ledger'
          ? chainStore?.current?.bip44?.coinType
          : selected?.bip44HDPath?.coinType ??
            chainStore?.current?.bip44?.coinType
      }`}
      networkType={'evm'}
      name={account.name || '...'}
      onPressBtnMain={onPressBtnMain}
      totalAmount={`${
        chainStore.current.chainId !== TRON_ID && total
          ? (
              parseFloat(
                new Big(parseInt(total.amount?.int?.value))
                  .div(new Big(10).pow(36))
                  .toString()
              ) *
              priceStore?.getPrice(
                chainStore?.current?.stakeCurrency?.coinGeckoId
              )
            ).toFixed(6)
          : chainStore.current.chainId === TRON_ID && total
          ? (
              parseFloat(
                new Big(parseInt(total.amount?.int))
                  .div(new Big(10).pow(24))
                  .toString()
              ) *
              priceStore?.getPrice(
                chainStore?.current?.stakeCurrency?.coinGeckoId
              )
            ).toFixed(6)
          : 0
      }`}
      addressComponent={renderAddress()}
    />
  );
});
