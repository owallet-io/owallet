import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import React, { FC, useEffect } from 'react';
import { useStyle } from '@src/styles';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@src/stores';
import { useTheme } from '@src/themes/theme-provider';
import { useFocusedScreen } from '@src/providers/focused-screen';
import { SCREENS } from '@src/common/constants';
import { BrowserFillIcon, DotsIcon, HomeFillIcon, InvestFillIcon, SettingFillIcon } from '@src/components/icon';
import { BlurredBottomTabBar } from '@src/components/bottom-tabbar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainNavigation } from './main-navigation';
import { WebNavigation } from './web-navigation';
import { SendNavigation } from './send-navigation';
import { InvestNavigation } from './invest-navigation';
import { SettingStackScreen } from './settings-navigation';
import { BorderlessButton } from 'react-native-gesture-handler';
const Tab = createBottomTabNavigator();
export const MainTabNavigation: FC = () => {
  const style = useStyle();

  const navigation = useNavigation();
  const { chainStore } = useStore();

  const { colors } = useTheme();

  const focusedScreen = useFocusedScreen();

  useEffect(() => {}, [focusedScreen.name, navigation]);

  const checkActiveTabBottom = (name: string) => {
    return name.includes(focusedScreen.name);
  };

  const RenderTabsBarIcon = ({ name }) => {
    let choosen = checkActiveTabBottom(name);

    if (name === SCREENS.TABS.Settings) {
      choosen = checkActiveTabBottom('Setting');
    }
    let icon;
    let nameRoute = name;
    switch (name) {
      case SCREENS.TABS.Main:
        icon = choosen ? (
          <HomeFillIcon color={colors['purple-700']} />
        ) : (
          <HomeFillIcon color={colors['icon-text']} />
        );
        break;
      case SCREENS.TABS.Home:
        icon = choosen ? (
          <HomeFillIcon color={colors['purple-700']} />
        ) : (
          <HomeFillIcon color={colors['icon-text']} />
        );
        break;
      case SCREENS.TABS.Browser:
        icon = choosen ? (
          <BrowserFillIcon color={colors['purple-700']} />
        ) : (
          <BrowserFillIcon color={colors['icon-text']} />
        );
        break;
      case SCREENS.TABS.Invest:
        icon = choosen ? (
          <InvestFillIcon color={colors['purple-700']} />
        ) : (
          <InvestFillIcon color={colors['icon-text']} />
        );
        break;
      case SCREENS.TABS.Settings:
        icon = choosen ? (
          <SettingFillIcon color={colors['purple-700']} />
        ) : (
          <SettingFillIcon color={colors['icon-text']} />
        );
        break;
      default:
        icon = choosen ? (
          <SettingFillIcon color={colors['purple-700']} />
        ) : (
          <SettingFillIcon color={colors['icon-text']} />
        );
        break;
    }

    return (
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: choosen ? 30 : 12
        }}
      >
        {icon}
        {!!nameRoute && (
          <Text
            style={{
              fontSize: 12,
              lineHeight: 16,
              color: choosen ? colors['purple-700'] : colors['icon-text']
            }}
          >
            {nameRoute}
          </Text>
        )}

        {choosen && (
          <View style={{ paddingTop: 10 }}>
            <DotsIcon />
          </View>
        )}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          switch (route.name) {
            case SCREENS.TABS.Main:
              return <RenderTabsBarIcon name={SCREENS.TABS.Home} />;
            case SCREENS.TABS.Browser:
              return <RenderTabsBarIcon name={SCREENS.TABS.Browser} />;
            case SCREENS.TABS.SendNavigation:
              return (
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: checkActiveTabBottom(route.name) ? 30 : 8
                  }}
                >
                  <Image
                    style={{
                      width: 50,
                      height: 50
                    }}
                    source={require('@src/assets/image/push.png')}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                  {checkActiveTabBottom(route.name) && (
                    <View style={{ paddingTop: 10 }}>
                      <DotsIcon />
                    </View>
                  )}
                </View>
              );
            case SCREENS.TABS.Invest:
              return <RenderTabsBarIcon name={SCREENS.TABS.Invest} />;
            case SCREENS.TABS.Settings:
              return <RenderTabsBarIcon name={SCREENS.TABS.Settings} />;
          }
        },
        tabBarButton: (props) => (
          <View
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <BorderlessButton
              {...props}
              activeOpacity={1}
              style={{
                height: '100%',
                aspectRatio: 1.9,
                maxWidth: '100%'
              }}
            />
          </View>
        )
      })}
      tabBarOptions={{
        activeTintColor: colors['background-btn-primary'],
        inactiveTintColor: style.get('color-text-black-very-very-low').color,
        style: {
          backgroundColor: colors['background-box'],
          borderTopWidth: 0.5,
          borderTopColor: colors['primary'],
          shadowColor: style.get('color-transparent').color,
          elevation: 0,
          paddingLeft: 10,
          paddingRight: 10,
          height: Platform.OS === 'android' ? 80 : 110
        },
        showLabel: false
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={['Home']} />
      )}
    >
      <Tab.Screen name={SCREENS.TABS.Main} component={MainNavigation} />
      <Tab.Screen name={SCREENS.TABS.Browser} component={WebNavigation} />
      <Tab.Screen
        options={{
          title: 'SendNavigation'
        }}
        name={SCREENS.TABS.SendNavigation}
        component={SendNavigation}
        initialParams={{
          currency: chainStore.current.stakeCurrency.coinMinimalDenom,
          chainId: chainStore.current.chainId
        }}
      />
      <Tab.Screen name={SCREENS.TABS.Invest} component={InvestNavigation} />
      <Tab.Screen
        name={SCREENS.TABS.Settings}
        component={SettingStackScreen}
        options={{
          unmountOnBlur: true
        }}
      />
    </Tab.Navigator>
  );
};

