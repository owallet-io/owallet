import React, { FunctionComponent } from 'react';
import { useHeaderHeight } from '@react-navigation/stack';
import { PageWithScrollView } from '../../components/page';
import { View, Dimensions } from 'react-native';
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

export const RegisterIntroScreen: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();
  const { colors } = useTheme();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight = headerHeight - safeAreaInsets.top;

  // return <MaintainScreen />;

  return (
    <PageWithScrollView
      contentContainerStyle={{
        display: 'flex'
      }}
      backgroundColor={colors['background']}
      style={{
        paddingLeft: 42,
        paddingRight: 42,
        paddingTop: Dimensions.get('window').height * 0.18 - actualHeightHeight,
        paddingBottom: Dimensions.get('window').height * 0.11
      }}
    >
      <View
        style={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'center',
          padding: 18
        }}
      >
        <View>
          <OWalletLogo />
        </View>
        <View style={{ paddingTop: 20, paddingBottom: 16 }}>
          <OWalletUnion />
        </View>
        <Text
          style={{
            fontWeight: '700',
            fontSize: 24,
            color: colors['label'],
            lineHeight: 34,
            paddingBottom: 8
          }}
        >
          Sign in to OWallet
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          analyticsStore.logEvent('Create account started', {
            registerType: 'seed'
          });
          smartNavigation.navigateSmart('Register.NewMnemonic', {
            registerConfig
          });
        }}
        style={{
          marginBottom: 16,
          width: metrics.screenWidth - 86,
          backgroundColor: colors['purple-900'],
          borderRadius: 8
        }}
      >
        <Text
          style={{
            color: colors['white'],
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            padding: 16
          }}
        >
          Create a new wallet
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          smartNavigation.navigateSmart('Register.NewLedger', {
            registerConfig
          });
        }}
        style={{
          marginBottom: 16,
          width: metrics.screenWidth - 86,
          backgroundColor: colors['gray-10'],
          borderRadius: 8
        }}
      >
        <Text
          style={{
            color: colors['purple-900'],
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            padding: 16
          }}
        >
          Import Ledger Nano X
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          analyticsStore.logEvent('Import account started', {
            registerType: 'seed'
          });
          smartNavigation.navigateSmart('Register.RecoverMnemonic', {
            registerConfig
          });
        }}
        style={{
          marginBottom: 16,
          width: metrics.screenWidth - 86,
          backgroundColor: colors['gray-10'],
          borderRadius: 8
        }}
      >
        <Text
          style={{
            color: colors['purple-900'],
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            padding: 16
          }}
        >
          Import from Mnemonic / Private key
        </Text>
      </TouchableOpacity>
    </PageWithScrollView>
  );
});
