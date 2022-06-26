import React, { FunctionComponent } from 'react';
import { StyleSheet, Text, ViewStyle, View } from 'react-native';
import { useStyle } from '../../styles';
import { Bech32Address } from '@owallet/cosmos';
import Clipboard from 'expo-clipboard';
import { RectButton } from '../rect-button';
import { CopyIcon } from '../icon';
import { useSimpleTimer } from '../../hooks';

export const AddressCopyable: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  maxCharacters: number;
}> = ({ style: propStyle, address, maxCharacters }) => {
  const style = useStyle();
  const { analyticsStore, chainStore } = useStore();
  const { isTimedOut, setTimer } = useSimpleTimer();

  return (
    <RectButton
      style={{
        backgroundColor: '#F8EFFF',
        paddingLeft: 12,
        paddingRight: 8,
        marginTop: 2,
        marginBottom: 2,
        borderRadius: 12,
        height: 30,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        ...propStyle,
      }}
      onPress={() => {
        analyticsStore.logEvent("Address copied", {
          chainId: chainStore.current.chainId,
          chainName: chainStore.current.chainName,
        });
        Clipboard.setString(address);
        setTimer(2000);
      }}
      rippleColor={style.get('color-button-primary-outline-ripple').color}
      underlayColor={style.get('color-button-primary-outline-underlay').color}
      activeOpacity={1}
    >
      <Text style={{ fontSize: 14, color: '#5F5E77' }}>
        {Bech32Address.shortenAddress(address, maxCharacters)}
      </Text>
      <View
        style={{
          marginLeft: 4,
          width: 20,
        }}
      >
        {isTimedOut ? (
          <View style={{ marginLeft: 2 }}>
            <View
              style={{
                width: 20,
                height: 20,
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                  left: 0,
                  right: 4,
                  top: 0,
                  bottom: 0,
                }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                  }}
                >
                  <Text>Check here</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <CopyIcon color={style.get('color-primary').color} size={19} />
        )}
      </View>
    </RectButton>
  );
};
