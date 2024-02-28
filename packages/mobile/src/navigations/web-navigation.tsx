import { StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import { Header, createStackNavigator } from "@react-navigation/stack";
import { SCREENS } from "@src/common/constants";
import { WebpageScreenScreenOptionsPreset } from "@src/screens/web/components/webpage-screen";
import { Browser } from "@src/screens/web/browser";
import { BookMarks } from "@src/screens/web/bookmarks";
import { WebScreen } from "@src/screens/web";
import { DAppWebpageScreen } from "@src/screens/web/webpages";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@src/themes/theme-provider";
export const WebpageHeaderOptions = ({ navigation, title }): any => {
  const { colors } = useTheme();
  return {
    headerShown: true,
    headerTransparent: false,
    header: (props) => <Header {...props} />,
    headerLeft: () => {
      if (navigation.canGoBack())
        return (
          <OWButtonIcon
            colorIcon={colors["primary-text"]}
            onPress={() => navigation.goBack()}
            name="arrow-left"
            fullWidth={false}
            style={{
              paddingRight: 24,
              marginLeft: 4,
            }}
            sizeIcon={20}
          />
        );
      return null;
    },
    headerTitle: title,
    headerTitleAlign: "center",
    headerTitleStyle: { color: colors["text-title-login"] },
    headerStyle: {
      backgroundColor: colors["background"],
      shadowColor: "transparent",
      shadowRadius: 0,
      elevation: 0,
    },
  };
};
const Stack = createStackNavigator();
export const WebNavigation: FC = () => {
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      initialRouteName={SCREENS.Browser}
      screenOptions={{
        ...WebpageScreenScreenOptionsPreset,
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={({ navigation }) =>
          WebpageHeaderOptions({ navigation, title: SCREENS.Browser })
        }
        name={SCREENS.Browser}
        component={Browser}
      />
      <Stack.Screen
        options={({ navigation }) =>
          WebpageHeaderOptions({ navigation, title: "Bookmarks" })
        }
        name={SCREENS.BookMarks}
        component={BookMarks}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={SCREENS.WebIntro}
        component={WebScreen}
      />
      <Stack.Screen name={SCREENS.WebDApp} component={DAppWebpageScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});
