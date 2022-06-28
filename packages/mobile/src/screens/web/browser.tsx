import React, { FunctionComponent, useEffect, useState } from 'react';
// import { PageWithScrollViewInBottomTabView } from "../../components/page";
import {
  Image,
  Text,
  View,
  Keyboard,
  TouchableWithoutFeedback,
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
  // BrowserSectionModal,
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
import { InjectedProviderUrl } from './config';
import { SwtichTab } from './components/switch-tabs';
import { BrowserFooterSection } from './components/footer-section';
import { WebViewStateContext } from './components/context';
import { observer } from 'mobx-react-lite';

export const BrowserBookmark: FunctionComponent<{}> = ({}) => {
  const style = useStyle();
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

export const Browser: FunctionComponent<any> = observer((props) => {
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
    const deepLinkUri =
      props?.route?.params?.path || deepLinkUriStore.getDeepLink();
    if (deepLinkUri) {
      updateScreen(deepLinkUri);
    }
  }, []);

  const updateScreen = async (uri) => {
    if (uri) {
      deepLinkUriStore.updateDeepLink('');
      smartNavigation.pushSmart('Web.dApp', {
        name: 'Browser',
        uri: decodeURIComponent(uri) || 'https://oraidex.io',
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
      const tab = {
        id: Date.now(),
        name: url,
        uri:
          url?.toLowerCase().indexOf('http') >= 0
            ? url?.toLowerCase()
            : 'https://' + url?.toLowerCase(),
      };
      browserStore.addTab(tab);

      browserStore.updateSelectedTab(tab);
      smartNavigation.pushSmart('Web.dApp', tab);
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

  return (
    <TouchableWithoutFeedback
      style={style.flatten(['flex-column', 'justify-between', 'height-full'])}
      onPress={() => {
        if (isKeyboardVisible) Keyboard.dismiss();
      }}
    >
      <View>
        <View style={{ opacity: isOpenSetting ? 0.8 : 1 }}>
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
            >
              <BrowserBookmark />
              <View style={style.flatten(['padding-20'])}>
                {browserStore.getBookmarks?.map((e) => (
                  <TouchableOpacity
                    key={e.uri}
                    style={style.flatten([
                      'height-44',
                      'margin-bottom-15',
                      'flex-row',
                    ])}
                    onPress={() => {
                      handleClickUri(e.uri, e.name);
                      const tab = {
                        id: Date.now(),
                        name: e.name,
                        uri: e.uri?.toLowerCase(),
                      };
                      browserStore.addTab(tab);
                      browserStore.updateSelectedTab(tab);
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
        {isOpenSetting && (
          <View
            style={{
              backgroundColor: '#132340',
              height: 200,
              width: 200,
              position: 'absolute',
              right: 0,
              bottom: 80,
              borderRadius: 4,
              zIndex: 1,
              padding: 10,
            }}
          >
            <BrowserSectionModal
              onClose={() => setIsOpenSetting(false)}
              title="Setting"
            />
          </View>
        )}

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
});
