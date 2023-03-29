import { View, Text } from 'react-native'
import React, { FC } from 'react'

import { createStackNavigator } from '@react-navigation/stack';
import useHeaderOptions from '@src/hooks/use-header';
import { SCREENS, SCREENS_TITLE } from '@src/common/constants';
import TransferTokensScreen from '@src/screens/transfer-tokens/transfer-screen';
const Stack = createStackNavigator(); 
export const SendNavigation: FC = () => {
  const handleScreenOptions = ({ route, navigation })=>{
    const headerOptions = useHeaderOptions({ title: SCREENS_TITLE[route?.name] }, navigation);
    return headerOptions;
  }
    return (
      <Stack.Navigator
        screenOptions={handleScreenOptions}
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