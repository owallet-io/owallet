import { StyleSheet, Text, View } from 'react-native';
import React, { FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import useHeaderOptions from '@src/hooks/use-header';
import { SCREENS, SCREENS_TITLE } from '@src/common/constants';
import { SendScreen } from '@src/screens/send';
import { TransferNFTScreen } from '@src/screens/transfer-nft';
import { TransactionDetail, Transactions } from '@src/screens/transactions';
import { DashBoardScreen } from '@src/screens/dashboard';
import { CameraScreen } from '@src/screens/camera';
import {
  GovernanceDetailsScreen,
  GovernanceScreen
} from '@src/screens/governance';
import { SelectNetworkScreen } from '@src/screens/network';
import {
  ValidatorDetailsScreen,
  ValidatorListScreen
} from '@src/screens/stake';
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen
} from '@src/screens/tx-result';
import { SendTronScreen } from '@src/screens/send/send-tron';
import { NotificationScreen } from '@src/screens/notifications/home';
const Stack = createStackNavigator();
export const OtherNavigation: FC = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route, navigation }) => ({
        ...useHeaderOptions(
          {
            title: SCREENS_TITLE[route?.name]
          },
          navigation
        )
      })}
      headerMode="screen"
    >
      <Stack.Screen name={SCREENS.Send} component={SendScreen} />
      <Stack.Screen name={SCREENS.TransferNFT} component={TransferNFTScreen} />
      <Stack.Screen name={SCREENS.Transactions} component={Transactions} />
      <Stack.Screen name={SCREENS.Dashboard} component={DashBoardScreen} />
      <Stack.Screen
        name={SCREENS.TransactionDetail}
        component={TransactionDetail}
      />
      <Stack.Screen
        options={{
          headerShown: false
        }}
        name={SCREENS.Camera}
        component={CameraScreen}
      />

      <Stack.Screen name={SCREENS.Governance} component={GovernanceScreen} />
      <Stack.Screen
        name={SCREENS.GovernanceDetails}
        component={GovernanceDetailsScreen}
      />
      <Stack.Screen
        name={SCREENS.NetworkSelect}
        component={SelectNetworkScreen}
      />
      <Stack.Screen
        name={SCREENS.ValidatorDetails}
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        name={SCREENS.ValidatorList}
        component={ValidatorListScreen}
      />

      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false
        }}
        name={SCREENS.TxPendingResult}
        component={TxPendingResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false
        }}
        name={SCREENS.TxSuccessResult}
        component={TxSuccessResultScreen}
      />
      <Stack.Screen name={SCREENS.SendTron} component={SendTronScreen} />
      <Stack.Screen
        name={SCREENS.Notifications}
        component={NotificationScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false
        }}
        name={SCREENS.TxFailedResult}
        component={TxFailedResultScreen}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});
