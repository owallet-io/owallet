import { Platform, StyleSheet, View } from "react-native";
import React, { FC } from "react";

import { useTheme } from "@src/themes/theme-provider";
import { ICONS_TITLE, SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainNavigation } from "./main-navigation";
import { WebNavigation } from "./web-navigation";
import { SendNavigation } from "./send-navigation";
import { InvestNavigation } from "./invest-navigation";

import OWIcon from "@src/components/ow-icon/ow-icon";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import imagesGlobal from "@src/assets/images";
import { BlurView } from "@react-native-community/blur";
import { NewSettingScreen } from "@src/screens/setting/setting";
const Tab = createBottomTabNavigator();
export const MainTabNavigation: FC = observer(() => {
  const { colors, dark } = useTheme();

  const insets = useSafeAreaInsets();
  const isNorthSafe = insets.bottom > 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ color, focused }) => {
            if (route?.name === SCREENS.TABS.SendNavigation) {
              return (
                <View style={styles.paddingIcon}>
                  <OWIcon type="images" source={imagesGlobal.swap} size={50} />
                </View>
              );
            }
            return (
              <OWIcon
                //@ts-ignore
                name={`${ICONS_TITLE[route.name]}`}
                size={22}
                color={color}
              />
            );
          },
          headerShown: false,
          tabBarLabel: `${SCREENS_OPTIONS[route.name].title}`,
          tabBarStyle: {
            backgroundColor: colors["neutral-surface-bg2"],
            borderTopWidth: 0.5,
            borderTopColor: colors["border-bottom-tab"],
            paddingLeft: 10,
            paddingRight: 10,
            position: "absolute",
          },
          tabBarActiveTintColor: colors["primary-surface-default"],
          tabBarLabelStyle: {
            fontSize: 12,
            textAlign: "center",
            fontFamily: "SpaceGrotesk-Regular",
          },
          tabBarInactiveTintColor: colors["label-bottom-bar"],
          tabBarItemStyle: {
            paddingTop: isNorthSafe ? 10 : 3,
            paddingBottom: isNorthSafe ? 0 : 3,
          },
          tabBarBackground: () => (
            <View
              style={{
                flex: 1,
              }}
            >
              {/* in terms of positioning and zIndex-ing everything before the BlurView will be blurred */}
              {Platform.OS === "ios" && (
                <BlurView
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                  }}
                  blurType={!dark ? "light" : "extraDark"}
                />
              )}
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name={SCREENS.TABS.Main} component={MainNavigation} />
      <Tab.Screen name={SCREENS.TABS.Invest} component={InvestNavigation} />
      <Tab.Screen
        options={{}}
        name={SCREENS.TABS.SendNavigation}
        component={SendNavigation}
      />
      <Tab.Screen name={SCREENS.TABS.Browser} component={WebNavigation} />
      <Tab.Screen name={SCREENS.TABS.Settings} component={NewSettingScreen} />
    </Tab.Navigator>
  );
});
const styles = StyleSheet.create({
  paddingStyleIcon: {
    paddingVertical: 5,
  },
  paddingIcon: {
    paddingTop: 15,
  },
});
