import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useStore } from '@src/stores';
import { SCREENS, SCREENS_OPTIONS } from '@src/common/constants';

import useHeaderOptions from '@src/hooks/use-header';
import { UniversalSwapScreen } from '@src/screens/universal-swap';
const Stack = createStackNavigator();
export const UniversalSwapStackScreen: FC = () => {
  const { appInitStore } = useStore();
  const handleScreenOptions = ({ route, navigation }) => {
    appInitStore.updateVisibleTabBar(route?.name);
    const headerOptions = useHeaderOptions(
      { title: SCREENS_OPTIONS[route?.name].title },
      navigation
    );
    return headerOptions;
  };
  return (
    <Stack.Navigator
      screenOptions={handleScreenOptions}
      initialRouteName={SCREENS.UniversalSwap}
    >
      <Stack.Screen
        options={{
          headerLeft: null
        }}
        name={SCREENS.UniversalSwap}
        component={UniversalSwapScreen}
      />
    </Stack.Navigator>
  );
};
