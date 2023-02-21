import React, { FunctionComponent, useEffect, useState } from 'react';
import { Image, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { CText as Text } from '../../components/text';
import { useStyle } from '../../styles';
import { TextInput } from '../../components/input';
import { PageWithScrollView } from '../../components/page';
import { useNavigation } from '@react-navigation/core';
import {
  BrowserSectionTitle
  // BrowserSectionModal,
} from './components/section-title';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { checkValidDomain } from '../../utils/helper';
import { useStore } from '../../stores';
import { SwtichTab } from './components/switch-tabs';
import { BrowserFooterSection } from './components/footer-section';
import { WebViewStateContext } from './components/context';
import { observer } from 'mobx-react-lite';
import { SearchLightIcon, XIcon } from '../../components/icon';
import { colors } from '../../themes';

export const BrowserBookmark: FunctionComponent<{}> = ({}) => {
  const style = useStyle();
  const navigation = useNavigation();
  return (
    <View
      style={{ borderBottomColor: colors['gray-100'], borderBottomWidth: 1 }}
    >
      <View
        style={style.flatten([
          'width-full',
          'height-66',
          'flex-row',
          'justify-between',
          'items-center',
          'padding-20'
        ])}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#3A3A3C'
          }}
        >
          Bookmarks
          <Text
            style={{
              fontSize: 18,
              fontWeight: '400',
              color: '#3A3A3C'
            }}
          >
            (recent history)
          </Text>
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: colors['purple-700']
          }}
          onPress={() => navigation.navigate('BookMarks')}
        >
          View all
        </Text>
      </View>
    </View>
  );
};

export const Browser: FunctionComponent<any> = observer(props => {
  const style = useStyle();
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

  const [url, setUrl] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    setTimeout(function () {
      if (checkValidDomain(props?.route?.params?.url?.toLowerCase())) {
        const tabUri =
          props.route.params.url?.toLowerCase().indexOf('http') >= 0
            ? props.route.params.url?.toLowerCase()
            : 'https://' + props.route.params?.url?.toLowerCase();
        navigation.navigate('Web.dApp', {
          name: tabUri,
          uri: tabUri
        });
      }
    }, 1000);
  }, [props?.route?.params?.url]);

  useEffect(() => {
    setTimeout(function () {
      deepLinkUriStore.updateDeepLink('');
      if (checkValidDomain(deepLinkUriStore.link.toLowerCase())) {
        const tabUri =
          deepLinkUriStore.link?.toLowerCase().indexOf('http') >= 0
            ? deepLinkUriStore.link?.toLowerCase()
            : 'https://' + deepLinkUriStore.link?.toLowerCase();
        navigation.navigate('Web.dApp', {
          name: tabUri,
          uri: tabUri
        });
      }
    }, 1000);
  }, []);

  const onHandleUrl = () => {
    if (checkValidDomain(url?.toLowerCase())) {
      const tab = {
        id: Date.now(),
        name: url,
        uri:
          url?.toLowerCase().indexOf('http') >= 0
            ? url?.toLowerCase()
            : 'https://' + url?.toLowerCase()
      };
      browserStore.addTab(tab);
      browserStore.updateSelectedTab(tab);
      navigation.navigate('Web.dApp', tab);
    } else {
      let uri = `https://www.google.com/search?q=${url ?? ''}`;
      // if (InjectedProviderUrl) uri = InjectedProviderUrl;
      navigation.navigate('Web.dApp', {
        name: 'Google',
        uri
      });
    }
  };

  const handleClickUri = (uri: string, name: string) => {
    navigation.navigate('Web.dApp', {
      name,
      uri
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
            <BrowserSectionTitle title="" />
            <TextInput
              containerStyle={{
                width: '100%',
                paddingHorizontal: 20
              }}
              inputStyle={style.flatten([
                'flex-row',
                'items-center',
                'background-color-white',
                'padding-16',
                'border-radius-8'
              ])}
              returnKeyType={'next'}
              placeholder={'Search website'}
              placeholderTextColor={'#AEAEB2'}
              onSubmitEditing={onHandleUrl}
              value={url}
              onChangeText={txt => setUrl(txt.toLowerCase())}
              inputLeft={
                <TouchableOpacity
                  style={{ paddingRight: 16 }}
                  onPress={onHandleUrl}
                >
                  <SearchLightIcon />
                </TouchableOpacity>
              }
              inputRight={
                <TouchableOpacity onPress={onHandleUrl}>
                  <XIcon />
                </TouchableOpacity>
              }
            />
            <View
              style={style.flatten(['background-color-white', 'height-full'])}
            >
              <BrowserBookmark />
              <View style={style.flatten(['padding-20'])}>
                <TouchableOpacity
                  key={'https://airight.io'}
                  style={style.flatten([
                    'height-44',
                    'margin-bottom-15',
                    'flex-row'
                  ])}
                  onPress={() => {
                    handleClickUri('https://airight.io', 'aiRight');
                    const tab = {
                      id: Date.now(),
                      name: 'aiRight',
                      uri: 'https://airight.io'.toLowerCase()
                    };
                    browserStore.addTab(tab);
                    browserStore.updateSelectedTab(tab);
                    setUrl('https://airight.io');
                  }}
                >
                  <View style={style.flatten(['padding-top-5'])}>
                    <Image
                      style={{
                        width: 20,
                        height: 22
                      }}
                      source={{
                        uri: 'https://pbs.twimg.com/profile_images/1399316804258832384/WW6ZrspS_400x400.jpg'
                      }}
                      fadeDuration={0}
                    />
                  </View>
                  <View style={style.flatten(['padding-x-15'])}>
                    <Text style={style.flatten(['subtitle2'])}>
                      {'aiRight'}
                    </Text>
                    <Text style={{ color: '#636366', fontSize: 14 }}>
                      {'https://airight.io'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {browserStore.getBookmarks?.map(e => (
                  <TouchableOpacity
                    key={e.id ?? e.uri}
                    style={style.flatten([
                      'height-44',
                      'margin-bottom-15',
                      'flex-row'
                    ])}
                    onPress={() => {
                      handleClickUri(e.uri, e.name);
                      const tab = {
                        id: Date.now(),
                        name: e.name,
                        uri: e.uri?.toLowerCase()
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
                          height: 22
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
          canGoForward: false
        }}
      >
        <BrowserFooterSection
          isSwitchTab={isSwitchTab}
          setIsSwitchTab={setIsSwitchTab}
          onHandleUrl={onHandleUrl}
          typeOf={'browser'}
        />
      </WebViewStateContext.Provider>
    </>
  );
});
