import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Card } from '../../../components/card';
import { CText as Text } from '../../../components/text';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../themes';

export const InfoCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.headerWrapper}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: spacing['8']
          }}
        >
          <View
            style={{
              width: 12,
              height: 24,
              backgroundColor: '#B1E5FC',
              borderRadius: 4,
              marginRight: 8
            }}
          />
          <Text
            style={{
              color: colors['gray-900'],
              fontWeight: '700',
              fontSize: 14
            }}
          >
            Get more information!
          </Text>
        </View>
        <Text
          style={{
            color: colors['gray-800'],
            fontWeight: '400',
            fontSize: 14,
            lineHeight: 20
          }}
        >
          For more details about{' '}
          <Text
            style={{
              color: colors['gray-800'],
              fontWeight: '700',
              fontSize: 14,
              lineHeight: 20
            }}
          >
            ORAI
          </Text>{' '}
          and more, please visit{' '}
          <Text
            style={{
              color: '#4C72F9',
              fontWeight: '400',
              fontSize: 14,
              lineHeight: 20
            }}
          >
            info.oraidex.io
          </Text>
        </Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  headerWrapper: {
    paddingBottom: 40
  },
  card: {
    padding: spacing['28'],
    paddingBottom: spacing['14'],
    marginBottom: spacing['32'],
    borderRadius: spacing['24'],
    backgroundColor: colors['white']
  }
});
