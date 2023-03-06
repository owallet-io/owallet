import { useNavigation } from '@react-navigation/core';
import React, { FunctionComponent } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { useStyle } from '../../../../styles';
import { useWebViewState } from '../context';

import { observer } from 'mobx-react-lite';
import {
  BrowserIcon,
  HomeLightIcon,
  LeftLightIcon,
  RefreshIcon,
  RightLightIcon
} from '../../../../components/icon';
import { useStore } from '../../../../stores';
import { colors } from '../../../../themes';
import { useTheme } from '@react-navigation/native';

export const BrowserFooterSection: FunctionComponent<{
  isSwitchTab: boolean;
  setIsSwitchTab: Function;
  onHandleUrl?: Function;
  typeOf: string;
}> = observer(({ isSwitchTab, setIsSwitchTab, onHandleUrl, typeOf }) => {
  const style = useStyle();
  const { colors } = useTheme();
  const { browserStore } = useStore();
  const navigation = useNavigation();
  const webViewState = useWebViewState();

  const onPress = (type: any) => {
    try {
      switch (type) {
        case 'reload':
          if (typeOf === 'webview') {
            if (webViewState.webView) {
              if (Platform.OS === 'android') {
                webViewState.webView.clearCache(true);
              }
              webViewState.webView.reload();
            }
          }
          return;
        case 'back':
          if (typeOf === 'browser') {
            return navigation.navigate('Home', {});
          }
          if (!webViewState.canGoBack) {
            webViewState.clearWebViewContext();
            navigation.goBack();
          } else if (webViewState.webView) {
            webViewState.webView.goBack();
          }
          return;
        case 'next':
          if (webViewState.webView) {
            webViewState.webView.goForward();
          } else {
            onHandleUrl();
          }
          return;
        case 'tabs':
          if (browserStore.getTabs.length === 0) {
            setIsSwitchTab(false);
          } else {
            setIsSwitchTab(!isSwitchTab);
          }
          return;
        case 'home':
          if (typeOf === 'browser') {
            return navigation.navigate('Home', {});
          }
          return navigation.navigate('Browser', {});
      }
    } catch (error) {
      console.log({ error });
    }
  };
  const arrayIcon = ['back', 'next', 'tabs', 'home', 'reload'];
  const renderIcon = type => {
    switch (type) {
      case 'back':
        return (
          <TouchableOpacity style={{ width: 30 }} onPress={() => onPress(type)}>
            <LeftLightIcon color={colors['icon']} />
          </TouchableOpacity>
        );
      case 'next':
        return (
          <TouchableOpacity style={{ width: 30 }} onPress={() => onPress(type)}>
            <RightLightIcon color={colors['icon']} />
          </TouchableOpacity>
        );
      case 'tabs':
        return (
          <TouchableOpacity style={{ width: 30 }} onPress={() => onPress(type)}>
            <View
              style={{
                padding: 1.5,
                borderWidth: 0.5,
                borderRadius: 4,
                alignItems: 'center',
                borderColor: colors['icon'],
                width: 22,
                height: 22
              }}
            >
              <Text style={{ color: colors['icon'] }}>
                {browserStore.getTabs.length > 9
                  ? '9+'
                  : browserStore.getTabs.length}
              </Text>
            </View>
          </TouchableOpacity>
        );
      case 'home':
        return (
          <TouchableOpacity style={{ width: 30 }} onPress={() => onPress(type)}>
            {typeOf === 'browser' ? (
              <HomeLightIcon color={colors['icon']} size={22} />
            ) : (
              <BrowserIcon color={colors['icon']} size={22} />
            )}
          </TouchableOpacity>
        );
      case 'reload':
        return (
          <TouchableOpacity style={{ width: 30 }} onPress={() => onPress(type)}>
            <RefreshIcon color={colors['icon']} size={22} />
          </TouchableOpacity>
        );
    }
  };

  return (
    <View
      style={[
        {
          bottom: 0,
          borderTopColor: colors['gray-300'],
          borderTopWidth: 0.2,
          backgroundColor: colors['background']
        },
        style.flatten([
          'width-full',
          'height-80',
          'flex-row',
          'items-center',
          'padding-40',
          'absolute'
        ])
      ]}
    >
      <View
        style={style.flatten([
          'width-full',
          'height-80',
          'flex-row',
          'items-center'
        ])}
      >
        {arrayIcon.map((e, i) => {
          return (
            <View key={i} style={{ width: '24%' }}>
              {renderIcon(e)}
            </View>
          );
        })}
      </View>
    </View>
  );
});
