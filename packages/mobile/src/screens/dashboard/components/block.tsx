import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Card } from '../../../components/card';
import { CText as Text } from '../../../components/text';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../themes';
import { useStore } from '../../../stores';
import { ActivityIcon, ClockIcon } from '../../../components/icon';
import FastImage from 'react-native-fast-image';

export const BlockCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({}) => {
  const { chainStore } = useStore();

  const renderBlockInfo = (title, value, sub, color, isBottom) => {
    return (
      <View
        style={[
          styles.blockWrapper,
          isBottom
            ? {
                borderBottomWidth: 0,
                paddingBottom: 0
              }
            : null
        ]}
      >
        {/* <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: color
          }}
        /> */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ActivityIcon />
        </View>
        <View style={{ paddingLeft: 33 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <ClockIcon size={18} color={colors['gray-700']} />
            <Text style={styles.blockTitle}>{'  '}Last block height</Text>
          </View>

          <Text style={styles.blockValue}>8,010,033</Text>
          <Text style={styles.blockSub}>13s ago</Text>
        </View>
      </View>
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerWrapper}>
        <View style={[styles.blockWrapper, { paddingTop: 0 }]}>
          <FastImage
            style={{
              width: 48,
              height: 48,
              borderRadius: 24
            }}
            resizeMode={FastImage.resizeMode.contain}
            source={{
              uri: chainStore.current.stakeCurrency.coinImageUrl
            }}
          />
          <View style={{ paddingLeft: 33 }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              <ClockIcon size={18} color={colors['gray-700']} />
              <Text style={styles.blockTitle}>{'  '}Block time 6.08ms</Text>
            </View>
            <Text style={styles.blockValue}>$113</Text>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: colors['purple-10'],
                borderRadius: 4,
                marginBottom: 4
              }}
            >
              <Text style={[styles.blockSub, { lineHeight: 20 }]}>
                Coingecko :{' '}
                <Text
                  style={[
                    styles.blockSub,
                    { lineHeight: 20, color: colors['danger-300'] }
                  ]}
                >
                  -7.59% (24h)
                </Text>
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Text style={[styles.blockSub, { lineHeight: 20 }]}>
                Market Cap
              </Text>
              <Text style={{ fontWeight: '700', lineHeight: 20 }}>
                $4,727,867
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Text style={[styles.blockSub, { lineHeight: 20 }]}>24h Vol</Text>
              <Text style={{ fontWeight: '700', lineHeight: 20 }}>$4,727</Text>
            </View>
          </View>
        </View>
        {renderBlockInfo(1, 1, 1, colors['profile-green'], false)}
        {renderBlockInfo(1, 1, 1, colors['purple-400'], false)}
        {renderBlockInfo(1, 1, 1, colors['blue-300'], true)}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  headerWrapper: {
    alignItems: 'center',
    paddingBottom: 40
  },
  card: {
    padding: spacing['28'],
    paddingBottom: spacing['14'],
    marginBottom: spacing['32'],
    borderRadius: spacing['24'],
    backgroundColor: colors['white']
  },
  blockWrapper: {
    flexDirection: 'row',
    borderBottomColor: colors['gray-100'],
    borderBottomWidth: 1,
    width: '100%',
    padding: 24,
    alignItems: 'center'
  },
  blockTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors['gray-800']
  },
  blockValue: {
    fontSize: 34,
    fontWeight: '500',
    lineHeight: 50,
    color: colors['gray-900']
  },
  blockSub: {
    fontSize: 12,
    lineHeight: 16,
    color: colors['gray-600']
  }
});
