import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Text } from '@src/components/text';
import { colors, spacing, typography } from '../../../../themes';
import { _keyExtract } from '../../../../utils/helper';
import { BookMnemonicSeedIcon } from '../../../../components/icon/new-wallet';
import MnemonicSeed from './mnemonic-seed';
import WalletBtnList from './wallet-btn-list';

const MyWalletModal = () => {
  return (
    <View
      style={{
        alignItems: 'center'
      }}
    >
      <View>
        <Text
          style={{
            ...typography.h6,
            fontWeight: '800',
            marginBottom: spacing['12']
          }}
        >
          Set Default Wallet
        </Text>
      </View>
      <MnemonicSeed />
      {/* <WalletBtnList  /> */}
    </View>
  );
};

export default MyWalletModal;
