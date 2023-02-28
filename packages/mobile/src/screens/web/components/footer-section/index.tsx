import React, { FunctionComponent } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CText as Text } from '../../../../components/text';
import { useStyle } from '../../../../styles';
import { useWebViewState } from '../context';
import { useNavigation } from '@react-navigation/core';

import {
  BrowserIcon,
  RightLightIcon,
  LeftLightIcon,
  HomeLightIcon,
  ThreeDotIcon,
  RefreshIcon
} from '../../../../components/icon';
import { BrowserSectionModal } from '../section-title';
import { useStore } from '../../../../stores';
import { observer } from 'mobx-react-lite';
import { colors } from '../../../../themes';

export const BrowserFooterSection: FunctionComponent<{
  isSwitchTab: boolean;
  setIsSwitchTab: Function;
  onHandleUrl?: Function;
  typeOf: string;
}> = observer(({ isSwitchTab, setIsSwitchTab, onHandleUrl, typeOf }) => {
  const style = useStyle();
  const { browserStore, modalStore } = useStore();
  const navigation = useNavigation();
  const webViewState = useWebViewState();

  const oraiLogo = require('../../../../assets/image/webpage/orai_logo.png');

  const onPressBookmark = () => {
    modalStore.close();
    if (webViewState.webView) {
      browserStore.addBoorkmark({
        id: Date.now(),
        name: webViewState.name,
        logo: oraiLogo,
        uri: webViewState.url
      });
    }
  };

  const onPress = (type: any) => {
    try {
      switch (type) {
        case 'settings':
          if (typeOf === 'webview') {
            if (webViewState.webView) {
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
          setIsSwitchTab(!isSwitchTab);
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
  const arrayIcon = ['back', 'next', 'tabs', 'home', 'settings'];
  const renderIcon = (type, tabNum = 0) => {
    switch (type) {
      case 'back':
        return (
          <TouchableOpacity style={{ width: 30 }} onPress={() => onPress(type)}>
            <LeftLightIcon />
          </TouchableOpacity>
        );
      case 'next':
        return (
          <TouchableOpacity style={{ width: 30 }} onPress={() => onPress(type)}>
            <RightLightIcon />
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
                borderColor: colors['gray-600'],
                width: 22,
                height: 22
              }}
            >
              <Text style={{ color: colors['gray-600'] }}>
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
              <HomeLightIcon size={22} />
            ) : (
              <BrowserIcon color={'#636366'} size={22} />
            )}
          </TouchableOpacity>
        );
      case 'settings':
        return (
          <TouchableOpacity style={{ width: 30 }} onPress={() => onPress(type)}>
            <RefreshIcon color={'#636366'} size={22} />
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
          backgroundColor: '#fff'
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
