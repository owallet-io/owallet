import { StyleSheet, View } from 'react-native';
import React from 'react';
import { registerModal } from '@src/modals/base';

import { CardModal } from '@src/modals/card';
import { Text } from '@src/components/text';
import OWFlatList from '@src/components/page/ow-flat-list';
import images from '@src/assets/images';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { useTheme } from '@src/themes/theme-provider';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { metrics } from '@src/themes';
const dataFake = [
  {
    symbol: 'USDT',
    networkChain: 'Ethereum',
    available: 0,
    networkLogo: images.push,
    isCheck: true
  },
  {
    symbol: 'USDT',
    networkChain: 'BSC',
    available: 0,
    networkLogo: images.push_inactive
  },
  {
    symbol: 'ORAI',
    networkChain: 'Oraichain',
    available: 0,
    networkLogo: images.crypto
  },

  {
    symbol: 'USDT',
    networkChain: 'TRON',
    available: 0,
    networkLogo: images.push
  },
  {
    symbol: 'USDT',
    networkChain: 'COSMOS',
    available: 0,
    networkLogo: images.push
  },
  {
    symbol: 'USDT',
    networkChain: 'Omosis',
    available: 0,
    networkLogo: images.push
  }
];
export const SelectNetworkModal = registerModal(({ close }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: metrics.screenHeight / 2
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          paddingBottom: 20,
          paddingTop: 10
        }}
        weight="500"
        size={16}
      >
        Select Network
      </Text>
      <OWFlatList
        data={dataFake}
        isBottomSheet
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                close();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 35,
                paddingVertical: 15,
                borderTopWidth: 0.5,
                borderColor: colors['blue/Border-50']
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems:"center"
                }}
              >
                <OWIcon type="images" size={30} source={item.networkLogo} />
                <Text
                  style={{
                    paddingLeft: 24
                  }}
                  size={16}
                  weight="500"
                  color={colors['gray-500']}
                >
                  {item?.networkChain}
                </Text>
              </View>
              {item?.isCheck && (
                <OWIcon
                  name="check_stroke"
                  color={colors['green-500']}
                  size={18}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({});
