import { StyleSheet, TextInput, View, TouchableOpacity, Button } from 'react-native';
import React from 'react';
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

export const SelectTokenModal = registerModal(({ close }) => {
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
            borderRadius: 20,
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

      <View style={{
        flexDirection:'row',
        justifyContent:"space-between",
        alignItems:"center"
      }}>
      <Text weight="700">Tokens List</Text>
      <OWButton 
      type='link'
      size='small'
      fullWidth={false}
      label='Network'
      />
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
                  <Text size={16} weight="700">
                    {item.symbol}
                  </Text>
                  <Text>{item.networkChain}</Text>
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
