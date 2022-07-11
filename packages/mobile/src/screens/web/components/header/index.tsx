import React, { FunctionComponent } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { useHeaderHeight } from '@react-navigation/stack';
import { useStyle } from '../../../../styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWebViewState } from '../context';
import { RectButton } from '../../../../components/rect-button';
import { useNavigation } from '@react-navigation/core';
import { RefreshIcon } from '../../../../components/icon';

export const OnScreenWebpageScreenHeader: FunctionComponent = () => {
  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const actualHeaderHeight = headerHeight - safeAreaInsets.top;

  const navigation = useNavigation();

  const webViewState = useWebViewState();

  return (
    <View
      style={StyleSheet.flatten([
        {
          width: '100%',
          height: headerHeight,
          // If the iPhone has notch, add the extra bottom space for header.
          // Because of the lack of space, it slightly invades the notch, giving it a bit more space.
          paddingTop:
            safeAreaInsets.top -
            (Platform.OS === 'ios' && safeAreaInsets.top > 44 ? 6 : 0)
        },
        style.flatten(['background-color-white', 'flex-row', 'items-center'])
      ])}
    >
      <View
        style={StyleSheet.flatten([
          style.flatten(['width-full', 'items-center', 'justify-center']),
          {
            height: actualHeaderHeight
          }
        ])}
      >
        {/* Name and refresh icon on center */}
        <RectButton
          style={style.flatten([
            'flex-row',
            'items-center',
            'border-radius-4',
            'padding-left-12',
            'padding-right-10',
            'padding-y-5'
          ])}
          onPress={() => {
            if (webViewState.webView) {
              webViewState.webView.reload();
            }
          }}
        >
          <Text
            style={style.flatten([
              'h4',
              'color-text-black-medium',
              'margin-right-8'
            ])}
          >
            {webViewState.name}
          </Text>
          <RefreshIcon
            size={20}
            color={style.get('color-text-black-very-very-low').color}
          />
        </RectButton>

        {/* Other buttons like the back, forward, home... */}
        <View
          style={StyleSheet.flatten([
            style.flatten([
              'absolute',
              'width-full',
              'flex-row',
              'items-center'
            ]),
            {
              left: 0,
              height: actualHeaderHeight
            }
          ])}
          pointerEvents="box-none"
        >
          <View style={style.get('flex-1')} />
        </View>
      </View>
    </View>
  );
};
