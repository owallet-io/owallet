import React, { FC } from "react";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import useHeaderOptions from "@src/hooks/use-header";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "@src/screens/setting/screens/address-book";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export const AddressBookStackScreen: FC = () => {
  const handleScreenOptions = ({ route, navigation }) => {
    const headerOptions = useHeaderOptions(
      { title: SCREENS_OPTIONS[route?.name].title },
      navigation
    );
    return headerOptions;
  };
  return (
    <Stack.Navigator screenOptions={handleScreenOptions}>
      <Stack.Screen name={SCREENS.AddressBook} component={AddressBookScreen} />
      <Stack.Screen
        name={SCREENS.AddAddressBook}
        component={AddAddressBookScreen}
      />
    </Stack.Navigator>
  );
};
