/* eslint-disable react/display-name */
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  Image,
  Linking,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Text } from '@src/components/text';
import { KeyRingStatus } from '@owallet/background';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { useStore } from './stores';
import { observer } from 'mobx-react-lite';
import { HomeScreen } from './screens/home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  Header,
  TransitionPresets
} from '@react-navigation/stack';
import { SendScreen } from './screens/send';
import {
  GovernanceDetailsScreen,
  GovernanceScreen
} from './screens/governance';
import { createDrawerNavigator } from '@react-navigation/drawer';
// import { DrawerContent } from './components/drawer';
import { useStyle } from './styles';
import { BorderlessButton } from 'react-native-gesture-handler';

import { SettingScreen } from './screens/setting';
import { SettingSelectAccountScreen } from './screens/setting/screens/select-account';
import { ViewPrivateDataScreen } from './screens/setting/screens/view-private-data';
import { WebScreen } from './screens/web';
import { RegisterIntroScreen } from './screens/register';
import {
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen
} from './screens/register/mnemonic';
import { RegisterEndScreen } from './screens/register/end';
import { RegisterNewUserScreen } from './screens/register/new-user';
import { RegisterNotNewUserScreen } from './screens/register/not-new-user';

import {
  DelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen
} from './screens/stake';
import {
  SettingFillIcon,
  DotsIcon,
  HomeFillIcon,
  BrowserOutLineIcon,
  BrowserFillIcon,
  InvestFillIcon
} from './components/icon';
import {
  AddAddressBookScreen,
  AddressBookScreen
} from './screens/setting/screens/address-book';
import { NewLedgerScreen } from './screens/register/ledger';
import { PageScrollPositionProvider } from './providers/page-scroll-position';
import {
  BlurredHeaderScreenOptionsPreset,
  getPlainHeaderScreenOptionsPresetWithBackgroundColor,
  HeaderRightButton,
  PlainHeaderScreenOptionsPreset
} from './components/header';
import { TokensScreen, TokenDetailScreen } from './screens/tokens';
import { UndelegateScreen } from './screens/stake/undelegate';
import { RedelegateScreen } from './screens/stake/redelegate';
import { CameraScreen } from './screens/camera';
import {
  FocusedScreenProvider,
  useFocusedScreen
} from './providers/focused-screen';
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen
} from './screens/tx-result';
import { HeaderAddIcon, HeaderBackButtonIcon } from './components/header/icon';
import { BlurredBottomTabBar } from './components/bottom-tabbar';
import { UnlockScreen } from './screens/unlock';
import { OWalletVersionScreen } from './screens/setting/screens/version';
import { DAppWebpageScreen } from './screens/web/webpages';
import { WebpageScreenScreenOptionsPreset } from './screens/web/components/webpage-screen';
import { Browser } from './screens/web/browser';
import { BookMarks } from './screens/web/bookmarks';
import { Transactions, TransactionDetail } from './screens/transactions';
import { navigate, navigationRef } from './router/root';
import { handleDeepLink } from './utils/helper';
import { SmartNavigatorProvider } from './navigation.provider';
import TransferTokensScreen from './screens/transfer-tokens/transfer-screen';
import { OnboardingIntroScreen } from './screens/onboarding';
import { NftsScreen, NftDetailScreen } from './screens/nfts';
import { DelegateDetailScreen } from './screens/stake/delegate/delegate-detail';
import { SelectNetworkScreen } from './screens/network';
import { TransferNFTScreen } from './screens/transfer-nft';
import { DashBoardScreen } from './screens/dashboard';
import useHeaderOptions from './hooks/use-header';
import { SCREENS, SCREENS_TITLE } from './common/constants';

const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

export const MainNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        ...useHeaderOptions({ title: SCREENS_TITLE[route?.name] })
      })}
      initialRouteName={SCREENS.Home}
      headerMode="screen"
    >
      <Stack.Screen name={SCREENS.Home} component={HomeScreen} />
      <Stack.Screen
        name={SCREENS.TransactionDetail}
        component={TransactionDetail}
      />
      <Stack.Screen
        options={{
          headerShown: false
        }}
        name={SCREENS.RegisterMain}
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name={SCREENS.RegisterVerifyMnemonicMain}
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name={SCREENS.RegisterEnd}
        component={RegisterEndScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name={SCREENS.RegisterRecoverMnemonicMain}
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name={SCREENS.RegisterNewLedgerMain}
        component={NewLedgerScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.Tokens}
        component={TokensScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.Nfts}
        component={NftsScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.TokenDetail}
        component={TokenDetailScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.NftsDetail}
        component={NftDetailScreen}
      />
    </Stack.Navigator>
  );
};

