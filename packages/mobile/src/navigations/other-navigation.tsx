import { StyleSheet } from "react-native";
import React, { FC } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import useHeaderOptions from "@src/hooks/use-header";
import { SCREENS, SCREENS_OPTIONS } from "@src/common/constants";
import { SendScreen } from "@src/screens/send";
import { TransferNFTScreen } from "@src/screens/transfer-nft";
import { DashBoardScreen } from "@src/screens/dashboard";
import { CameraScreen } from "@src/screens/camera";
import {
  GovernanceDetailsScreen,
  GovernanceScreen,
} from "@src/screens/governance";
import { SelectNetworkScreen } from "@src/screens/network";
import {
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "@src/screens/stake";
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen,
} from "@src/screens/tx-result";
import { SendTronScreen } from "@src/screens/send/send-tron";
import { NotificationScreen } from "@src/screens/notifications/home";
import HistoryTransactionsScreen from "@src/screens/transactions/history-transactions-screen";
import TransactionDetailScreen from "@src/screens/transactions/transaction-detail-screen";
import { AddTokenScreen } from "@src/screens/network/add-token";
import { SendBtcScreen } from "@src/screens/send/send-btc";
import BtcFaucet from "@src/screens/home/btc-faucet";
import BuyFiat from "@src/screens/home/buy-fiat";
import { SendOasisScreen } from "@src/screens/send/send-oasis";
import { NewSendScreen } from "@src/screens/send/send";
import { AddressQRScreen } from "@src/screens/qr";
const Stack = createStackNavigator();
export const OtherNavigation: FC = () => {
  const handleScreenOptions = ({ route, navigation }) => {
    const headerOptions = useHeaderOptions(
      { title: SCREENS_OPTIONS[route?.name].title },
      navigation
    );
    return headerOptions;
  };
  return (
    <Stack.Navigator screenOptions={handleScreenOptions}>
      <Stack.Screen name={SCREENS.Send} component={SendScreen} />
      {/*<Stack.Screen name={SCREENS.NewSend} component={NewSendScreen} />*/}
      <Stack.Screen name={SCREENS.NewSend} component={NewSendScreen} />
      <Stack.Screen name={SCREENS.SendOasis} component={SendOasisScreen} />
      <Stack.Screen name={SCREENS.TransferNFT} component={TransferNFTScreen} />
      <Stack.Screen
        name={SCREENS.Transactions}
        component={HistoryTransactionsScreen}
      />
      <Stack.Screen name={SCREENS.Dashboard} component={DashBoardScreen} />
      <Stack.Screen
        name={SCREENS.TransactionDetail}
        component={TransactionDetailScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name={SCREENS.Camera}
        component={CameraScreen}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name={SCREENS.QRScreen}
        component={AddressQRScreen}
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
      <Stack.Screen name={SCREENS.NetworkToken} component={AddTokenScreen} />
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
          headerShown: false,
        }}
        name={SCREENS.TxPendingResult}
        component={TxPendingResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name={SCREENS.TxSuccessResult}
        component={TxSuccessResultScreen}
      />
      <Stack.Screen name={SCREENS.BtcFaucet} component={BtcFaucet} />
      <Stack.Screen name={SCREENS.BuyFiat} component={BuyFiat} />
      <Stack.Screen name={SCREENS.SendTron} component={SendTronScreen} />
      <Stack.Screen
        name={SCREENS.Notifications}
        component={NotificationScreen}
      />
      <Stack.Screen name={SCREENS.SendBtc} component={SendBtcScreen} />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name={SCREENS.TxFailedResult}
        component={TxFailedResultScreen}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});
