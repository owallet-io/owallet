import { StyleSheet } from "react-native";
import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";

import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { BrowserScreen } from "@src/screens/web/browser-screen";
import { DetailsBrowserScreen } from "@src/screens/web/details-browser-screen";
import { BookmarksScreen } from "@screens/web/bookmarks-screen";
import { useGetNewHeaderHeight } from "@src/hooks";
import OWHeaderTitle from "../components/header/ow-header-title";
import OWButtonIcon from "@components/button/ow-button-icon";
import { goBack } from "@src/router/root";

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
      <Stack.Screen
        options={({ route }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: colors["neutral-surface-bg"],
            shadowColor: colors["neutral-border-default"],
            borderBottomWidth: 0,
            elevation: 0,
            height: useGetNewHeaderHeight(),
          },
          headerTitle: () => (
            <OWHeaderTitle title={SCREENS_OPTIONS[route.name]?.title} />
          ),
          headerLeft: () => {
            return (
              <OWButtonIcon
                colorIcon={colors["neutral-icon-on-light"]}
                onPress={() => goBack()}
                name="arrow-left"
                fullWidth={false}
                style={[
                  {
                    borderRadius: 999,
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 16,
                    backgroundColor: colors["neutral-surface-card"],
                  },
                ]}
                sizeIcon={16}
              />
            );
          },
          headerTitleAlign: "center",
        })}
        name={SCREENS.BookMarks}
        component={BookmarksScreen}
      />
    </Stack.Navigator>
  );
});

const styles = StyleSheet.create({});
