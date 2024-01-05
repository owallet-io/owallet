import React, { FunctionComponent } from 'react';
import { colors, spacing } from '../../themes';
import { Image, Text, View } from 'react-native';

export const MaintainScreen: FunctionComponent<{}> = () => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
      }}
    >
      <View
        style={{
          marginBottom: spacing['24']
        }}
      >
        <Image
          style={{
            height: 70,
            width: 70
          }}
          fadeDuration={0}
          resizeMode="contain"
          source={require('../../assets/logo/splash-image.png')}
        />
      </View>
      <Text
        style={{
          color: colors['primary-surface-default'],
          textAlign: 'center',
          fontSize: 14,
          lineHeight: 22,
          opacity: 1,
          paddingBottom: 20
        }}
      >
        {`To prepare for v0.41.0 Upgrade, services on Oraichain network will be temporarily suspended until our next official announcement. \nTime (estimated): \nFrom 2022-11-20 23:59 to 2022-11-21 09:00 (UTC)`}
      </Text>
      <Image
        style={{
          width: 300,
          height: 8
        }}
        fadeDuration={0}
        resizeMode="stretch"
        source={require('../../assets/image/transactions/process_pedding.gif')}
      />
    </View>
  );
};
