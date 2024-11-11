import React, { FunctionComponent } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { typography, metrics } from '../../../themes';
import { capitalizeFirstLetter, _keyExtract } from '../../../utils/helper';
import { Text } from '@src/components/text';
import { AppInit } from '@src/stores/app_init';
import { ModalStore } from '../../../stores/modal';
import OWIcon from '@src/components/ow-icon/ow-icon';
import OWFlatList from '@src/components/page/ow-flat-list';
import { ChainStore } from '@owallet/stores';
import { ChainIdEnum } from '@owallet/common';
import OWText from '@src/components/text/ow-text';

interface ThemeModalProps {
  modalStore: ModalStore;
  appInitStore: AppInit;
  colors: object;
}

const themes = [
  { label: 'light', isNew: false },
  { label: 'dark', isNew: false }
  // { label: "osmosis", isNew: true },
  // { label: "injective", isNew: true },
];

export const ThemeModal: FunctionComponent<ThemeModalProps> = ({ appInitStore, modalStore, colors }) => {
  const onChooseTheme = async item => {
    if (item.label !== 'light' && item.label !== 'dark') {
      appInitStore.updateTheme('dark');
      appInitStore.updateWalletTheme(item.label);
    } else {
      appInitStore.updateTheme(item.label);
      appInitStore.updateWalletTheme('owallet');
    }
    modalStore.close();
  };

  const renderTheme = ({ item }) => {
    let icon;

    let selected = false;

    if (appInitStore.getInitApp.wallet === 'owallet') {
      if (appInitStore.getInitApp.theme === item.label) {
        selected = true;
      }
    } else {
      if (appInitStore.getInitApp.wallet === item.label) {
        selected = true;
      }
    }

    switch (item.label) {
      case 'light':
        icon = <OWIcon type={'images'} style={styles.img} source={require('@src/assets/images/theme-light.png')} />;
        break;
      case 'dark':
        icon = <OWIcon type={'images'} style={styles.img} source={require('@src/assets/images/theme-dark.png')} />;
        break;
      case 'osmosis':
        icon = <OWIcon type={'images'} style={styles.img} source={require('@src/assets/images/theme-osmo.png')} />;
        break;
      case 'injective':
        icon = <OWIcon type={'images'} style={styles.img} source={require('@src/assets/images/theme-inj.png')} />;
        break;

      default:
        icon = <OWIcon name="tdesign_moon" color={colors['white']} size={18} />;
        break;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          onChooseTheme(item);
        }}
        style={{
          width: metrics.screenWidth / 2.3,
          height: metrics.screenWidth / 2,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {icon}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selected ? (
            <OWIcon name={'tdesigncheck-circle-filled'} color={colors['primary-surface-default']} size={14} />
          ) : null}
          <OWText style={{ marginLeft: 4 }} size={16} weight="600" color={colors['neutral-text-title']}>
            {capitalizeFirstLetter(item.label)}
          </OWText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors['neutral-surface-card']
      }}
    >
      <View
        style={{
          alignSelf: 'center'
        }}
      >
        <Text
          style={{
            ...typography.h6,
            fontWeight: '900',
            color: colors['neutral-text-title']
          }}
        >
          {`THEME`}
        </Text>
      </View>
      <View
        style={{
          marginTop: 16
        }}
      >
        <OWFlatList
          data={themes}
          renderItem={renderTheme}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListFooterComponent={
            <View style={{ marginTop: 12 }}>
              <Text color={colors['neutral-text-body']} size={13}>
                Seamlessly experience the Osmosis and Injective themes on OWallet
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between'
  },
  itemContainer: {
    padding: 24,
    alignItems: 'center'
  },
  img: {
    width: metrics.screenWidth / 2.4,
    height: metrics.screenWidth / 2.3
  }
});
