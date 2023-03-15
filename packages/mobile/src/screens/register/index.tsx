import React, { FunctionComponent } from 'react';
import { useHeaderHeight } from '@react-navigation/stack';
import { PageWithScrollView } from '../../components/page';
import { View, Dimensions, StyleSheet } from 'react-native';
import { CText as Text } from '../../components/text';
import { Button } from '../../components/button';
import { useSmartNavigation } from '../../navigation.provider';
import { useRegisterConfig } from '@owallet/hooks';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OWalletLogo, OWalletUnion } from './owallet-logo';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { metrics } from '../../themes';
import { MaintainScreen } from '../../components/maintain';
import { useTheme } from '@react-navigation/native';
import OWButton from '../../components/button/OWButton';

export const RegisterIntroScreen: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const scheme = appInitStore.getInitApp.theme;
  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight = headerHeight - safeAreaInsets.top;

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
  const styles = stylesHaveProps({ colors, actualHeightHeight });
  
  return (
    <PageWithScrollView
      backgroundColor={colors['plain-background']}
      style={[styles.container]}
    >
      <View style={styles.containerHeader}>
        <View>
          <OWalletLogo theme={scheme} />
        </View>
        <View style={styles.containerUnion}>
          <OWalletUnion />
        </View>
        <Text style={styles.title}>Sign in to OWallet</Text>
      </View>
      <OWButton label="Create a new wallet" onPress={handleCreateANewWallet} />
      <OWButton
        label="Import Ledger Nano X"
        onPress={handleImportLedgerNanoX}
        type="secondary"
      />
      <OWButton
        label="Import from Mnemonic / Private key"
        onPress={handleImportFromMnemonic}
        type="secondary"
      />
    </PageWithScrollView>
  );
});

const stylesHaveProps = ({ colors, actualHeightHeight }) =>
  StyleSheet.create({
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
      marginBottom: 16,
      width: metrics.screenWidth - 86,

      borderRadius: 8
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
