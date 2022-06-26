import React, { FunctionComponent, useEffect, useState } from 'react';
// import { PageWithScrollViewInBottomTabView } from "../../components/page";
import {
  Image,
  Text,
  View,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useStyle } from '../../styles';
import { TextInput } from '../../components/input';
// import { Button } from "../../components/button";
import { useSmartNavigation } from '../../navigation.provider';
import { PageWithScrollView } from '../../components/page';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useNavigation } from '@react-navigation/core';
import {
  BrowserSectionTitle,
  BrowserSectionModal,
} from './components/section-title';
import {
  SearchIcon,
  RightArrowIcon,
  HomeIcon,
  ThreeDotsIcon,
  TabIcon,
} from '../../components/icon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { checkValidDomain } from '../../utils/helper';
import { useStore } from '../../stores';
import { DAppInfos, InjectedProviderUrl } from './config';
import { SwtichTab } from './components/switch-tabs';
import { BrowserFooterSection } from './components/footer-section';
import { WebViewStateContext } from './components/context';

export const BrowserBookmark: FunctionComponent<{}> = ({}) => {
  const style = useStyle();
  const { browserStore } = useStore();
  const navigation = useNavigation();
  return (
    <React.Fragment>
      <View
        style={style.flatten([
          'width-full',
          'height-66',
          'flex-row',
          'justify-between',
          'items-center',
          'padding-20',
        ])}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '500',
            color: '#1C1C1E',
          }}
        >
          Bookmarks
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: '#4334F1',
          }}
        >
          {/* View all */}
        </Text>
      </View>
      <View
        style={style.flatten([
          'height-1',
          'margin-x-20',
          'background-color-border-white',
        ])}
      />
    </React.Fragment>
  );
};

export const Browser: FunctionComponent<any> = (props) => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const [isSwitchTab, setIsSwitchTab] = useState(false);
  const navigation = useNavigation();
  const { deepLinkUriStore, browserStore } = useStore();

  useEffect(() => {
    navigation
      .getParent()
      ?.setOptions({ tabBarStyle: { display: 'none' }, tabBarVisible: false });
    return () =>
      navigation
        .getParent()
        ?.setOptions({ tabBarStyle: undefined, tabBarVisible: undefined });
  }, [navigation]);

  useEffect(() => {
    if (props?.route?.params?.path) {
      updateScreen(props.route.params.path);
    }
  }, []);

  const updateScreen = async (uri) => {
    const deepLinkUri = uri || deepLinkUriStore.getDeepLink();
    if (deepLinkUri) {
      deepLinkUriStore.updateDeepLink('');
      smartNavigation.pushSmart('Web.dApp', {
        name: 'Browser',
        uri: decodeURIComponent(deepLinkUri) || 'https://oraidex.io',
      });
    }
  };

  const [url, setUrl] = useState('');

  useEffect(() => {
    setTimeout(function () {
      if (checkValidDomain(props?.route?.params?.url?.toLowerCase())) {
        smartNavigation.pushSmart('Web.dApp', {
          name: 'Browser',
          uri:
            props.route.params.url?.toLowerCase().indexOf('http') >= 0
              ? props.route.params.url?.toLowerCase()
              : 'https://' + props.route.params?.url?.toLowerCase(),
        });
      }
    }, 1000);
  }, [props, smartNavigation, url]);

  const onHandleUrl = () => {
    console.log('valid', checkValidDomain(url?.toLowerCase()));
    if (checkValidDomain(url?.toLowerCase())) {
      smartNavigation.pushSmart('Web.dApp', {
        name: 'Browser',
        uri:
          url?.toLowerCase().indexOf('http') >= 0
            ? url?.toLowerCase()
            : 'https://' + url?.toLowerCase(),
      });
    } else {
      let uri = `https://www.google.com/search?q=${url ?? ''}`;
      if (InjectedProviderUrl) uri = InjectedProviderUrl;
      smartNavigation.pushSmart('Web.dApp', {
        name: 'Google',
        // uri: `https://staging.oraidex.io/ethereum`,
        uri,
      });
    }
  };

  const handleClickUri = (uri: string, name: string) => {
    smartNavigation.pushSmart('Web.dApp', {
      name,
      uri,
    });
  };

  const handlePressItem = ({ name, uri }) => {
    handleClickUri(uri, name);
    setIsSwitchTab(false);
    setUrl(uri);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const renderBrowser = () => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (isKeyboardVisible) Keyboard.dismiss();
        }}
      >
        <View style={[style.flatten(['height-full', 'justify-between'])]}>
          <View>
            <BrowserSectionTitle title="Browser" />
            <View style={{ height: 260 }}>
              <Image
                style={{
                  width: '100%',
                  height: '100%',
                }}
                fadeDuration={0}
                resizeMode="stretch"
                source={require('../../assets/image/background.png')}
              />
              <TextInput
                containerStyle={{
                  width: '100%',
                  padding: 20,
                  marginTop: -50,
                }}
                inputStyle={style.flatten([
                  'flex-row',
                  'items-center',
                  'background-color-white',
                  'padding-20',
                  'border-radius-16',
                  'border-width-4',
                  'border-color-border-pink',
                ])}
                returnKeyType={'next'}
                placeholder={'Search website'}
                placeholderTextColor={'#AEAEB2'}
                onSubmitEditing={onHandleUrl}
                value={url}
                onChangeText={(txt) => setUrl(txt.toLowerCase())}
                inputRight={
                  <TouchableOpacity onPress={onHandleUrl}>
                    <SearchIcon color={'gray'} size={20} />
                  </TouchableOpacity>
                }
              />
            </View>
            <View
              style={style.flatten([
                'background-color-white',
                'height-full',
                'margin-top-64',
                'padding-bottom-64',
              ])}
            >
              <BrowserBookmark />
              <View style={style.flatten(['padding-20'])}>
                {browserStore.getBookmarks()?.map((e) => (
                  <TouchableOpacity
                    key={e.uri}
                    style={style.flatten([
                      'height-44',
                      'margin-bottom-15',
                      'flex-row',
                    ])}
                    onPress={() => {
                      handleClickUri(e.uri, e.name);
                      setUrl(e.uri);
                    }}
                  >
                    <View style={style.flatten(['padding-top-5'])}>
                      <Image
                        style={{
                          width: 20,
                          height: 22,
                        }}
                        source={e.logo}
                        fadeDuration={0}
                      />
                    </View>
                    <View style={style.flatten(['padding-x-15'])}>
                      <Text style={style.flatten(['subtitle2'])}>{e.name}</Text>
                      <Text style={{ color: '#636366', fontSize: 14 }}>
                        {e.uri}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <>
      <PageWithScrollView>
        {isSwitchTab ? (
          <SwtichTab onPressItem={handlePressItem} />
        ) : (
          renderBrowser()
        )}
      </PageWithScrollView>
      <WebViewStateContext.Provider
        value={{
          webView: null,
          name: 'Browser',
          url: url,
          canGoBack: false,
          canGoForward: false,
        }}
      >
        <BrowserFooterSection
          isSwitchTab={isSwitchTab}
          setIsSwitchTab={setIsSwitchTab}
          onHandleUrl={onHandleUrl}
        />
      </WebViewStateContext.Provider>
    </>
  );
};