export const SendNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        ...useHeaderOptions({ title: SCREENS_TITLE[route?.name] })
      })}
      initialRouteName={SCREENS.TransferTokensScreen}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.TransferTokensScreen}
        component={TransferTokensScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const style = useStyle();
  const { appInitStore } = useStore();
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        ...useHeaderOptions({
          title: SCREENS_TITLE[route?.name],
          headerStyle: {
            backgroundColor: colors['plain-background']
          }
        })
      })}
      initialRouteName={SCREENS.RegisterIntro}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: ''
        }}
        name={SCREENS.RegisterIntro}
        component={
          appInitStore.initApp.status
            ? OnboardingIntroScreen
            : RegisterIntroScreen
        }
      />

      <Stack.Screen
        options={{
          title: 'Create a New Wallet'
        }}
        name={SCREENS.RegisterNewUser}
        component={RegisterNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Existing Wallet'
        }}
        name={SCREENS.RegisterNotNewUser}
        component={RegisterNotNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name={SCREENS.RegisterNewMnemonic}
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Verify Mnemonic'
        }}
        name={SCREENS.RegisterVerifyMnemonic}
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Existing Wallet'
        }}
        name={SCREENS.RegisterRecoverMnemonic}
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Hardware Wallet'
        }}
        name={SCREENS.RegisterNewLedger}
        component={NewLedgerScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false
        }}
        name={SCREENS.RegisterEnd}
        component={RegisterEndScreen}
      />
    </Stack.Navigator>
  );
};

export const OtherNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        ...useHeaderOptions({
          title: SCREENS_TITLE[route?.name]
        })
      })}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.Send}
        component={SendScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.TransferNFT}
        component={TransferNFTScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.Transactions}
        component={Transactions}
      />

      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.Dashboard}
        component={DashBoardScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
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

      <Stack.Screen
        options={{
          title: 'Governance'
        }}
        name={SCREENS.Governance}
        component={GovernanceScreen}
      />
      <Stack.Screen
        options={{
          title: 'Proposal'
        }}
        name={SCREENS.GovernanceDetails}
        component={GovernanceDetailsScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.NetworkSelect}
        component={SelectNetworkScreen}
      />
      <Stack.Screen
        options={{
          title: 'Validator Details'
        }}
        name={SCREENS.ValidatorDetails}
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: 'All Active Validators'
        }}
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

export const SettingStackScreen: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  const { colors } = useTheme();

  const { analyticsStore } = useStore();

  return (
    <Stack.Navigator
      screenOptions={{
        ...PlainHeaderScreenOptionsPreset,
        headerTitleStyle: {
          fontSize: 18,
          lineHeight: 24,
          letterSpacing: 0.3,
          color: colors['primary-text']
        },
        headerStyle: {
          backgroundColor: colors['primary'],
          shadowColor: 'transparent', // this covers iOS
          elevation: 0 // this covers Android
        }
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'Settings',
          ...getPlainHeaderScreenOptionsPresetWithBackgroundColor(
            style.get('color-setting-screen-background').color
          ),
          headerTitleStyle: style.flatten(['h3', 'color-text-black-high'])
        }}
        name={SCREENS.Setting}
        component={SettingScreen}
      />
      <Stack.Screen
        name={SCREENS.SettingSelectAccount}
        options={{
          title: 'Select Account',
          headerRight: () => (
            <HeaderRightButton
              onPress={() => {
                analyticsStore.logEvent('Add additional account started');
                navigation.navigate('Register', {
                  screen: 'Register.Intro'
                });
              }}
            >
              <HeaderAddIcon />
            </HeaderRightButton>
          ),
          ...BlurredHeaderScreenOptionsPreset,
          headerStyle: {
            backgroundColor: colors['primary'],
            shadowColor: 'transparent', // this covers iOS
            elevation: 0 // this covers Android
          }
        }}
        component={SettingSelectAccountScreen}
      />

      <Stack.Screen
        name={SCREENS.SettingViewPrivateData}
        component={ViewPrivateDataScreen}
      />
      <Stack.Screen
        options={{
          title: 'Version'
        }}
        name={SCREENS.SettingVersion}
        component={OWalletVersionScreen}
      />
    </Stack.Navigator>
  );
};

