import React, { FunctionComponent } from 'react';
import { useHeaderHeight } from '@react-navigation/stack';
import { PageWithScrollView } from '../../components/page';
import { GoogleIcon, AppleIcon } from '../../components/icon';
import { useStyle } from '../../styles';
import { View, Text, Dimensions, Platform, StyleSheet } from 'react-native';
import { Button } from '../../components/button';
import { useSmartNavigation } from '../../navigation.provider';
import { useRegisterConfig } from '@owallet/hooks';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OWalletLogo } from './owallet-logo';
import { useTheme } from '@src/themes/theme-provider';

export const RegisterNotNewUserScreen: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();

  const style = useStyle();
  const { colors } = useTheme();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeightHeight = headerHeight - safeAreaInsets.top;

  return (
    <PageWithScrollView
      contentContainerStyle={style.get('flex-grow-1')}
      style={StyleSheet.flatten([
        style.flatten(['padding-x-42']),
        {
          paddingTop:
            Dimensions.get('window').height * 0.22 - actualHeightHeight,
          paddingBottom: Dimensions.get('window').height * 0.11
        }
      ])}
      backgroundColor={colors['plain-background']}
    >
      <View
        style={style.flatten(['flex-grow-1', 'items-center', 'padding-x-18'])}
      >
        <OWalletLogo />
      </View>
      <Button
        text="Import existing wallet"
        size="large"
        mode="light"
        onPress={() => {
          analyticsStore.logEvent('Import account started', {
            registerType: 'seed'
          });
          smartNavigation.navigateSmart('Register.RecoverMnemonic', {
            registerConfig
          });
        }}
      />
    </PageWithScrollView>
  );
});
