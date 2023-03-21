import React, { FunctionComponent } from 'react';
import { useHeaderHeight } from '@react-navigation/stack';
import { PageWithScrollView } from '../../components/page';
import { View, StyleSheet } from 'react-native';
import { Text } from '@src/components/text';
import { useSmartNavigation } from '../../navigation.provider';
import { useRegisterConfig } from '@owallet/hooks';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OWalletLogo, OWalletUnion } from './owallet-logo';
import { metrics } from '../../themes';
import OWButton from '../../components/button/OWButton';
import { useTheme } from '@src/themes/theme-provider';
import OWText from '@src/components/text/ow-text';

export const RegisterIntroScreen: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();
  const { colors } = useTheme();

  const smartNavigation = useSmartNavigation();
  const registerConfig = useRegisterConfig(keyRingStore, []);
  const handleImportFromMnemonic = () => {
    analyticsStore.logEvent('Import account started', {
      registerType: 'seed'
    });
    smartNavigation.navigateSmart('Register.RecoverMnemonic', {
      registerConfig
    });
  };
  const handleImportLedgerNanoX = () => {
    smartNavigation.navigateSmart('Register.NewLedger', {
      registerConfig
    });
  };
  const handleCreateANewWallet = () => {
    analyticsStore.logEvent('Create account started', {
      registerType: 'seed'
    });
    smartNavigation.navigateSmart('Register.NewMnemonic', {
      registerConfig
    });
  };
  const styles = useStyles();

  return (
    <PageWithScrollView
      backgroundColor={colors['plain-background']}
      style={[styles.container]}
    >
      <View style={styles.containerHeader}>
        <View>
          <OWalletLogo />
        </View>
        <View style={styles.containerUnion}>
          <OWalletUnion />
        </View>
        <OWText typo = 'bold' variant='h3' >
        Sign in to OWallet
        </OWText>
      </View>
      <OWButton
        style={styles.btnOW}
        label="Create a new wallet"
        onPress={handleCreateANewWallet}
      />
      <OWButton
        style={styles.btnOW}
        label="Import Ledger Nano X"
        onPress={handleImportLedgerNanoX}
        type="secondary"
      />
      <OWButton
        style={styles.btnOW}
        label="Import from Mnemonic / Private key"
        onPress={handleImportFromMnemonic}
        type="secondary"
      />
    </PageWithScrollView>
  );
});

const useStyles = () => {
  const { colors } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight = headerHeight - safeAreaInsets.top;
  return StyleSheet.create({
    btnOW: {
      marginBottom: 16
    },
    containerUnion: { paddingTop: 20, paddingBottom: 16 },
    title: {
      fontWeight: '700',
      fontSize: 24,
      color: colors['label'],
      lineHeight: 34,
      paddingBottom: 8
    },
    containerHeader: {
      alignItems: 'center',
      padding: 18
    },
    containerBtn: {
      width: metrics.screenWidth - 86
    },
    textBtn: {
      textAlign: 'center',
      fontWeight: '700',
      fontSize: 16,
      padding: 16
    },
    container: {
      paddingLeft: 42,
      paddingRight: 42,
      paddingBottom: metrics.screenHeight * 0.11,
      paddingTop: metrics.screenHeight * 0.18 - actualHeightHeight
    }
  });
};
