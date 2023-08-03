import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Button
} from 'react-native';
import React, { FunctionComponent, useRef } from 'react';
import { registerModal } from '@src/modals/base';
import images from '@src/assets/images';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OWFlatList from '@src/components/page/ow-flat-list';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';

import { useTheme } from '@src/themes/theme-provider';
import { metrics } from '@src/themes';
import { OWButton } from '@src/components/button';

export const SelectTokenModal: FunctionComponent<{
  onNetworkModal?: () => void;
}> = registerModal(({ close, onNetworkModal }) => {
  const dataFake = [
    {
      symbol: 'USDT',
      networkChain: 'Ethereum',
      available: 0,
      symbolLogo: images.push
    },
    {
      symbol: 'USDT',
      networkChain: 'BSC',
      available: 0,
      symbolLogo: images.push_inactive
    },
    {
      symbol: 'ORAI',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.crypto
    },
    {
      symbol: 'AIRI',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.down_center
    },
    {
      symbol: 'ORAIX',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.down_center_dark
    },
    {
      symbol: 'ETH',
      networkChain: 'Ethereum',
      available: 0,
      symbolLogo: images.push
    },
    {
      symbol: 'USDT',
      networkChain: 'Ethereum',
      available: 0,
      symbolLogo: images.push
    },
    {
      symbol: 'USDT',
      networkChain: 'BSC',
      available: 0,
      symbolLogo: images.push_inactive
    },
    {
      symbol: 'ORAI',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.crypto
    },
    {
      symbol: 'AIRI',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.down_center
    },
    {
      symbol: 'ORAIX',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.down_center_dark
    },
    {
      symbol: 'ETH',
      networkChain: 'Ethereum',
      available: 0,
      symbolLogo: images.push
    },
    {
      symbol: 'USDT',
      networkChain: 'Ethereum',
      available: 0,
      symbolLogo: images.push
    },
    {
      symbol: 'USDT',
      networkChain: 'BSC',
      available: 0,
      symbolLogo: images.push_inactive
    },
    {
      symbol: 'ORAI',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.crypto
    },
    {
      symbol: 'AIRI',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.down_center
    },
    {
      symbol: 'ORAIX',
      networkChain: 'Oraichain',
      available: 0,
      symbolLogo: images.down_center_dark
    },
    {
      symbol: 'ETH',
      networkChain: 'Ethereum',
      available: 0,
      symbolLogo: images.push
    }
  ];

  const safeAreaInsets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    // <ScrollView
    //   keyboardDismissMode="interactive"
    //   keyboardShouldPersistTaps="handled"
    //   style={{
    //     paddingBottom: safeAreaInsets.bottom
    //   }}
    // >
    <View
      style={{
        paddingHorizontal: 24,
        paddingBottom: safeAreaInsets.bottom,
        height: metrics.screenHeight
      }}
    >
      <View>
        <TextInput
          style={{
            paddingVertical: 0,
            height: 40,
            backgroundColor: colors['box-nft'],
            borderRadius: 8,
            paddingLeft: 35,
            fontSize: 16,
            marginVertical: 10
          }}
          placeholder="Search Token"
        />
        <View
          style={{
            position: 'absolute',
            left: 12,
            top: 22
          }}
        >
          <OWIcon color={colors['blue-300']} name="search" size={16} />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text color={'#7C8397'} weight="500">
          List Token
        </Text>
        <TouchableOpacity
          onPress={() => {
            onNetworkModal();
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <OWIcon type="images" source={images.push} size={16} />
          <Text
            style={{
              paddingHorizontal: 4
            }}
            color={'#7C8397'}
            weight="500"
          >
            Network
          </Text>
          <OWIcon size={16} color={'#7C8397'} name="down" />
        </TouchableOpacity>
      </View>
      <OWFlatList
        isBottomSheet
        keyboardShouldPersistTaps="handled"
        data={dataFake}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                close();
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginVertical: 10
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <OWIcon type="images" source={item.symbolLogo} size={35} />
                <View
                  style={{
                    paddingLeft: 10
                  }}
                >
                  <Text size={16} weight="500">
                    {item.symbol}
                  </Text>
                  <Text weight="500" color="#7C8397">
                    {item.networkChain}
                  </Text>
                </View>
              </View>
              <Text>{item.available}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
    // </ScrollView>
  );
});

const styles = StyleSheet.create({});
