import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import useHeaderOptions from '@src/hooks/use-header';
import { SCREENS, SCREENS_TITLE } from '@src/common/constants';
import { HomeScreen } from '@src/screens/home';
import { TransactionDetail } from '@src/screens/transactions';
import { NewMnemonicScreen, RecoverMnemonicScreen, VerifyMnemonicScreen } from '@src/screens/register/mnemonic';
import { RegisterEndScreen } from '@src/screens/register/end';
import { NewLedgerScreen } from '@src/screens/register/ledger';
import { TokenDetailScreen, TokensScreen } from '@src/screens/tokens';
import { NftDetailScreen, NftsScreen } from '@src/screens/nfts';
const Stack = createStackNavigator();

export const MainNavigation: FC = () => {
    return (
      <Stack.Navigator
        screenOptions={({ route, navigation }) => ({
          ...useHeaderOptions({ title: SCREENS_TITLE[route?.name] }, navigation)
        })}
        initialRouteName={SCREENS.Home}
        headerMode="screen"
      >
        <Stack.Screen name={SCREENS.Home} component={HomeScreen} />
        <Stack.Screen
          name={SCREENS.TransactionDetail}
          component={TransactionDetail}
        />
        <Stack.Screen
          options={{
            headerShown: false
          }}
          name={SCREENS.RegisterMain}
          component={NewMnemonicScreen}
        />
        <Stack.Screen
          name={SCREENS.RegisterVerifyMnemonicMain}
          component={VerifyMnemonicScreen}
        />
        <Stack.Screen
          name={SCREENS.RegisterEnd}
          component={RegisterEndScreen}
        />
        <Stack.Screen
          name={SCREENS.RegisterRecoverMnemonicMain}
          component={RecoverMnemonicScreen}
        />
        <Stack.Screen
          name={SCREENS.RegisterNewLedgerMain}
          component={NewLedgerScreen}
        />
        <Stack.Screen
          name={SCREENS.Tokens}
          component={TokensScreen}
        />
        <Stack.Screen
          name={SCREENS.Nfts}
          component={NftsScreen}
        />
        <Stack.Screen
          name={SCREENS.TokenDetail}
          component={TokenDetailScreen}
        />
        <Stack.Screen
          name={SCREENS.NftsDetail}
          component={NftDetailScreen}
        />
      </Stack.Navigator>
    );
  };
 

const styles = StyleSheet.create({})