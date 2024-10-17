import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import useHeaderOptions from "@src/hooks/use-header";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import { StakingDashboardScreen } from "@src/screens/stake";

import { useStore } from "@src/stores";
import { observer } from "mobx-react-lite";
import { StakingInfraScreen } from "@screens/stake/dashboard/stake-infra";
const Stack = createStackNavigator();
export const InvestNavigation: FC = observer(() => {
  const handleScreenOptions = ({ route, navigation }) => {
    const headerOptions = useHeaderOptions(
      { title: SCREENS_OPTIONS[route?.name].title },
      navigation
    );
    return headerOptions;
  };
  return (
    <Stack.Navigator
      screenOptions={handleScreenOptions}
      initialRouteName={SCREENS.Invest}
    >
      <Stack.Screen
        // options={{
        //   headerLeft: null,
        // }}
        name={SCREENS.Invest}
        component={StakingInfraScreen}
      />
      <Stack.Screen
        name={SCREENS.StakeDashboard}
        component={StakingDashboardScreen}
      />
    </Stack.Navigator>
  );
});
