import React, { FunctionComponent, useCallback, useState } from 'react';
import { Button } from '../../../components/button';
import { Share, StyleSheet, View } from 'react-native';
import { CardModal } from '../../../modals/card';
import { AddressCopyable } from '../../../components/address-copyable';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, typography } from '../../../themes';
import { AccountWithAll, ChainStore } from '@owallet/stores';
import { Text } from '@src/components/text';

export const AddressQRCodeModal: FunctionComponent<{
  account?: AccountWithAll;
  chainStore?: any;
}> = ({ account, chainStore }) => {
  return (
    <View
      style={{
        alignItems: 'center'
      }}
    >
      <Text
        style={{
          ...typography.h6,
          color: colors['gray-900'],
          fontWeight: '900'
        }}
      >{`Receive`}</Text>
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            ...typography.h6,
            color: colors['gray-400'],
            fontWeight: '900',
            marginVertical: spacing['16']
          }}
        >{`Scan QR Code or copy below address`}</Text>
        <AddressCopyable
          address={
            chainStore.networkType === 'cosmos'
              ? account.bech32Address
              : account.evmosHexAddress
          }
          maxCharacters={22}
        />
        <View style={{ marginVertical: spacing['32'] }}>
          {account.bech32Address ? (
            <QRCode
              size={200}
              value={
                chainStore.networkType === 'cosmos'
                  ? account.bech32Address
                  : account.evmosHexAddress
              }
            />
          ) : (
            <View
              style={{
                height: 200,
                width: 200,
                backgroundColor: colors['disabled']
              }}
            />
          )}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Button
            containerStyle={{ flex: 1, backgroundColor: colors['purple-900'] }}
            textStyle={{
              color: colors['white']
            }}
            text="Share Address"
            mode="light"
            size="large"
            loading={account.bech32Address === ''}
            disabled={account.bech32Address === ''}
            onPress={() => {
              Share.share({
                message:
                  chainStore.networkType === 'cosmos'
                    ? account.bech32Address
                    : account.evmosHexAddress
              }).catch(e => {
                console.log(e);
              });
            }}
          />
        </View>
      </View>
    </View>
  );
};
