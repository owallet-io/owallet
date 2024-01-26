import React, { FunctionComponent, useEffect, useState } from 'react';
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
import { ChainIdEnum, TRON_ID } from '@owallet/common';
import { formatBaseUnitsAsRose, formatWeiAsWrose } from '@owallet/background/build/utils/oasis-helper';

export const AccountCardEVM: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({}) => {
  const { chainStore, accountStore, queriesStore, priceStore, modalStore, keyRingStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const [oasisAddress, setOasisAddress] = useState('');
  const [oasisBalance, setOasisBalance] = useState('0');

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

  const getOasisInfo = async () => {
    try {
      // @ts-ignore
      const oasisInfo = await window.oasis.getDefaultOasisAddress(chainStore.current.chainId);
      const amountUnit = 'baseUnits';
      const maximumFractionDigits = undefined;
      const isUsingBaseUnits = amountUnit === 'baseUnits';
      const formatter = isUsingBaseUnits ? formatBaseUnitsAsRose : formatWeiAsWrose;
      const amountString = formatter(oasisInfo.balance, {
        minimumFractionDigits: 1,
        maximumFractionDigits:
          typeof maximumFractionDigits !== 'undefined' ? maximumFractionDigits : isUsingBaseUnits ? 15 : 18
      });
      setOasisBalance(amountString);
      setOasisAddress(oasisInfo.address);
    } catch (err) {
      console.log('err getOasisInfo', err);
    }
  };

  useEffect(() => {
    getOasisInfo();
  }, [account]);

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

    return <AddressCopyable address={oasisAddress.length > 0 ? oasisAddress : addressDisplay} maxCharacters={22} />;
  };
  const totalAmount = () => {
    if (chainStore.current.chainId === ChainIdEnum.Oasis) {
      return ``;
    }
    if (chainStore.current.chainId !== ChainIdEnum.TRON && total) {
      return (
        '$' +
        (
          parseFloat(new Big(parseInt(total.amount?.int?.value)).div(new Big(10).pow(36)).toString()) *
          priceStore?.getPrice(chainStore?.current?.stakeCurrency?.coinGeckoId)
        ).toFixed(6)
      );
    }
    if (chainStore.current.chainId === ChainIdEnum.TRON && total) {
      return (
        '$' +
        (
          parseFloat(new Big(parseInt(total.amount?.int)).div(new Big(10).pow(24)).toString()) *
          priceStore?.getPrice(chainStore?.current?.stakeCurrency?.coinGeckoId)
        ).toFixed(6)
      );
    }

    return 0;
  };

  const totalBalance = () => {
    if (chainStore.current.chainId === ChainIdEnum.Oasis) {
      return oasisBalance + ` ${chainStore.current?.stakeCurrency.coinDenom}`;
    }

    if (chainStore.current.chainId !== TRON_ID && total) {
      return (
        `${new Big(parseInt(total?.amount?.int)).div(new Big(10).pow(36)).toFixed(8)}` +
        ` ${chainStore.current?.stakeCurrency.coinDenom}`
      );
    }

    if (chainStore.current.chainId === TRON_ID && total) {
      return (
        `${new Big(parseInt(total?.amount?.int)).div(new Big(10).pow(24)).toFixed(6)}` +
        ` ${chainStore.current?.stakeCurrency.coinDenom}`
      );
    }

    return null;
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
          {totalBalance()}
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
      totalAmount={`${totalAmount()}`}
      addressComponent={renderAddress()}
    />
  );
});
