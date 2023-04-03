import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import useHeaderOptions from '@src/hooks/use-header';
import { SCREENS, SCREENS_TITLE } from '@src/common/constants';
import {
  DelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen
} from '@src/screens/stake';
import { DelegateDetailScreen } from '@src/screens/stake/delegate/delegate-detail';
import { RedelegateScreen } from '@src/screens/stake/redelegate';
import { UndelegateScreen } from '@src/screens/stake/undelegate';
const Stack = createStackNavigator();
export const InvestNavigation: FC = () => {
  const handleScreenOptions = ({ route, navigation })=>{
    const headerOptions = useHeaderOptions({ title: SCREENS_TITLE[route?.name] }, navigation);
    return headerOptions;
  }
  return (
    <Stack.Navigator
      screenOptions={handleScreenOptions}
      initialRouteName={SCREENS.Invest}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerLeft: null
        }}
        name={SCREENS.Invest}
        component={StakingDashboardScreen}
      />
      <Stack.Screen
        name={SCREENS.ValidatorList}
        component={ValidatorListScreen}
      />
      <Stack.Screen
        name={SCREENS.ValidatorDetails}
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen name={SCREENS.Delegate} component={DelegateScreen} />
      <Stack.Screen
        name={SCREENS.DelegateDetail}
        component={DelegateDetailScreen}
      />
      <Stack.Screen name={SCREENS.Redelegate} component={RedelegateScreen} />
      <Stack.Screen name={SCREENS.Undelegate} component={UndelegateScreen} />
    </Stack.Navigator>
  );
};
