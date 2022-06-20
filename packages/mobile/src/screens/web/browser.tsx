import React, { FunctionComponent, useEffect, useState } from 'react';
// import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { Image, View } from 'react-native';
import { useStyle } from '../../styles';
import { TextInput } from '../../components/input';
// import { Button } from "../../components/button";
import { useSmartNavigation } from '../../navigation';
// import { PageWithScrollView } from "../../components/page";
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
import { ORAIDEX_DEV_URL } from 'react-native-dotenv';
import { checkValidDomain } from '../../utils/helper';
import { useStore } from '../../stores';

export const Browser: FunctionComponent<any> = (props) => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const [isOpenSetting, setIsOpenSetting] = useState(false);
  const navigation = useNavigation();

  const arrayIcon = ['back', 'next', 'tabs', 'home', 'settings'];

  const renderIcon = (type, tabNum = 0) => {
    switch (type) {
      case 'back':
        return (
          <RightArrowIcon
            onPress={() => onPress(type)}
            type={'left'}
            color={'white'}
            height={18}
          />
        );
      case 'next':
        return (
          <RightArrowIcon
            onPress={() => onPress(type)}
            type={'right'}
            color={'white'}
            height={18}
          />
        );
      case 'tabs':
        return (
          <TabIcon onPress={() => onPress(type)} color={'white'} size={24} />
        );
      case 'home':
        return (
          <HomeIcon onPress={() => onPress(type)} color={'white'} size={18} />
        );
      case 'settings':
        return (
          <ThreeDotsIcon
            onPress={() => onPress(type)}
            color={'white'}
            size={18}
          />
        );
    }
  };
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
      // if (ORAIDEX_DEV_URL) uri = ORAIDEX_DEV_URL;
      smartNavigation.pushSmart('Web.dApp', {
        name: 'Google',
        // uri: `https://staging.oraidex.io/ethereum`,
        uri,
      });
    }
  };

  const onPress = (type) => {
    console.log({ type });

    try {
      switch (type) {
        case 'settings':
          return setIsOpenSetting(!isOpenSetting);
        case 'back':
          return smartNavigation.goBack();
        case 'next':
          return;
        case 'tabs':
          return;
        case 'home':
          return smartNavigation.navigateSmart('Home', {});
      }
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <View
      style={style.flatten(['flex-column', 'justify-between', 'height-full'])}
    >
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
              marginTop: -50
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
            // defaultValue={ORAIDEX_DEV_URL}
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
            padding: 10
          }}
        >
          <BrowserSectionModal
            onClose={() => setIsOpenSetting(false)}
            title="Setting"
          />
        </View>
      )}
      {/* <View
        style={style.flatten([
          "width-full",
          "height-80",
          "background-color-text-black-high",
          "flex-row",
          "items-center",
          "padding-40",
        ])}
      >
        {arrayIcon.map((e, i) => {
          return (
            <View key={i} style={{ width: "24%" }}>
              {renderIcon(e)}
            </View>
          );
        })}
      </View> */}
    </View>
  );
};
