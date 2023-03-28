import { View, Text } from 'react-native'
import React, { FC } from 'react'

import { createStackNavigator } from '@react-navigation/stack';
import useHeaderOptions from '@src/hooks/use-header';
import { SCREENS, SCREENS_TITLE } from '@src/common/constants';
import TransferTokensScreen from '@src/screens/transfer-tokens/transfer-screen';
const Stack = createStackNavigator(); 
export const SendNavigation: FC = () => {
    return (
      <Stack.Navigator
        screenOptions={({ route, navigation }) => ({
          ...useHeaderOptions({ title: SCREENS_TITLE[route?.name] }, navigation)
        })}
        initialRouteName={SCREENS.TransferTokensScreen}
        headerMode="screen"
      >
        <Stack.Screen
          options={{
            headerLeft:null
          }}
          name={SCREENS.TransferTokensScreen}
          component={TransferTokensScreen}
        />
      </Stack.Navigator>
    );
  };