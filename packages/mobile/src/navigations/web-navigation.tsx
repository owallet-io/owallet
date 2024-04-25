import { StyleSheet } from "react-native";
import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { SCREENS } from "@src/common/constants";
import { WebScreen } from "@src/screens/web";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { BrowserScreen } from "@src/screens/web/browser-screen";
import { DetailsBrowserScreen } from "@src/screens/web/details-browser-screen";
import { BookmarksScreen } from "@src/screens/web/bookmarks-screen";

const Stack = createStackNavigator();
export const WebNavigation: FC = observer(() => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName={SCREENS.Browser}
      screenOptions={({ route }) => {
        // appInitStore.updateVisibleTabBar(route?.name);
        return {
          headerShown: false,
          headerStyle: {
            backgroundColor: colors["neutral-surface-card"],
          },

          // headerMode:"screen"
          // ...WebpageScreenScreenOptionsPreset,
        };
      }}
      // headerMode="screen"
    >
      <Stack.Screen name={SCREENS.Browser} component={BrowserScreen} />
      <Stack.Screen
        name={SCREENS.DetailsBrowser}
        component={DetailsBrowserScreen}
      />
      <Stack.Screen name={SCREENS.BookMarks} component={BookmarksScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name={SCREENS.WebIntro}
        component={WebScreen}
      />
    </Stack.Navigator>
  );
});

const styles = StyleSheet.create({});
