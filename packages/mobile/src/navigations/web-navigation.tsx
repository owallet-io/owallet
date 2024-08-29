import { StyleSheet } from "react-native";
import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { SCREENS } from "@src/common/constants";

import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { BrowserScreen } from "@src/screens/web/browser-screen";
import { DetailsBrowserScreen } from "@src/screens/web/details-browser-screen";

const Stack = createStackNavigator();
export const WebNavigation: FC = observer(() => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName={SCREENS.Browser}
      screenOptions={({ route }) => {
        return {
          headerShown: false,
          headerStyle: {
            backgroundColor: colors["neutral-surface-card"],
          },
        };
      }}
    >
      <Stack.Screen name={SCREENS.Browser} component={BrowserScreen} />
      <Stack.Screen
        name={SCREENS.DetailsBrowser}
        component={DetailsBrowserScreen}
      />
    </Stack.Navigator>
  );
});

const styles = StyleSheet.create({});
