import React, { FC } from 'react';
import { SCREENS, SCREENS_TITLE } from '@src/common/constants';
import useHeaderOptions from '@src/hooks/use-header';
import { AddAddressBookScreen, AddressBookScreen } from '@src/screens/setting/screens/address-book';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
export const AddressBookStackScreen: FC = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route, navigation }) => ({
        ...useHeaderOptions({ title: SCREENS_TITLE[route?.name] }, navigation)
      })}
      headerMode="screen"
    >
      <Stack.Screen name={SCREENS.AddressBook} component={AddressBookScreen} />
      <Stack.Screen
        name={SCREENS.AddAddressBook}
        component={AddAddressBookScreen}
      />
    </Stack.Navigator>
  );
};
