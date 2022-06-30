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
import { useStyle } from '../../styles';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CText as Text } from '../../components/text';
import { colors, metrics, spacing, typography } from '../../themes';
import { DownArrowIcon } from '../../components/icon';
import { CountryModal } from './components/country-modal';
import LinearGradient from 'react-native-linear-gradient';

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore, priceStore, modalStore } = useStore();
  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map(key => {
      return {
        key,
        label: key.toUpperCase()
      };
    });
  }, [priceStore.supportedVsCurrencies]);
  const selected = keyRingStore.multiKeyStoreInfo.find(
    keyStore => keyStore.selected
  );

  const style = useStyle();

  const smartNavigation = useSmartNavigation();
  const _onPressCountryModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      CountryModal({
        data: currencyItems,
        current: priceStore.defaultVsCurrency,
        priceStore,
        modalStore
      })
    );
  };

  useLogScreenView("Setting");

  return (
    <PageWithScrollViewInBottomTabView
      // backgroundColor={style.get('color-setting-screen-background').color}
    >
      <View
        style={{
          backgroundColor: colors['purple-400'],
          padding: 24,
          paddingTop: 76,
          paddingBottom: 101,
          marginBottom: 102,
          borderTopLeftRadius: Platform.OS === 'ios' ? 32 : 0,
          borderTopRightRadius: Platform.OS === 'ios' ? 32 : 0,
          borderBottomLeftRadius: Platform.OS === 'ios' ? 32 : 0,
          borderBottomRightRadius: Platform.OS === 'ios' ? 32 : 0,
        }}
      >
        <Text
          style={{
            ...typography.h1,
            color: colors['white'],
            textAlign: 'center',
            fontWeight: '700'
          }}
        >
          Settings
        </Text>
        <View
          style={[
            style.flatten([
              'absolute-fill',
              'background-color-white',
              'height-160',
              'margin-24',
              'margin-top-150',
              'border-radius-12',
              'padding-20'
            ]),
            styles.shadowBox
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              smartNavigation.navigateSmart('SettingSelectAccount', {})
            }
            style={style.flatten([
              'flex-row',
              'items-center',
              'justify-between'
            ])}
          >
            <View>
              <Text
                style={style.flatten([
                  'text-caption2',
                  'color-text-black-very-low'
                ])}
              >
                WALLET
              </Text>
              <Text
                style={style.flatten([
                  'text-caption2',
                  'color-black',
                  'font-bold',
                  'subtitle1'
                ])}
              >
                {selected
                  ? selected.meta?.name || 'Keplr Account'
                  : 'No Account'}
              </Text>
            </View>
            <DownArrowIcon color={colors['black']} height={12} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={_onPressCountryModal}
            style={style.flatten([
              'flex-row',
              'items-center',
              'justify-between',
              'padding-top-20'
            ])}
          >
            <View>
              <Text
                style={style.flatten([
                  'text-caption2',
                  'color-text-black-very-low'
                ])}
              >
                CURRENCY
              </Text>
              <View
                style={style.flatten([
                  'flex-row',
                  'items-center',
                  'justify-center'
                ])}
              >
                {renderFlag(priceStore.defaultVsCurrency)}
                <Text
                  style={style.flatten([
                    'text-caption2',
                    'color-black',
                    'body1',
                    'margin-x-8'
                  ])}
                >
                  {priceStore.defaultVsCurrency.toUpperCase()}
                </Text>
              </View>
            </View>
            <DownArrowIcon color={colors['black']} height={12} />
          </TouchableOpacity>
        </View>
      </View>
      {/* <SettingSelectAccountItem /> */}
      {/* <SettingFiatCurrencyItem topBorder={true} /> */}
      {/* <SettingSectionTitle title="General" /> */}
      <View
        style={{
          backgroundColor: colors['white'],
          borderBottomLeftRadius: Platform.OS === 'ios' ? 32 : 0,
          borderBottomRightRadius: Platform.OS === 'ios' ? 32 : 0,
        }}
      >
        <SettingSectionTitle title="Security" />
        <SettingItem
          label="Menemonic"
          right={<RightArrow />}
          onPress={() => {
            smartNavigation.navigateSmart('AddressBook', {});
          }}
        />

        {canShowPrivateData(keyRingStore.keyRingType) && (
          <SettingViewPrivateDataItem  />
        )}
        {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
          <SettingBiometricLockItem
          // topBorder={!canShowPrivateData(keyRingStore.keyRingType)}
          />
        ) : null}
        {/* <SettingSectionTitle title="Others" /> */}
        <SettingItem
          label="About OWallet"
          onPress={() => {
            smartNavigation.navigateSmart('Setting.Version', {});
          }}
        />
        <SettingRemoveAccountItem  />
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styles = StyleSheet.create({
  shadowBox: {
    shadowColor: '#ccc',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0
  }
});
