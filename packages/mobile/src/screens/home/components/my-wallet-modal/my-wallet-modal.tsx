import React from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { Text } from '@src/components/text';
import { colors, spacing, typography } from '../../../../themes'
import { _keyExtract } from '../../../../utils/helper'
import { BookMnemonicSeedIcon } from '../../../../components/icon/new-wallet'
import MnemonicSeed from './mnemonic-seed'
import WalletBtnList from './wallet-btn-list'

const styles = StyleSheet.create({
  containerAccount: {
    backgroundColor: colors['gray-10'],
    paddingVertical: spacing['16'],
    borderRadius: spacing['8'],
    paddingHorizontal: spacing['16'],
    flexDirection: 'row',
    marginTop: spacing['16'],
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  }
})

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
            color: colors['gray-900'],
            fontWeight: '800',
            marginBottom: spacing['12']
          }}
        >
          My Wallet
        </Text>
      </View>
      <MnemonicSeed styles={styles} />
      <WalletBtnList styles={styles} />
    </View>
  )
}

export default MyWalletModal