export const AddressBookStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: 'Address Book'
        }}
        name={SCREENS.AddressBook}
        component={AddressBookScreen}
      />
      <Stack.Screen
        options={{
          ...useHeaderOptions()
        }}
        name={SCREENS.AddAddressBook}
        component={AddAddressBookScreen}
      />
    </Stack.Navigator>
  );
};

export const WebNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      initialRouteName={SCREENS.Browser}
      screenOptions={{
        ...WebpageScreenScreenOptionsPreset
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: 'Browser'
        }}
        name={SCREENS.Browser}
        component={Browser}
      />
      <Stack.Screen
        options={{
          title: 'BookMarks'
        }}
        name={SCREENS.BookMarks}
        component={BookMarks}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={SCREENS.WebIntro}
        component={WebScreen}
      />
      <Stack.Screen name={SCREENS.WebDApp} component={DAppWebpageScreen} />
    </Stack.Navigator>
  );
};

export const InvestNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        ...useHeaderOptions({
          title: SCREENS_TITLE[route?.name]
        })
      })}
      initialRouteName="Invest"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: ''
        }}
        name={SCREENS.Invest}
        component={StakingDashboardScreen}
      />
      <Stack.Screen
        options={{
          title: 'Validator List'
        }}
        name={SCREENS.ValidatorList}
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: 'Validator Details'
        }}
        name={SCREENS.ValidatorDetails}
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: 'Stake'
        }}
        name={SCREENS.Delegate}
        component={DelegateScreen}
      />
      <Stack.Screen
        options={{
          title: 'Delegate Detail'
        }}
        name={SCREENS.DelegateDetail}
        component={DelegateDetailScreen}
      />
      <Stack.Screen
        options={{
          title: 'Switch Validator'
        }}
        name={SCREENS.Redelegate}
        component={RedelegateScreen}
      />
      <Stack.Screen
        options={{
          title: 'Unstake'
        }}
        name={SCREENS.Undelegate}
        component={UndelegateScreen}
      />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();
  const { chainStore } = useStore();

  const { colors } = useTheme();

  const focusedScreen = useFocusedScreen();

  useEffect(() => {
    // When the focused screen is not "Home" screen and the drawer is open,
    // try to close the drawer forcely.
    // navigate("Browser")
    // if (focusedScreen.name !== 'Home' && isDrawerOpen) {
    //   navigation.dispatch(DrawerActions.toggleDrawer());
    // }
  }, [focusedScreen.name, navigation]);

  const checkActiveTabBottom = (name: string) => {
    return name.includes(focusedScreen.name);
  };

  const RenderTabsBarIcon = ({ name }) => {
    let choosen = checkActiveTabBottom(name);

    if (name === SCREENS.TABS.Settings) {
      choosen = checkActiveTabBottom('Setting');
    }
    let icon;
    let nameRoute = name;
    switch (name) {
      case SCREENS.TABS.Main:
        icon = choosen ? (
          <HomeFillIcon color={colors['purple-700']} />
        ) : (
          <HomeFillIcon color={colors['icon-text']} />
        );
        break;
      case SCREENS.TABS.Home:
        icon = choosen ? (
          <HomeFillIcon color={colors['purple-700']} />
        ) : (
          <HomeFillIcon color={colors['icon-text']} />
        );
        break;
      case SCREENS.TABS.Home:
        icon = choosen ? (
          <BrowserOutLineIcon color={colors['purple-700']} />
        ) : (
          <BrowserFillIcon color={colors['icon-text']} />
        );
        break;
      case SCREENS.TABS.Invest:
        icon = choosen ? (
          <InvestFillIcon color={colors['purple-700']} />
        ) : (
          <InvestFillIcon color={colors['icon-text']} />
        );
        break;
      case SCREENS.TABS.Settings:
        icon = choosen ? (
          <SettingFillIcon color={colors['purple-700']} />
        ) : (
          <SettingFillIcon color={colors['icon-text']} />
        );
        break;
      default:
        icon = choosen ? (
          <SettingFillIcon color={colors['purple-700']} />
        ) : (
          <SettingFillIcon color={colors['icon-text']} />
        );
        break;
    }

    return (
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: choosen ? 30 : 12
        }}
      >
        {icon}
        {!!nameRoute && (
          <Text
            style={{
              fontSize: 12,
              lineHeight: 16,
              color: choosen ? colors['purple-700'] : colors['icon-text']
            }}
          >
            {nameRoute}
          </Text>
        )}

        {choosen && (
          <View style={{ paddingTop: 10 }}>
            <DotsIcon />
          </View>
        )}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          switch (route.name) {
            case SCREENS.TABS.Main:
              return <RenderTabsBarIcon name={SCREENS.TABS.Home} />;
            case SCREENS.TABS.Browser:
              return <RenderTabsBarIcon name={SCREENS.TABS.Browser} />;
            case SCREENS.TABS.SendNavigation:
              return (
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: checkActiveTabBottom(route.name) ? 30 : 8
                  }}
                >
                  <Image
                    style={{
                      width: 50,
                      height: 50
                    }}
                    source={require('./assets/image/push.png')}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                  {checkActiveTabBottom(route.name) && (
                    <View style={{ paddingTop: 14 }}>
                      <DotsIcon />
                    </View>
                  )}
                </View>
              );
            case SCREENS.TABS.Invest:
              return <RenderTabsBarIcon name={SCREENS.TABS.Invest} />;
            case SCREENS.TABS.Settings:
              return <RenderTabsBarIcon name={SCREENS.TABS.Settings} />;
          }
        },
        tabBarButton: (props) => (
          <View
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <BorderlessButton
              {...props}
              activeOpacity={1}
              style={{
                height: '100%',
                aspectRatio: 1.9,
                maxWidth: '100%'
              }}
            />
          </View>
        )
      })}
      tabBarOptions={{
        activeTintColor: style.get('color-primary').color,
        inactiveTintColor: style.get('color-text-black-very-very-low').color,
        style: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: colors['primary'],
          shadowColor: style.get('color-transparent').color,
          elevation: 0,
          paddingLeft: 10,
          paddingRight: 10,
          height: Platform.OS === 'android' ? 80 : 110
        },
        showLabel: false
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={['Home']} />
      )}
    >
      <Tab.Screen name={SCREENS.TABS.Main} component={MainNavigation} />
      <Tab.Screen name={SCREENS.TABS.Browser} component={WebNavigation} />
      <Tab.Screen
        options={{
          title: 'SendNavigation'
        }}
        name={SCREENS.TABS.SendNavigation}
        component={SendNavigation}
        initialParams={{
          currency: chainStore.current.stakeCurrency.coinMinimalDenom,
          chainId: chainStore.current.chainId
        }}
      />
      <Tab.Screen name={SCREENS.TABS.Invest} component={InvestNavigation} />
      <Tab.Screen
        name={SCREENS.TABS.Settings}
        component={SettingStackScreen}
        options={{
          unmountOnBlur: true
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore, deepLinkUriStore, appInitStore } = useStore();
  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          const SCHEME_IOS = 'owallet://open_url?url=';
          const SCHEME_ANDROID = 'app.owallet.oauth://google/open_url?url=';
          deepLinkUriStore.updateDeepLink(
            url.replace(SCHEME_ANDROID, '').replace(SCHEME_IOS, '')
          );
        }
      })
      .catch((err) => {
        console.warn('Deeplinking error', err);
      });
    Linking.addEventListener('url', handleDeepLink);
    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  const scheme = appInitStore.getInitApp.theme;

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
              initialRouteName={
                keyRingStore.status !== KeyRingStatus.UNLOCKED
                  ? SCREENS.STACK.Unlock
                  : SCREENS.STACK.MainTab
              }
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS
              }}
              headerMode="screen"
            >
              <Stack.Screen
                name={SCREENS.STACK.Unlock}
                component={UnlockScreen}
              />
              <Stack.Screen
                name={SCREENS.STACK.MainTab}
                component={MainTabNavigation}
              />
              <Stack.Screen
                name={SCREENS.STACK.Register}
                component={RegisterNavigation}
              />
              <Stack.Screen
                name={SCREENS.STACK.Others}
                component={OtherNavigation}
              />
              <Stack.Screen
                name={SCREENS.STACK.AddressBooks}
                component={AddressBookStackScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SmartNavigatorProvider>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
