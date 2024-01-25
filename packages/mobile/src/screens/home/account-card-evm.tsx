import React, { FunctionComponent, useEffect } from 'react';
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

export const AccountCardEVM: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({}) => {
  const { chainStore, accountStore, queriesStore, priceStore, modalStore, keyRingStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const selected = keyRingStore?.multiKeyStoreInfo.find(keyStore => keyStore?.selected);
  const addressDisplay = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);
  const addressCore = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);
  let total: any = queries.evm.queryEvmBalance.getQueryBalance(addressCore)?.balance;

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
    modalStore.setOptions();
    modalStore.setChildren(
      AddressQRCodeModal({
        account,
        chainStore: chainStore.current,
        keyRingStore: keyRingStore
      })
    );
  };

  const getKey = async () => {
    try {
      // @ts-ignore
      const pub = await window.oasis.getDefaultOasisAddress(chainStore.current.chainId);
      console.log('pub', pub);
    } catch (err) {
      console.log('err getKey', err);
    }
  };

  useEffect(() => {
    getKey();
  }, []);

  const renderAddress = () => {
    if (chainStore.current.chainId === TRON_ID) {
      return (
        <View>
          <View>
            <Text>Base58: </Text>
            <AddressCopyable address={addressDisplay} maxCharacters={22} />
          </View>
          <View>
            <Text>Evmos: </Text>
            <AddressCopyable address={addressCore} maxCharacters={22} />
          </View>
        </View>
      );
    }

    return (
      <View>
        <View>
          <Text>EVM: </Text>
          <AddressCopyable address={addressDisplay} maxCharacters={22} />
        </View>
        <View>
          <Text>Evmos: </Text>
          <AddressCopyable address={account.bech32Address} maxCharacters={22} />
        </View>
      </View>
    );
    // return <AddressCopyable address={addressDisplay} maxCharacters={22} />;
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
            ? `${new Big(parseInt(total?.amount?.int)).div(new Big(10).pow(36)).toFixed(8)}` +
              ` ${chainStore.current?.stakeCurrency.coinDenom}`
            : null}

          {chainStore.current.chainId === TRON_ID && total
            ? `${new Big(parseInt(total?.amount?.int)).div(new Big(10).pow(24)).toFixed(6)}` +
              ` ${chainStore.current?.stakeCurrency.coinDenom}`
            : null}
        </Text>
      }
      coinType={`${
        keyRingStore.keyRingType === 'ledger'
          ? chainStore?.current?.bip44?.coinType
          : selected?.bip44HDPath?.coinType ?? chainStore?.current?.bip44?.coinType
      }`}
      // networkType={'evm'}
      name={account.name || '...'}
      onPressBtnMain={onPressBtnMain}
      totalAmount={`$${
        chainStore.current.chainId !== TRON_ID && total
          ? (
              parseFloat(new Big(parseInt(total.amount?.int?.value)).div(new Big(10).pow(36)).toString()) *
              priceStore?.getPrice(chainStore?.current?.stakeCurrency?.coinGeckoId)
            ).toFixed(6)
          : chainStore.current.chainId === TRON_ID && total
          ? (
              parseFloat(new Big(parseInt(total.amount?.int)).div(new Big(10).pow(24)).toString()) *
              priceStore?.getPrice(chainStore?.current?.stakeCurrency?.coinGeckoId)
            ).toFixed(6)
          : 0
      }`}
      addressComponent={renderAddress()}
    />
  );
});
