import { StyleSheet } from "react-native";
import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import useHeaderOptions from "@src/hooks/use-header";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import { HomeScreen } from "@src/screens/home";
import { observer } from "mobx-react-lite";

const Stack = createStackNavigator();

export const MainNavigation: FC = observer(() => {
  const handleScreenOptions = ({ route, navigation }) => {
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
        // options={() => {
        //   return {
        //     headerLeft: null,
        //   };
        // }}
        name={SCREENS.Home}
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
});

const styles = StyleSheet.create({});
