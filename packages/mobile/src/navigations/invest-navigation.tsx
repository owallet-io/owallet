import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import useHeaderOptions from "@src/hooks/use-header";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import {
  DelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "@src/screens/stake";
import { DelegateDetailScreen } from "@src/screens/stake/delegate/delegate-detail";
import { RedelegateScreen } from "@src/screens/stake/redelegate";
import { UndelegateScreen } from "@src/screens/stake/undelegate";
import { useStore } from "@src/stores";
import { observer } from "mobx-react-lite";
const Stack = createStackNavigator();
export const InvestNavigation: FC = observer(() => {
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
      initialRouteName="Invest"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerLeft: null,
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
});
