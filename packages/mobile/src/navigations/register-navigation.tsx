import { StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useStore } from "@src/stores";
import { useTheme } from "@src/themes/theme-provider";
import useHeaderOptions from "@src/hooks/use-header";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import { OnboardingIntroScreen } from "@src/screens/onboarding";
import { RegisterIntroScreen } from "@src/screens/register";
import { RegisterNewUserScreen } from "@src/screens/register/new-user";
import { RegisterNotNewUserScreen } from "@src/screens/register/not-new-user";
import {
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "@src/screens/register/mnemonic";
import { NewLedgerScreen } from "@src/screens/register/ledger";
import { RegisterEndScreen } from "@src/screens/register/end";
import { colors } from "@src/themes";
import { NewPincodeScreen } from "@src/screens/register/register-pincode";
import { RegisterDoneScreen } from "@src/screens/register/done";
import { RecoverPhraseScreen } from "@src/screens/register/mnemonic/recover-phrase";
const Stack = createStackNavigator();
export const RegisterNavigation: FC = () => {
  const { appInitStore } = useStore();
  const handleScreenOptions = ({ route, navigation }) => {
    const headerOptions = useHeaderOptions(
      {
        title: SCREENS_OPTIONS[route?.name]?.title,
        headerStyle: {
          backgroundColor: colors["plain-background"],
        },
      },
      navigation
    );
    return headerOptions;
  };
  return (
    <Stack.Navigator
      screenOptions={handleScreenOptions}
      // initialRouteName={SCREENS.RegisterIntro}
      headerMode="float"
    >
      <Stack.Screen
        name={SCREENS.RegisterIntro}
        component={
          appInitStore.getInitApp.status
            ? OnboardingIntroScreen
            : RegisterIntroScreen
        }
      />

      {/* <Stack.Screen
        name={SCREENS.RegisterNewUser}
        component={RegisterNewUserScreen}
      /> */}
      {/* <Stack.Screen
        name={SCREENS.RegisterNotNewUser}
        component={RegisterNotNewUserScreen}
      /> */}
      <Stack.Screen
        name={SCREENS.RegisterNewMnemonic}
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        name={SCREENS.RegisterNewPincode}
        component={NewPincodeScreen}
      />
      <Stack.Screen
        name={SCREENS.RegisterVerifyMnemonic}
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        name={SCREENS.RegisterRecoverMnemonic}
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen
        name={SCREENS.RegisterRecoverPhrase}
        component={RecoverPhraseScreen}
      />
      <Stack.Screen
        name={SCREENS.RegisterNewLedger}
        component={NewLedgerScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name={SCREENS.RegisterEnd}
        component={RegisterEndScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name={SCREENS.RegisterDone}
        component={RegisterDoneScreen}
      />
    </Stack.Navigator>
  );
};
const styles = StyleSheet.create({});
