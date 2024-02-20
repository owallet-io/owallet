import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import useHeaderOptions from '@src/hooks/use-header';
import { SCREENS, SCREENS_OPTIONS } from '@src/common/constants';
import TransferTokensScreen from '@src/screens/transfer-tokens/transfer-screen';
import { UniversalSwapScreen } from '@src/screens/universal-swap';
// import { UniversalSwapScreen } from '@src/screens/universal-swap';
const Stack = createStackNavigator();
export const SendNavigation: FC = () => {
  const handleScreenOptions = ({ route, navigation }) => {
    const headerOptions = useHeaderOptions({ title: SCREENS_OPTIONS[route?.name]?.title }, navigation);
    return headerOptions;
  };
  return (
    <Stack.Navigator screenOptions={handleScreenOptions} initialRouteName={SCREENS.UniversalSwapScreen}>
      <Stack.Screen
        options={{
          headerLeft: null
        }}
        name={SCREENS.UniversalSwapScreen}
        component={UniversalSwapScreen}
      />
      <Stack.Screen
        options={{
          headerLeft: null
        }}
        name={SCREENS.TransferTokensScreen}
        component={TransferTokensScreen}
      />
    </Stack.Navigator>
  );
};
