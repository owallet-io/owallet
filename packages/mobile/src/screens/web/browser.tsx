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
import { SearchIcon } from '../../components/icon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { checkValidDomain } from '../../utils/helper';
import { useStore } from '../../stores';
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
          'padding-20'
        ])}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '500',
            color: '#1C1C1E'
          }}
        >
          Bookmarks
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: '#4334F1'
          }}
          onPress={() => navigation.navigate('BookMarks')}
        >
          View all
        </Text>
      </View>
      <View
        style={style.flatten([
          'height-1',
          'margin-x-20',
          'background-color-border-white'
        ])}
      />
    </React.Fragment>
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
            <BrowserSectionTitle title="Browser" />
            <View style={{ height: 260 }}>
              <Image
                style={{
                  width: '100%',
                  height: '100%'
                }}
                fadeDuration={0}
                resizeMode="stretch"
                source={require('../../assets/image/background.png')}
              />
              <TextInput
                containerStyle={{
                  width: '100%',
                  padding: 20,
                  marginTop: -50
                }}
                inputStyle={style.flatten([
                  'flex-row',
                  'items-center',
                  'background-color-white',
                  'padding-20',
                  'border-radius-16',
                  'border-width-4',
                  'border-color-border-pink'
                ])}
                returnKeyType={'next'}
                placeholder={'Search website'}
                placeholderTextColor={'#AEAEB2'}
                onSubmitEditing={onHandleUrl}
                value={url}
                onChangeText={txt => setUrl(txt.toLowerCase())}
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
                'padding-bottom-64'
              ])}
            >
              <BrowserBookmark />
              <View style={style.flatten(['padding-20'])}>
                <TouchableOpacity
                  key={'https://app.orchai.io'}
                  style={style.flatten([
                    'height-44',
                    'margin-bottom-15',
                    'flex-row'
                  ])}
                  onPress={() => {
                    handleClickUri('https://app.orchai.io', 'Orchai App');
                    const tab = {
                      id: Date.now(),
                      name: 'Orchai App',
                      uri: 'https://app.orchai.io'.toLowerCase()
                    };
                    browserStore.addTab(tab);
                    browserStore.updateSelectedTab(tab);
                    setUrl('https://app.orchai.io');
                  }}
                >
                  <View style={style.flatten(['padding-top-5'])}>
                    <Image
                      style={{
                        width: 20,
                        height: 22
                      }}
                      source={{
                        uri: 'data:image/png;base64,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'
                      }}
                      fadeDuration={0}
                    />
                  </View>
                  <View style={style.flatten(['padding-x-15'])}>
                    <Text style={style.flatten(['subtitle2'])}>
                      {'Orchai App'}
                    </Text>
                    <Text style={{ color: '#636366', fontSize: 14 }}>
                      {'https://app.orchai.io'}
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
