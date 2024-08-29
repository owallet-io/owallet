import { StyleSheet } from "react-native";
import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import useHeaderOptions from "@src/hooks/use-header";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import { HomeScreen } from "@src/screens/home";

import {
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "@src/screens/register/mnemonic";
import { RegisterEndScreen } from "@src/screens/register/end";
import { NewLedgerScreen } from "@src/screens/register/ledger";
import { TokenDetailsScreen, TokensScreen } from "@src/screens/tokens";
import { NftDetailScreen, NftsScreen } from "@src/screens/nfts";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import { BackupMnemonicScreen } from "@src/screens/register/mnemonic/backup-mnemonic";
import { RecoverPhraseScreen } from "@src/screens/register/mnemonic/recover-phrase";
import { RegisterDoneScreen } from "@src/screens/register/done";

const Stack = createStackNavigator();

export const MainNavigation: FC = observer(() => {
  const { appInitStore } = useStore();

  const handleScreenOptions = ({ route, navigation }) => {
    // appInitStore.updateVisibleTabBar(route?.name);
    const headerOptions = useHeaderOptions(
      { title: SCREENS_OPTIONS[route?.name]?.title },
      navigation
    );
    return headerOptions;
  };
  return (
    <Stack.Navigator
      screenOptions={handleScreenOptions}
      initialRouteName={SCREENS.Home}
    >
      <Stack.Screen
        options={() => {
          return {
            headerLeft: null,
          };
        }}
        name={SCREENS.Home}
        component={HomeScreen}
      />

      <Stack.Screen
        name={SCREENS.BackupMnemonic}
        component={BackupMnemonicScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name={SCREENS.RegisterMain}
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        name={SCREENS.RegisterVerifyMnemonicMain}
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen name={SCREENS.RegisterEnd} component={RegisterEndScreen} />
      <Stack.Screen
        name={SCREENS.RegisterDone}
        component={RegisterDoneScreen}
      />
      <Stack.Screen
        name={SCREENS.RegisterRecoverMnemonicMain}
        component={RecoverMnemonicScreen}
      />

      <Stack.Screen
        name={SCREENS.RegisterRecoverPhraseMain}
        component={RecoverPhraseScreen}
      />
      <Stack.Screen
        name={SCREENS.RegisterNewLedgerMain}
        component={NewLedgerScreen}
      />
      <Stack.Screen name={SCREENS.Tokens} component={TokensScreen} />
      <Stack.Screen name={SCREENS.Nfts} component={NftsScreen} />
      <Stack.Screen name={SCREENS.NftsDetail} component={NftDetailScreen} />
      <Stack.Screen
        name={SCREENS.TokenDetails}
        component={TokenDetailsScreen}
      />
    </Stack.Navigator>
  );
});

const styles = StyleSheet.create({});
