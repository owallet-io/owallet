import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import React, { FC, useEffect } from 'react';
import { useStyle } from '@src/styles';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@src/stores';
import { useTheme } from '@src/themes/theme-provider';
import { useFocusedScreen } from '@src/providers/focused-screen';
import { ICONS_TITLE, SCREENS, SCREENS_TITLE } from '@src/common/constants';
import { BlurredBottomTabBar } from '@src/components/bottom-tabbar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainNavigation } from './main-navigation';
import { WebNavigation } from './web-navigation';
import { SendNavigation } from './send-navigation';
import { InvestNavigation } from './invest-navigation';
import { SettingStackScreen } from './settings-navigation';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { observer } from 'mobx-react-lite';
const Tab = createBottomTabNavigator();
export const MainTabNavigation: FC = observer(() => {
  const navigation = useNavigation();
  const { chainStore } = useStore();

  const { colors } = useTheme();

  const focusedScreen = useFocusedScreen();

  useEffect(() => {}, [focusedScreen.name, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => {
          if (route?.name === SCREENS.TABS.SendNavigation) {
            return (
              <View style={styles.paddingIcon}>
                <OWIcon
                  type="images"
                  source={require('@src/assets/image/push.png')}
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
        tabBarLabel: `${SCREENS_TITLE[route.name]}`
      })}
      tabBarOptions={{
        activeTintColor: colors['purple-700'],
        labelStyle: {
          fontSize: 12
        },
        inactiveTintColor: colors['label-bottom-bar'],
        style: {
          backgroundColor: colors['background-box'],
          borderTopWidth: 0.5,
          borderTopColor: colors['primary'],

          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: Platform.OS === 'ios' ? 10 : 0
        }
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={['Home']} />
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
  paddingIcon: {
    paddingTop: 15
  }
});
