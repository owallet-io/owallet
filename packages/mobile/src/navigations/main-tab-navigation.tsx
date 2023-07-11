import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { useStore } from '@src/stores';
import { useTheme } from '@src/themes/theme-provider';
import {
  EVENTS,
  ICONS_TITLE,
  SCREENS,
  SCREENS_OPTIONS
} from '@src/common/constants';
import { BlurredBottomTabBar } from '@src/components/bottom-tabbar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainNavigation } from './main-navigation';
import { WebNavigation } from './web-navigation';
import { SendNavigation } from './send-navigation';
import { InvestNavigation } from './invest-navigation';
import { SettingStackScreen } from './settings-navigation';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import imagesGlobal from '@src/assets/images';

const Tab = createBottomTabNavigator();
export const MainTabNavigation: FC = observer(() => {
  const { chainStore, appInitStore } = useStore();
  const { colors, images } = useTheme();
  const { visibleTabBar } = appInitStore.getInitApp;
  const insets = useSafeAreaInsets();
  const isNorthSafe = insets.bottom > 0;
  // const checkTabbarVisible = () => {
  //   if (Platform.OS == 'android') {
  //     return {
  //       tabBarVisible: visibleTabBar
  //         ? SCREENS_OPTIONS[visibleTabBar].showTabBar || false
  //         : false
  //     };
  //   }
  //   return {};
  // };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ color, focused }) => {
            if (route?.name === SCREENS.TABS.SendNavigation) {
              return (
                <View style={styles.paddingIcon}>
                  <OWIcon
                    type="images"
                    source={
                      focused ? imagesGlobal.push : images.btn_center_bottom_tab
                    }
                    size={44}
                  />
                </View>
              );
            }
            return (
              <OWIcon
                name={`${ICONS_TITLE[route.name]}-${
                  focused ? 'bold' : 'outline'
                }`}
                size={22}
                color={color}
              />
            );
          },
          headerShown:false,
          tabBarLabel: `${SCREENS_OPTIONS[route.name].title}`,
          
          // ...checkTabbarVisible()
        };
      }}
      // tabBarOptions={{
      //   activeTintColor: colors['purple-700'],
      //   labelStyle: {
      //     fontSize: 12,
      //     textAlign: 'center'
      //   },
      //   tabStyle: {
      //     paddingTop: isNorthSafe ? 10 : 3,
      //     paddingBottom: isNorthSafe ? 0 : 3
      //   },
      //   inactiveTintColor: colors['label-bottom-bar'],
      //   style: {
      //     backgroundColor: colors['background-box'],
      //     borderTopWidth: 0.5,
      //     borderTopColor: colors['border-bottom-tab'],
      //     paddingLeft: 10,
      //     paddingRight: 10
      //   }
      // }}
      tabBar={(props) => (
        <BlurredBottomTabBar
          // visibleTabBar={
          //   visibleTabBar
          //     ? SCREENS_OPTIONS[visibleTabBar].showTabBar || false
          //     : false
          // }
          {...props}
        />
      )}
    >
      <Tab.Screen name={SCREENS.TABS.Main} component={MainNavigation} />
      <Tab.Screen name={SCREENS.TABS.Browser} component={WebNavigation} />
      <Tab.Screen
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
});
const styles = StyleSheet.create({
  paddingStyleIcon: {
    paddingVertical: 5
  },
  paddingIcon: {
    paddingTop: 15
  }
});
