import React, { FunctionComponent, useMemo } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import {
  renderFlag,
  RightArrow,
  SettingItem,
  SettingSectionTitle
} from './components';
// import { SettingSelectAccountItem } from "./items/select-account";
import { useSmartNavigation } from '../../navigation.provider';
// import { SettingFiatCurrencyItem } from "./items/fiat-currency";
import { SettingBiometricLockItem } from './items/biometric-lock';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { SettingRemoveAccountItem } from './items/remove-account';
import { canShowPrivateData } from './screens/view-private-data';
import { SettingViewPrivateDataItem } from './items/view-private-data';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ImageBackground
} from 'react-native';
import { Text } from '@src/components/text';
import { spacing, typography } from '../../themes';
import { DownArrowIcon } from '../../components/icon';
import { CountryModal } from './components/country-modal';
import { SettingSwitchModeItem } from './items/switch-mode';
import { useTheme } from '@src/themes/theme-provider';

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore, priceStore, modalStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map((key) => {
      return {
        key,
        label: key.toUpperCase()
      };
    });
  }, [priceStore.supportedVsCurrencies]);
  const selected = keyRingStore.multiKeyStoreInfo.find(
    (keyStore) => keyStore.selected
  );

  const smartNavigation = useSmartNavigation();
  const _onPressCountryModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      CountryModal({
        data: currencyItems,
        current: priceStore.defaultVsCurrency,
        priceStore,
        modalStore,
        colors
      })
    );
  };

  return (
    <PageWithScrollViewInBottomTabView backgroundColor={colors['background']}>
      <ImageBackground
        style={{
          ...styles.containerScreen
        }}
        resizeMode="cover"
        source={require('../../assets/image/bg_gradient.png')}
      >
        <Text
          style={{
            ...styles.title
          }}
        >
          Settings
        </Text>
        <View
          style={{
            ...styles.containerInfo,
            ...styles.shadowBox
          }}
        >
          <TouchableOpacity
            onPress={() =>
              smartNavigation.navigateSmart('SettingSelectAccount', {})
            }
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              justifyContent: 'space-between'
            }}
          >
            <View>
              <Text
                style={{
                  ...typography['text-caption2'],
                  color: colors['primary-text']
                }}
              >
                WALLET
              </Text>
              <Text
                style={{
                  ...typography['h6'],
                  color: colors['primary-text'],
                  fontWeight: 'bold'
                }}
              >
                {selected
                  ? selected.meta?.name || 'OWallet Account'
                  : 'No Account'}
              </Text>
            </View>
            <DownArrowIcon color={colors['primary-text']} height={12} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={_onPressCountryModal}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: spacing['20']
            }}
          >
            <View>
              <Text
                style={{
                  ...typography['text-caption2'],
                  color: colors['primary-text']
                }}
              >
                CURRENCY
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {renderFlag(priceStore.defaultVsCurrency)}
                <Text
                  style={{
                    ...typography['h6'],
                    color: colors['primary-text'],
                    fontWeight: 'bold',
                    marginHorizontal: spacing['8']
                  }}
                >
                  {priceStore.defaultVsCurrency.toUpperCase()}
                </Text>
              </View>
            </View>
            <DownArrowIcon color={colors['primary-text']} height={12} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      {/* <SettingSectionTitle title="General" /> */}
      <View
        style={{
          backgroundColor: colors['primary'],
          borderBottomLeftRadius: Platform.OS === 'ios' ? 32 : 0,
          borderBottomRightRadius: Platform.OS === 'ios' ? 32 : 0
        }}
      >
        <SettingSectionTitle title="Security" />
        {canShowPrivateData(keyRingStore.keyRingType) && (
          <SettingViewPrivateDataItem />
        )}

        <SettingItem
          label="Address book"
          onPress={() => {
            smartNavigation.navigateSmart('AddressBook', {});
          }}
        />

        {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
          <SettingBiometricLockItem
          // topBorder={!canShowPrivateData(keyRingStore.keyRingType)}
          />
        ) : null}
        {/* <SettingSectionTitle title="Others" /> */}
        <SettingSwitchModeItem />
        <SettingItem
          label="About OWallet"
          onPress={() => {
            smartNavigation.navigateSmart('Setting.Version', {});
          }}
        />
        <SettingRemoveAccountItem />
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors: object) =>
  StyleSheet.create({
    shadowBox: {
      shadowColor: colors['splash-background'],
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowRadius: 5,
      shadowOpacity: 1.0
    },
    containerScreen: {
      padding: 24,
      paddingTop: 76,
      paddingBottom: 101,
      marginBottom: 102,
      borderTopLeftRadius: Platform.OS === 'ios' ? 32 : 0,
      borderTopRightRadius: Platform.OS === 'ios' ? 32 : 0
      // borderBottomLeftRadius: Platform.OS === 'ios' ? 32 : 0,
      // borderBottomRightRadius: Platform.OS === 'ios' ? 32 : 0
    },
    title: {
      ...typography.h1,
      color: colors['white'],
      textAlign: 'center',
      fontWeight: '700'
    },
    containerInfo: {
      position: 'absolute',
      backgroundColor: colors['primary'],
      height: 160,
      margin: 24,
      marginTop: 150,
      borderRadius: 12,
      padding: 20,
      width: '100%'
    }
  });
