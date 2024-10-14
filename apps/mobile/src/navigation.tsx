/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect } from "react";
import { Linking, View } from "react-native";
import { KeyRingStatus } from "@owallet/background";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import { FocusedScreenProvider } from "./providers/focused-screen";

import analytics from "@react-native-firebase/analytics";
import { navigate, navigationRef } from "./router/root";
import { handleDeepLink } from "./utils/helper";

import { SCREENS, SCREENS_OPTIONS } from "./common/constants";
import { MainTabNavigation } from "./navigations";
import { useTheme } from "./themes/theme-provider";
import { PincodeUnlockScreen } from "./screens/unlock/pincode-unlock";
import { RecoverPhraseScreen } from "./screens/register/mnemonic/recover-phrase";
import { ErrorBoundary } from "react-error-boundary";
import { Text } from "./components/text";
import { TokenDetailsScreen, TokensScreen } from "./screens/tokens";
import { BackupMnemonicScreen } from "./screens/register/mnemonic/backup-mnemonic";
import {
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "./screens/register/mnemonic";
import { RegisterEndScreen } from "./screens/register/end";
import { RegisterDoneScreen } from "./screens/register/done";
import { NewLedgerScreen } from "./screens/register/ledger";
import { NftDetailScreen, NftsScreen } from "./screens/nfts";
import {
  DelegateScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "./screens/stake";
import { DelegateDetailScreen } from "./screens/stake/delegate/delegate-detail";
import { RedelegateScreen } from "./screens/stake/redelegate";
import { UndelegateScreen } from "./screens/stake/undelegate";
import { SendScreen } from "./screens/send";
import { PincodeScreen } from "./screens/pincode/pincode";
import { NewSendScreen } from "./screens/send/send";
import { SendEvmScreen } from "./screens/send/send-evm";
import TxTransactionsScreen from "./screens/transactions/tx-transaction-screen";
import { HistoryDetail } from "./screens/transactions/history-detail";
import { CameraScreen } from "./screens/camera";
import { AddressQRScreen } from "./screens/qr";
import { SelectNetworkScreen } from "./screens/network";
import { AddTokenScreen } from "./screens/network/add-token";
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen,
} from "./screens/tx-result";
import BuyFiat from "./screens/home/buy-fiat";
import { SendTronScreen } from "./screens/send/send-tron";
import { SendBtcScreen } from "./screens/send/send-btc";
import { OnboardingIntroScreen } from "./screens/onboarding";
import { RegisterIntroScreen } from "./screens/register";
import { NewPincodeScreen } from "./screens/register/register-pincode";
import { HeaderRightButton } from "./components/header";
import { HeaderAddIcon } from "./components/header/icon";
import { SettingSelectAccountScreen } from "./screens/setting/screens/select-account";
import { ViewPrivateDataScreen } from "./screens/setting/screens/view-private-data";
import { OWalletVersionScreen } from "./screens/setting/screens/version";
import { DetailsBrowserScreen } from "./screens/web/details-browser-screen";
import { BookmarksScreen } from "./screens/web/bookmarks-screen";
import { WebScreen } from "./screens/web";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/screens/address-book";
import useHeaderOptions from "./hooks/use-header";
import { ManageWalletConnectScreen } from "@screens/setting/screens/manage-walletconnect/ManageWalletConnectScreen";
import { SelectChainsScreen } from "@screens/setting/screens/manage-chains/select-chains";
import { OWButton } from "@components/button";
import OWButtonIcon from "@components/button/ow-button-icon";
import OWIcon from "@components/ow-icon/ow-icon";
import { AddChainScreen } from "@screens/setting/screens/manage-chains/add-network";

const Stack = createStackNavigator();
export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const handleScreenOptions = ({ route, navigation }) => {
    const headerOptions = useHeaderOptions(
      { title: SCREENS_OPTIONS[route?.name]?.title },
      navigation
    );
    return headerOptions;
  };

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <NavigationContainer
          theme={
            {
              colors: {
                background: colors["background"],
              },
            } as any
          }
          ref={navigationRef}
          onStateChange={async () => {
            await analytics().logScreenView({
              screen_name: navigationRef.current.getCurrentRoute().name,
              screen_class: navigationRef.current.getCurrentRoute().name,
            });
          }}
        >
          <Stack.Navigator
            initialRouteName={
              // keyRingStore.status !== KeyRingStatus.UNLOCKED
              //   ? SCREENS.STACK.PincodeUnlock
              //   : SCREENS.STACK.MainTab
              SCREENS.STACK.PincodeUnlock
            }
            screenOptions={handleScreenOptions}
          >
            <Stack.Screen
              name={SCREENS.STACK.PincodeUnlock}
              component={PincodeUnlockScreen}
            />
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterRecoverPhrase}*/}
            {/*    component={RecoverPhraseScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterIntro}*/}
            {/*    component={*/}
            {/*      appInitStore.getInitApp.status*/}
            {/*        ? OnboardingIntroScreen*/}
            {/*        : RegisterIntroScreen*/}
            {/*    }*/}
            {/*  />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterNewPincode}*/}
            {/*    component={NewPincodeScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.ManageWalletConnect}*/}
            {/*    component={ManageWalletConnectScreen}*/}
            {/*  />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.SettingSelectAccount}*/}
            {/*    options={{*/}
            {/*      headerRight: () => (*/}
            {/*        <HeaderRightButton*/}
            {/*          onPress={() => {*/}
            {/*            // analyticsStore.logEvent("Add additional account started");*/}
            {/*            navigate(SCREENS.RegisterIntro, {*/}
            {/*              canBeBack: true,*/}
            {/*            });*/}
            {/*          }}*/}
            {/*        >*/}
            {/*          <HeaderAddIcon />*/}
            {/*        </HeaderRightButton>*/}
            {/*      ),*/}
            {/*    }}*/}
            {/*    component={SettingSelectAccountScreen}*/}
            {/*  />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.SettingViewPrivateData}*/}
            {/*    component={ViewPrivateDataScreen}*/}
            {/*  />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.SettingVersion}*/}
            {/*    component={OWalletVersionScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.DetailsBrowser}*/}
            {/*    component={DetailsBrowserScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.BookMarks}*/}
            {/*    component={BookmarksScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    options={{ headerShown: false }}*/}
            {/*    name={SCREENS.WebIntro}*/}
            {/*    component={WebScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.AddressBook}*/}
            {/*    component={AddressBookScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen name={SCREENS.AddChain} component={AddChainScreen} />*/}

            {/*  <Stack.Screen*/}
            {/*    options={{*/}
            {/*      headerRight: () => {*/}
            {/*        return (*/}
            {/*          <OWButtonIcon*/}
            {/*            name={"tdesignadd"}*/}
            {/*            sizeIcon={24}*/}
            {/*            onPress={() => navigate(SCREENS.AddChain)}*/}
            {/*            fullWidth={false}*/}
            {/*            style={{*/}
            {/*              backgroundColor: colors["neutral-surface-card"],*/}
            {/*              height: 40,*/}
            {/*              width: 40,*/}
            {/*              borderRadius: 99,*/}
            {/*              marginRight: 16,*/}
            {/*            }}*/}
            {/*            colorIcon={colors["neutral-text-action-on-light-bg"]}*/}
            {/*          />*/}
            {/*        );*/}
            {/*      },*/}
            {/*    }}*/}
            {/*    name={SCREENS.ManageChain}*/}
            {/*    component={SelectChainsScreen}*/}
            {/*  />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.AddAddressBook}*/}
            {/*    component={AddAddressBookScreen}*/}
            {/*  />*/}
            <Stack.Screen
              name={SCREENS.STACK.MainTab}
              component={MainTabNavigation}
            />
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.TokenDetails}*/}
            {/*    component={TokenDetailsScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.BackupMnemonic}*/}
            {/*    component={BackupMnemonicScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    options={{*/}
            {/*      headerShown: false,*/}
            {/*    }}*/}
            {/*    name={SCREENS.RegisterMain}*/}
            {/*    component={NewMnemonicScreen}*/}
            {/*  />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterVerifyMnemonic}*/}
            {/*    component={VerifyMnemonicScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterEnd}*/}
            {/*    component={RegisterEndScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterDone}*/}
            {/*    component={RegisterDoneScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterRecoverMnemonicMain}*/}
            {/*    component={RecoverMnemonicScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterNewMnemonic}*/}
            {/*    component={NewMnemonicScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterRecoverPhraseMain}*/}
            {/*    component={RecoverPhraseScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterNewLedger}*/}
            {/*    component={NewLedgerScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterNewLedgerMain}*/}
            {/*    component={NewLedgerScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen name={SCREENS.Tokens} component={TokensScreen} />*/}
            {/*  <Stack.Screen name={SCREENS.Nfts} component={NftsScreen} />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.NftsDetail}*/}
            {/*    component={NftDetailScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.ValidatorList}*/}
            {/*    component={ValidatorListScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.ValidatorDetails}*/}
            {/*    component={ValidatorDetailsScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen name={SCREENS.Delegate} component={DelegateScreen} />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.DelegateDetail}*/}
            {/*    component={DelegateDetailScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.Redelegate}*/}
            {/*    component={RedelegateScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.Undelegate}*/}
            {/*    component={UndelegateScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen name={SCREENS.Send} component={SendScreen} />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.PincodeScreen}*/}
            {/*    component={PincodeScreen}*/}
            {/*  />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.SettingBackupMnemonic}*/}
            {/*    component={BackupMnemonicScreen}*/}
            {/*  />*/}
            {/*  /!*<Stack.Screen name={SCREENS.NewSend} component={NewSendScreen} />*!/*/}
            {/*  <Stack.Screen name={SCREENS.NewSend} component={NewSendScreen} />*/}
            {/*  <Stack.Screen name={SCREENS.SendEvm} component={SendEvmScreen} />*/}
            {/*  <Stack.Screen name={SCREENS.SendOasis} component={SendEvmScreen} />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.Transactions}*/}
            {/*    component={TxTransactionsScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.HistoryDetail}*/}
            {/*    component={HistoryDetail}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    options={{*/}
            {/*      headerShown: false,*/}
            {/*    }}*/}
            {/*    name={SCREENS.Camera}*/}
            {/*    component={CameraScreen}*/}
            {/*  />*/}

            {/*  <Stack.Screen name={SCREENS.QRScreen} component={AddressQRScreen} />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.NetworkSelect}*/}
            {/*    component={SelectNetworkScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.NetworkToken}*/}
            {/*    component={AddTokenScreen}*/}
            {/*  />*/}

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.TxPendingResult}*/}
            {/*    component={TxPendingResultScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.TxSuccessResult}*/}
            {/*    component={TxSuccessResultScreen}*/}
            {/*  />*/}
            {/*  <Stack.Screen name={SCREENS.BuyFiat} component={BuyFiat} />*/}
            {/*  <Stack.Screen name={SCREENS.SendTron} component={SendTronScreen} />*/}
            {/*  <Stack.Screen name={SCREENS.SendBtc} component={SendBtcScreen} />*/}
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.TxFailedResult}*/}
            {/*    component={TxFailedResultScreen}*/}
            {/*  />*/}
          </Stack.Navigator>
        </NavigationContainer>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
