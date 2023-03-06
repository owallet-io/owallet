import React, { FunctionComponent, useEffect } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

import {
  View,
  Animated,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import { CText as Text } from '../../components/text';
import { useSmartNavigation } from '../../navigation.provider';
import { RightArrowIcon } from '../../components/icon';
import * as WebBrowser from 'expo-web-browser';
import { Card } from '../../components/card';
import { colors, metrics } from '../../themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

export const TxFailedResultScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash: string;
        }
      >,
      string
    >
  >();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;
  const txHash = route.params.txHash;

  const smartNavigation = useSmartNavigation();
  const chainInfo = chainStore.getChain(chainId);
  const { bottom } = useSafeAreaInsets();

  return (
    <View>
      <Card
        style={{
          backgroundColor: colors['white'],
          marginTop: 78,
          borderRadius: 24
        }}
      >
        <View
          style={{
            height: metrics.screenHeight - bottom - 74,
            paddingTop: 80
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Image
              style={{
                width: 24,
                height: 2
              }}
              fadeDuration={0}
              resizeMode="stretch"
              source={require('../../assets/image/transactions/line_fail_short.png')}
            />
            <Image
              style={{
                width: 140,
                height: 32,
                marginLeft: 8,
                marginRight: 9
              }}
              fadeDuration={0}
              resizeMode="stretch"
              source={require('../../assets/image/transactions/fail.png')}
            />
            <Image
              style={{
                width: metrics.screenWidth - 185,
                height: 2
              }}
              fadeDuration={0}
              resizeMode="stretch"
              source={require('../../assets/image/transactions/line_fail_short.png')}
            />
          </View>
          <View
            style={{
              paddingLeft: 32,
              paddingRight: 72
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 24,
                lineHeight: 34,
                paddingTop: 44,
                paddingBottom: 16
              }}
            >
              Transaction fail
            </Text>
            <Text
              style={{
                fontWeight: '400',
                fontSize: 14,
                lineHeight: 20,
                color: colors['gray-150']
              }}
            >
              Please try again!
            </Text>
            <Text
              style={{
                fontWeight: '400',
                fontSize: 14,
                lineHeight: 20,
                color: colors['gray-150'],
                paddingTop: 6
              }}
            >
              The transaction cannot be completed.
            </Text>
            {chainInfo.raw.txExplorer ? (
              <TouchableOpacity
                style={{
                  paddingTop: 32,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                onPress={() => {
                  if (chainInfo.raw.txExplorer) {
                    WebBrowser.openBrowserAsync(
                      chainInfo.raw.txExplorer.txUrl.replace(
                        '{txHash}',
                        txHash.toUpperCase()
                      )
                    );
                  }
                }}
              >
                <Image
                  style={{
                    width: 22,
                    height: 22
                  }}
                  fadeDuration={0}
                  resizeMode="stretch"
                  source={require('../../assets/image/transactions/eye.png')}
                />
                <Text
                  style={{
                    paddingLeft: 6,
                    color: colors['purple-900'],
                    fontWeight: '400',
                    fontSize: 16,
                    lineHeight: 22
                  }}
                >
                  View on Explorer
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={{
              marginTop: 32,
              marginLeft: 25,
              marginRight: 25,
              backgroundColor: colors['purple-900'],
              borderRadius: 8
            }}
            onPress={() => {
              smartNavigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: 'MainTab' }]
                })
              );
            }}
          >
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 16,
                padding: 16
              }}
            >
              Go Home
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
});
