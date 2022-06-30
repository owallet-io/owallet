import React, {
  FunctionComponent,
  ReactElement,
  useMemo,
  useState
} from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { colors, metrics, spacing, typography } from '../../../themes';
import { _keyExtract } from '../../../utils/helper';
import { CText as Text } from '../../../components/text';
import { KeyStoreItem } from '.';
import { CoinGeckoPriceStore } from '@owallet/stores';
import { ModalStore } from '../../../stores/modal';

interface CountryModalProps {
  data: any;
  current: any;
  priceStore: CoinGeckoPriceStore;
  modalStore: ModalStore
}

export const CountryModal: FunctionComponent<CountryModalProps> = ({
  data,
  current,
  priceStore,
  modalStore
}) => {
  const _renderItem = ({ item, index }) => {
    return (
      <KeyStoreItem
        key={index.toString()}
        label={item.label || 'USD'}
        active={current === item.key ? true : false}
        onPress={() => {
          priceStore.setDefaultVsCurrency(item.key || 'usd');
          modalStore.close()
        }}
      />
    );
  };

  return (
    // container
    <View
      style={{
        alignItems: 'center'
      }}
    >
      <View
        style={{
          justifyContent: 'flex-start'
        }}
      >
        <Text
          style={{
            ...typography.h6,
            fontWeight: '900',
            color: colors['gray-900']
          }}
        >
          {`Select Currency`}
        </Text>
      </View>

      <View
        style={{
          marginTop: spacing['12'],
          height: metrics.screenHeight / 2
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={_renderItem}
          keyExtractor={_keyExtract}
          ListFooterComponent={() => (
            <View
              style={{
                height: spacing['10']
              }}
            />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerBtn: {
    backgroundColor: colors['gray-10'],
    paddingVertical: spacing['16'],
    borderRadius: spacing['8'],
    paddingHorizontal: spacing['16'],
    flexDirection: 'row',
    marginTop: spacing['16'],
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});
