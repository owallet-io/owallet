import React, { FunctionComponent, ReactElement, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { RectButton } from '../../../components/rect-button';
import { colors, metrics, spacing, typography } from '../../../themes';
import { _keyExtract } from '../../../utils/helper';
import FastImage from 'react-native-fast-image';
import { VectorCharacter } from '../../../components/vector-character';
import { CText as Text } from '../../../components/text';

export const NetworkModal = ({ profileColor, chainStore, modalStore }) => { 
  const _renderItem = ({ item }) => {
    return (
      <RectButton
        style={{
          ...styles.containerBtn
        }}
        onPress={() => {
          chainStore.selectChain(item.chainId);
          chainStore.saveLastViewChainId();
          modalStore.close();
        }}
      >
        <View
          style={{
            justifyContent: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              height: 38,
              width: 38,
              padding: spacing['2'],
              borderRadius: spacing['12'],
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: profileColor?.(item) ?? colors['purple-400']
            }}
          >
            {item.raw.chainSymbolImageUrl ? (
              <FastImage
                style={{
                  width: 24,
                  height: 24
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  uri: item.raw.chainSymbolImageUrl
                }}
              />
            ) : (
              <VectorCharacter
                char={item.chainName[0]}
                height={15}
                color={colors['white']}
              />
            )}
          </View>

          <View
            style={{
              ...typography.h7,
              color: colors['gray-300'],
              fontWeight: '900',
              fontSize: 12,
            }}
          >
            <Text
              style={{
                ...typography.h6,
                color: colors['gray-900'],
                fontWeight: '900'
              }}
              numberOfLines={1}
            >
              {item.chainName}
            </Text>
            <Text
              style={{
                ...typography.h7,
                color: colors['gray-300'],
                fontWeight: '900',
                fontSize: 12
              }}
            >{`$${item.price || 0}`}</Text>
          </View>
        </View>

      <View>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: spacing['32'],
            backgroundColor: colors['primary'],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: spacing['32'],
              backgroundColor:
                item.chainId === chainStore.current.chainId
                  ? colors['purple-900']
                  : colors['gray-100'],
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: spacing['32'],
                backgroundColor: colors['white']
              }}
            />
          </View>
        </View>
      </RectButton>
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
          {`Select networks`}
        </Text>
      </View>

      <View
        style={{
          marginTop: spacing['12'],
          width: metrics.screenWidth - 48,
          justifyContent: 'space-between',
          height: metrics.screenHeight / 2
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          data={chainStore.chainInfosInUI}
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
