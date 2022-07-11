import React, { FunctionComponent } from 'react';
import { KeyStoreItem, RightArrow } from '../components';
import { useStyle } from '../../../styles';
import { useSmartNavigation } from '../../../navigation.provider';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { View } from 'react-native';

export const SettingSelectAccountItem: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const selected = keyRingStore.multiKeyStoreInfo.find(
    (keyStore) => keyStore.selected
  );

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <>
      <View
        style={style.flatten(['height-1', 'background-color-border-white'])}
      />
      <KeyStoreItem
        containerStyle={style.flatten(['padding-left-10'])}
        label={
          selected ? selected.meta?.name || 'OWallet Account' : 'No Account'
        }
        onPress={() => {
          smartNavigation.navigateSmart('SettingSelectAccount', {});
        }}
      />
      <View
        style={style.flatten(['height-1', 'background-color-border-white'])}
      />
    </>
  );
});
