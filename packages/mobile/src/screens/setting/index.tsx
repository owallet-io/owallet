import React, { FunctionComponent } from 'react';
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
import { colors } from '../../themes';

export const SettingScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore, priceStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  useLogScreenView("Setting");

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={style.get('color-setting-screen-background').color}
    >
      <View
        style={{
          backgroundColor: colors['purple-700'],
          padding: 24,
          paddingTop: 76,
          paddingBottom: 101,
          marginBottom: 102,
          borderTopLeftRadius: Platform.OS === 'ios' ? 32 : 0,
          borderTopRightRadius: Platform.OS === 'ios' ? 32 : 0
        }}
      >
        <Text style={style.flatten(['h1', 'color-white'])}>Setting</Text>
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
            <RightArrow />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              smartNavigation.navigateSmart('SettingSelectLang', {})
            }
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
            <RightArrow />
          </TouchableOpacity>
        </View>
      </View>
      {/* <SettingSelectAccountItem /> */}
      {/* <SettingFiatCurrencyItem topBorder={true} /> */}
      {/* <SettingSectionTitle title="General" /> */}
      <View style={style.flatten(['background-color-white'])}>
        <SettingSectionTitle title="Security" />
        <SettingItem
          label="Address book"
          right={<RightArrow />}
          onPress={() => {
            smartNavigation.navigateSmart('AddressBook', {});
          }}
        />

        {canShowPrivateData(keyRingStore.keyRingType) && (
          <SettingViewPrivateDataItem topBorder={false} />
        )}
        {keychainStore.isBiometrySupported || keychainStore.isBiometryOn ? (
          <SettingBiometricLockItem
          // topBorder={!canShowPrivateData(keyRingStore.keyRingType)}
          />
        ) : null}
        {/* <SettingSectionTitle title="Others" /> */}
        <SettingItem
          label="About OWallet"
          // topBorder={true}
          onPress={() => {
            smartNavigation.navigateSmart('Setting.Version', {});
          }}
        />
        <SettingRemoveAccountItem topBorder={true} />
        {/* Mock element for padding bottom */}
        <View style={style.get('height-16')} />
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
