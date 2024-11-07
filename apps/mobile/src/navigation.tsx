/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { createStackNavigator } from "@react-navigation/stack";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import { FocusedScreenProvider } from "./providers/focused-screen";
import analytics from "@react-native-firebase/analytics";
import { navigate, navigationRef, resetTo } from "./router/root";
import { SCREENS, SCREENS_OPTIONS } from "./common/constants";
import { MainTabNavigation } from "./navigations";
import { useTheme } from "./themes/theme-provider";
import { PincodeUnlockScreen } from "./screens/unlock/pincode-unlock";
import { TokenDetailsScreen } from "./screens/tokens";
import { RegisterEndScreen } from "./screens/register/end";
import { RegisterDoneScreen } from "./screens/register/done";
import { NewLedgerScreen } from "./screens/register/ledger";
import { NftDetailScreen, NftsScreen } from "./screens/nfts";
import {
  DelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "./screens/stake";
import { DelegateDetailScreen } from "./screens/stake/delegate/delegate-detail";
import { RedelegateScreen } from "./screens/stake/redelegate";
import { UndelegateScreen } from "./screens/stake/undelegate";
import { SendScreen } from "./screens/send";
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
import { OnboardingIntroScreen } from "./screens/onboarding";
import { RegisterIntroScreen } from "./screens/register";
import { NewPincodeScreen } from "./screens/register/register-pincode";
import { HeaderRightButton } from "./components/header";
import { HeaderAddIcon } from "./components/header/icon";
import { SettingSelectAccountScreen } from "./screens/setting/screens/select-account";
import { ViewPrivateDataScreen } from "./screens/setting/screens/view-private-data";
import { OWalletVersionScreen } from "./screens/setting/screens/version";

import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/screens/address-book";
import useHeaderOptions from "./hooks/use-header";
import { ManageWalletConnectScreen } from "@screens/setting/screens/manage-walletconnect/ManageWalletConnectScreen";
import { SelectChainsScreen } from "@screens/setting/screens/manage-chains/select-chains";
import OWButtonIcon from "@components/button/ow-button-icon";
import { AddChainScreen } from "@screens/setting/screens/manage-chains/add-network";
import LottieView from "lottie-react-native";
import { metrics } from "./themes";
import { ChainIdEnum, EmbedChainInfos } from "@owallet/common";
import { ConnectLedgerScreen } from "@screens/register/connect-ledger";
import { ConnectHardwareWalletScreen } from "@screens/register/connect-hardware";
import { FinalizeKeyScreen } from "@screens/register/finalize-key";
import { EnableChainsScreen } from "@screens/register/enable-chains";
import { WelcomeScreen } from "@screens/register/welcome";
import { NewMnemonicScreen } from "@screens/register/new-mnemonic";
import { VerifyMnemonicScreen } from "@screens/register/verify-mnemonic";
import { SendEvmNewScreen } from "./screens/send/send-evm-new";
import { RecoverMnemonicScreen } from "@screens/register/recover-mnemonic";
import { BackupMnemonicScreen } from "@screens/register/backup-mnemonic";

const Stack = createStackNavigator();
const FullScreenModal = observer(() => {
  const { appInitStore, chainStore } = useStore();

  if (appInitStore.getInitApp.wallet === "osmosis") {
    return (
      <LottieView
        source={require("@src/assets/animations/osmo-animate.json")}
        style={{ width: metrics.screenWidth, height: metrics.screenHeight }}
        resizeMode={"cover"}
        autoPlay
        loop={false}
        onAnimationFinish={() => {
          chainStore.selectChain(ChainIdEnum.Osmosis);
          resetTo(SCREENS.STACK.MainTab);
        }}
      />
    );
  } else if (appInitStore.getInitApp.wallet === "injective") {
    return (
      <LottieView
        source={require("@src/assets/animations/inj-animate.json")}
        style={{ width: metrics.screenWidth, height: metrics.screenHeight }}
        resizeMode={"cover"}
        autoPlay
        loop={false}
        onAnimationFinish={() => {
          chainStore.selectChain(ChainIdEnum.Injective);
          resetTo(SCREENS.STACK.MainTab);
        }}
      />
    );
  } else {
    return (
      <LottieView
        source={require("@src/assets/animations/splashscreen.json")}
        style={{ width: metrics.screenWidth, height: metrics.screenHeight }}
        resizeMode={"cover"}
        autoPlay
        loop={false}
        onAnimationFinish={() => {
          chainStore.selectChain(ChainIdEnum.Oraichain);
          resetTo(SCREENS.STACK.MainTab);
        }}
      />
    );
  }
});
export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore, appInitStore, chainStore } = useStore();

  const [isInit, setIsInit] = useState(true);
  if (isInit) {
    if (appInitStore.getInitApp.wallet === "osmosis") {
      return (
        <LottieView
          source={require("@src/assets/animations/osmo-animate.json")}
          style={{ width: metrics.screenWidth, height: metrics.screenHeight }}
          resizeMode={"cover"}
          autoPlay
          loop={false}
          onAnimationFinish={() => {
            chainStore.selectChain(ChainIdEnum.Osmosis);
            setIsInit(false);
          }}
        />
      );
    } else if (appInitStore.getInitApp.wallet === "injective") {
      return (
        <LottieView
          source={require("@src/assets/animations/inj-animate.json")}
          style={{ width: metrics.screenWidth, height: metrics.screenHeight }}
          resizeMode={"cover"}
          autoPlay
          loop={false}
          onAnimationFinish={() => {
            chainStore.selectChain(ChainIdEnum.Injective);
            setIsInit(false);
          }}
        />
      );
    } else {
      return (
        <LottieView
          source={require("@src/assets/animations/splashscreen.json")}
          style={{ width: metrics.screenWidth, height: metrics.screenHeight }}
          resizeMode={"cover"}
          autoPlay
          loop={false}
          onAnimationFinish={() => {
            chainStore.selectChain(ChainIdEnum.Oraichain);
            setIsInit(false);
          }}
        />
      );
    }
  }

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
              keyRingStore.status !== "unlocked"
                ? SCREENS.STACK.PincodeUnlock
                : SCREENS.STACK.MainTab
            }
            screenOptions={handleScreenOptions}
          >
            <Stack.Screen
              name="FullScreenModal"
              component={FullScreenModal}
              options={{
                presentation: "modal", // Set to 'transparentModal' for translucent background
                headerShown: false, // Hide header for full screen effect
                cardStyleInterpolator: ({ current, next }) => ({
                  cardStyle: {
                    opacity: next ? next.progress : current.progress, // Fade-in and fade-out effect
                  },
                }),
              }}
            />
            <Stack.Screen
              name={SCREENS.STACK.PincodeUnlock}
              component={PincodeUnlockScreen}
            />

            <Stack.Screen
              name={SCREENS.ManageWalletConnect}
              component={ManageWalletConnectScreen}
            />

            <Stack.Screen
              name={SCREENS.SettingSelectAccount}
              options={{
                headerRight: () => (
                  <HeaderRightButton
                    onPress={() => {
                      navigate(SCREENS.RegisterIntro, {
                        canBeBack: true,
                      });
                    }}
                  >
                    <HeaderAddIcon />
                  </HeaderRightButton>
                ),
              }}
              component={SettingSelectAccountScreen}
            />

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.SettingViewPrivateData}*/}
            {/*    component={ViewPrivateDataScreen}*/}
            {/*  />*/}

            <Stack.Screen
              name={SCREENS.SettingVersion}
              component={OWalletVersionScreen}
            />

            <Stack.Screen
              name={SCREENS.AddressBook}
              component={AddressBookScreen}
            />
            <Stack.Screen name={SCREENS.AddChain} component={AddChainScreen} />

            <Stack.Screen
              options={{
                headerRight: () => {
                  return (
                    <OWButtonIcon
                      name={"tdesignadd"}
                      sizeIcon={24}
                      onPress={() => navigate(SCREENS.AddChain)}
                      fullWidth={false}
                      style={{
                        backgroundColor: colors["neutral-surface-card"],
                        height: 40,
                        width: 40,
                        borderRadius: 99,
                        marginRight: 16,
                      }}
                      colorIcon={colors["neutral-text-action-on-light-bg"]}
                    />
                  );
                },
              }}
              name={SCREENS.ManageChain}
              component={SelectChainsScreen}
            />
            <Stack.Screen
              name="Register.EnableChain"
              component={EnableChainsScreen}
            />
            <Stack.Screen
              name="Register.Welcome"
              options={{ headerShown: false }}
              component={WelcomeScreen}
            />
            <Stack.Screen
              name="Register.FinalizeKey"
              // options={{ headerShown: false }}
              component={FinalizeKeyScreen}
            />
            <Stack.Screen
              name={SCREENS.AddAddressBook}
              component={AddAddressBookScreen}
            />
            <Stack.Screen
              name={SCREENS.STACK.MainTab}
              component={MainTabNavigation}
            />
            <Stack.Screen
              name={SCREENS.TokenDetails}
              component={TokenDetailsScreen}
            />

            <Stack.Screen
              name={SCREENS.RegisterIntro}
              component={
                appInitStore.getInitApp.status
                  ? OnboardingIntroScreen
                  : RegisterIntroScreen
              }
            />
            <Stack.Screen
              name={SCREENS.RegisterRecoverPhrase}
              component={RecoverMnemonicScreen}
            />
            <Stack.Screen
              name={SCREENS.RegisterNewPincode}
              component={NewPincodeScreen}
            />
            <Stack.Screen
              name={SCREENS.RegisterVerifyMnemonic}
              component={VerifyMnemonicScreen}
            />
            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.RegisterEnd}*/}
            {/*    component={RegisterEndScreen}*/}
            {/*  />*/}
            <Stack.Screen
              name={SCREENS.RegisterDone}
              component={RegisterDoneScreen}
            />
            <Stack.Screen
              name={SCREENS.RegisterNewMnemonic}
              component={NewMnemonicScreen}
            />
            <Stack.Screen
              name={SCREENS.RegisterNewLedger}
              component={ConnectHardwareWalletScreen}
            />
            <Stack.Screen
              name={SCREENS.ConnectNewLedger}
              component={ConnectLedgerScreen}
            />
            <Stack.Screen name={SCREENS.Nfts} component={NftsScreen} />
            <Stack.Screen
              name={SCREENS.NftsDetail}
              component={NftDetailScreen}
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
            <Stack.Screen
              name={SCREENS.Redelegate}
              component={RedelegateScreen}
            />
            <Stack.Screen
              name={SCREENS.Undelegate}
              component={UndelegateScreen}
            />

            <Stack.Screen
              name={SCREENS.SettingBackupMnemonic}
              component={BackupMnemonicScreen}
            />
            <Stack.Screen name={SCREENS.Send} component={SendScreen} />
            <Stack.Screen
              name={SCREENS.Transactions}
              component={TxTransactionsScreen}
            />
            <Stack.Screen
              name={SCREENS.HistoryDetail}
              component={HistoryDetail}
            />
            <Stack.Screen
              options={{
                headerShown: false,
              }}
              name={SCREENS.Camera}
              component={CameraScreen}
            />

            <Stack.Screen name={SCREENS.QRScreen} component={AddressQRScreen} />

            {/*  <Stack.Screen*/}
            {/*    name={SCREENS.NetworkSelect}*/}
            {/*    component={SelectNetworkScreen}*/}
            {/*  />*/}
            <Stack.Screen
              name={SCREENS.NetworkToken}
              component={AddTokenScreen}
            />

            <Stack.Screen name={SCREENS.BuyFiat} component={BuyFiat} />
            <Stack.Screen
              name={SCREENS.TxFailedResult}
              component={TxFailedResultScreen}
            />
            <Stack.Screen
              name={SCREENS.TxPendingResult}
              component={TxPendingResultScreen}
            />
            <Stack.Screen
              name={SCREENS.TxSuccessResult}
              component={TxSuccessResultScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
