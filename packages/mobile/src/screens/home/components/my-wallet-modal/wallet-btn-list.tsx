import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/components/text';
import {
  ExistingWalletSquareIcon,
  LedgerNanoWalletSquareIcon,
  NewWalletSquareIcon,
} from '../../../../components/icon/new-wallet';
import { RectButton } from '../../../../components/rect-button';
import { useSmartNavigation } from '../../../../navigation.provider';
import { useStore } from '../../../../stores';
import { useRegisterConfig } from '@owallet/hooks';
import { colors, spacing, typography } from '../../../../themes';
import { useNavigation } from '@react-navigation/native';
import { navigate } from '../../../../router/root';

const objTypeWallet = {
  CREATE_WALLET: 'create',
  IMPORT_EXISTING_WALLET: 'import-existing',
  IMPORT_LEDGER_WALLET: 'import-ledger',
};

const walletBtnList = [
  {
    icon: <NewWalletSquareIcon color="none" size={38} />,
    title: 'Create a new wallet',
    type: objTypeWallet.CREATE_WALLET,
  },
  {
    icon: <ExistingWalletSquareIcon color="none" size={38} />,
    title: 'Import existing wallet',
    type: objTypeWallet.IMPORT_EXISTING_WALLET,
  },
  {
    icon: <LedgerNanoWalletSquareIcon color="none" size={38} />,
    title: 'Import Ledger Nano X',
    type: objTypeWallet.IMPORT_LEDGER_WALLET,
  },
];

const WalletBtnList = ({ styles }) => {
  const { keyRingStore, analyticsStore, modalStore } = useStore();
  const registerConfig = useRegisterConfig(keyRingStore, []);
  const onPressElementWallet = async (type) => {
    await modalStore.close();
    switch (type) {
      case objTypeWallet.CREATE_WALLET:
        analyticsStore.logEvent('Create account started', {
          registerType: 'seed',
        });
        navigate('RegisterMain', { registerConfig });
        break;
      case objTypeWallet.IMPORT_EXISTING_WALLET:
        analyticsStore.logEvent('Import account started', {
          registerType: 'seed',
        });
        navigate('RegisterRecoverMnemonicMain', { registerConfig });
        break;
      case objTypeWallet.IMPORT_LEDGER_WALLET:
        navigate('RegisterNewLedgerMain', { registerConfig });
        break;
    }
  };

  const renderWalletBtn = (item, index) => {
    return (
      <RectButton
        key={index}
        style={{
          ...styles.containerAccount,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors['purple-700'],
        }}
        onPress={() => onPressElementWallet(item.type)}
      >
        <View
          style={{
            justifyContent: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {item.icon}
          <View
            style={{
              justifyContent: 'space-between',
              marginLeft: spacing['12'],
            }}
          >
            <Text
              style={{
                ...typography.h6,
                color: colors['gray-900'],
                fontWeight: '800',
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
        </View>
      </RectButton>
    );
  };

  return (
    <>
      <View>
        <Text style={{ color: colors['gray-700'],paddingTop: 10 }}>
          Don’t see your wallet on the list?
        </Text>
      </View>
      <View style={{ width: '100%' }}>
        {walletBtnList.map((item, index) => renderWalletBtn(item, index))}
      </View>
    </>
  );
};

export default WalletBtnList;
