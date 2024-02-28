/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect } from "react";
import { Linking } from "react-native";
import { KeyRingStatus } from "@owallet/background";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import { FocusedScreenProvider } from "./providers/focused-screen";
import { UnlockScreen } from "./screens/unlock";
import analytics from "@react-native-firebase/analytics";
import { navigationRef } from "./router/root";
import { handleDeepLink } from "./utils/helper";
import { SmartNavigatorProvider } from "./navigation.provider";
import { SCREENS } from "./common/constants";
import {
  AddressBookStackScreen,
  MainTabNavigation,
  OtherNavigation,
  RegisterNavigation,
} from "./navigations";
import { useTheme } from "./themes/theme-provider";
import { NewPincodeScreen } from "./screens/register/register-pincode";
import { PincodeUnlockScreen } from "./screens/unlock/pincode-unlock";
import { RecoverPhraseScreen } from "./screens/register/mnemonic/recover-phrase";

const Stack = createStackNavigator();
export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore, deepLinkUriStore } = useStore();
  const { colors } = useTheme();
  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          const SCHEME_IOS = "owallet://open_url?url=";
          const SCHEME_ANDROID = "app.owallet.oauth://google/open_url?url=";
          deepLinkUriStore.updateDeepLink(
            url.replace(SCHEME_ANDROID, "").replace(SCHEME_IOS, "")
          );
        }
      })
      .catch((err) => {
        console.warn("Deeplinking error", err);
      });
    Linking.addEventListener("url", handleDeepLink);
    return () => {
      // Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
          <NavigationContainer
            theme={
              {
                colors: {
                  background: colors["background"],
                },
              } as any
            }
            ref={navigationRef}
            onStateChange={async () => {
              await analytics().logScreenView({
                screen_name: navigationRef.current.getCurrentRoute().name,
                screen_class: navigationRef.current.getCurrentRoute().name,
              });
            }}
          >
            <Stack.Navigator
              initialRouteName={
                // SCREENS.STACK.PincodeUnlock
                keyRingStore.status !== KeyRingStatus.UNLOCKED
                  ? SCREENS.STACK.PincodeUnlock
                  : SCREENS.STACK.MainTab
              }
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS,
              }}
              // headerMode="screen"
            >
              <Stack.Screen
                name={SCREENS.STACK.Pincode}
                component={NewPincodeScreen}
              />
              <Stack.Screen
                name={SCREENS.STACK.PincodeUnlock}
                component={PincodeUnlockScreen}
              />
              <Stack.Screen
                name={SCREENS.STACK.Unlock}
                component={UnlockScreen}
              />
              <Stack.Screen
                name={SCREENS.STACK.MainTab}
                component={MainTabNavigation}
              />
              <Stack.Screen
                name={SCREENS.RegisterRecoverPhrase}
                component={RecoverPhraseScreen}
              />
              <Stack.Screen
                name={SCREENS.STACK.Register}
                component={RegisterNavigation}
              />
              <Stack.Screen
                name={SCREENS.STACK.Others}
                component={OtherNavigation}
              />
              <Stack.Screen
                name={SCREENS.STACK.AddressBooks}
                component={AddressBookStackScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SmartNavigatorProvider>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
