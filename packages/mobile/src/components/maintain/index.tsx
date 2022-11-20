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
        alignItems: 'center'
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
          color: colors['purple-700'],
          textAlign: 'center',
          fontWeight: '600',
          fontSize: 16,
          lineHeight: 22,
          opacity: 1,
          paddingBottom: 20
        }}
      >
        Maintaining
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
