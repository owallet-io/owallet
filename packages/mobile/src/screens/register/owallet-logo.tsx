import React, { FunctionComponent } from 'react';
import { View, Image } from 'react-native';

export const OWalletLogo = ({ size }) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Image
        style={{
          width: size || 120,
          height: size || 120
        }}
        source={require('../../assets/logo/splash-background-owallet.png')}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
};

export const OWalletUnion: FunctionComponent = () => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Image
        style={{
          width: 28,
          height: 16
        }}
        source={require('../../assets/logo/splash-union.png')}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
};

export const OWalletStar: FunctionComponent = () => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Image
        style={{
          width: 20,
          height: 20
        }}
        source={require('../../assets/logo/splash-star.png')}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
};
