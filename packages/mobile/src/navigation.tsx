/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect } from 'react';
import { Alert, Image, Linking, View } from 'react-native';
import { CText as Text } from './components/text';
import { KeyRingStatus } from '@owallet/background';
import {
  DrawerActions,
  NavigationContainer,
  useNavigation
} from '@react-navigation/native';
import { useStore } from './stores';
import { observer } from 'mobx-react-lite';
import { HomeScreen } from './screens/home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  TransitionPresets
} from '@react-navigation/stack';
import { SendScreen } from './screens/send';
import {
  GovernanceDetailsScreen,
  GovernanceScreen
} from './screens/governance';
import {
  createDrawerNavigator,
  useIsDrawerOpen
} from '@react-navigation/drawer';
import { DrawerContent } from './components/drawer';
import { useStyle } from './styles';
import { BorderlessButton } from 'react-native-gesture-handler';

import { SettingScreen } from './screens/setting';
import { SettingSelectAccountScreen } from './screens/setting/screens/select-account';
import { SettingSelectLangScreen } from './screens/setting/screens/select-lang';
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
  SettingOutLineIcon,
  DotsIcon,
  HomeFillIcon,
  HomeOutlineIcon,
  BrowserOutLineIcon,
  BrowserFillIcon,
  InvestOutlineIcon,
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
  HeaderLeftButton,
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
import {
  SmartNavigatorProvider,
  useSmartNavigation
} from './navigation.provider';
import TransferTokensScreen from './screens/transfer-tokens/transfer-screen';
import { OnboardingIntroScreen } from './screens/onboarding';
import { NftsScreen, NftDetailScreen } from './screens/nfts';
import { DelegateDetailScreen } from './screens/stake/delegate/delegate-detail';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const HomeScreenHeaderLeft: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  return (
    <HeaderLeftButton
      onPress={() => {
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}
    >
      <View style={style.flatten(['flex-row', 'items-center'])}>
        <DotsIcon />
        <Text
          style={style.flatten(['h5', 'color-text-black-low', 'margin-left-4'])}
        >
          {chainStore.current.chainName + ' '}
        </Text>
        {/* <DownArrowIcon
          height={12}
          color={style.get('color-text-black-low').color}
        /> */}
      </View>
    </HeaderLeftButton>
  );
});

const ScreenHeaderLeft: FunctionComponent<{ uri?: string }> = observer(({}) => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  return (
    <HeaderLeftButton
      onPress={() => {
        // navigate(uri);
        smartNavigation.goBack();
      }}
    >
      <View style={style.flatten(['flex-row', 'items-center'])}>
        <Text style={style.flatten(['h4', 'color-text-black-low'])}>
          <HeaderBackButtonIcon />
        </Text>
      </View>
    </HeaderLeftButton>
  );
});

const HomeScreenHeaderRight: FunctionComponent = observer(() => {
  const navigation = useNavigation();

  return (
    <React.Fragment>
      <HeaderRightButton
        onPress={() => {
          navigation.navigate('Others', {
            screen: 'Camera'
          });
        }}
      ></HeaderRightButton>
    </React.Fragment>
  );
});

export const MainNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitle: ''
      }}
      initialRouteName="Home"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerShown: false
          // headerLeft: () => <HomeScreenHeaderLeft />,
          // headerRight: () => <HomeScreenHeaderRight />,
        }}
        name="Home"
        initialParams={useSmartNavigation}
        component={HomeScreen}
      />
      {/* <Stack.Screen
        options={{
          title: 'Browser'
        }}
        name="BrowserMain"
        component={Browser}
      /> */}
      <Stack.Screen
        name="Transactions"
        component={Transactions}
        options={{
          title: 'Transactions',
          headerLeft: () => <ScreenHeaderLeft />
        }}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => <ScreenHeaderLeft uri="Transactions" />
        }}
        name="Transactions.Detail"
        component={TransactionDetail}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name="RegisterMain"
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name="RegisterVerifyMnemonicMain"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name="RegisterEnd"
        component={RegisterEndScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name="Ntfs"
        component={NtfsScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name="RegisterNewLedgerMain"
        component={NewLedgerScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name="Tokens"
        component={TokensScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name="Nfts"
        component={NftsScreen}
      />
      <Stack.Screen
        options={{
          title: 'Token detail'
        }}
        name="Tokens.Detail"
        component={TokenDetailScreen}
      />
      <Stack.Screen
        options={{
          title: 'Ntf detail'
        }}
        name="Nfts.Detail"
        component={NftDetailScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitle: '',
        headerTitleStyle: style.flatten(['h5', 'color-text-black-high'])
      }}
      initialRouteName="Register.Intro"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: ''
        }}
        name="Register.Intro"
        component={RegisterIntroScreen}
      />
      <Stack.Screen
        options={{
          title: 'Create a New Wallet'
        }}
        name="Register.NewUser"
        component={RegisterNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Existing Wallet'
        }}
        name="Register.NotNewUser"
        component={RegisterNotNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: '',
          headerLeft: null
        }}
        name="Register.NewMnemonic"
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Verify Mnemonic'
        }}
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Existing Wallet'
        }}
        name="Register.RecoverMnemonic"
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Hardware Wallet'
        }}
        name="Register.NewLedger"
        component={NewLedgerScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false
        }}
        name="Register.End"
        component={RegisterEndScreen}
      />
    </Stack.Navigator>
  );
};

export const OtherNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(['h5', 'color-text-black-high'])
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: 'Send'
        }}
        name="Send"
        component={sendScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false
        }}
        name="Camera"
        component={CameraScreen}
      />
      <Stack.Screen
        options={{
          title: 'Governance'
        }}
        name="Governance"
        component={GovernanceScreen}
      />
      <Stack.Screen
        options={{
          title: 'Proposal'
        }}
        name="Governance Details"
        component={GovernanceDetailsScreen}
      />
      {/* <Stack.Screen
        options={{
          title: 'Staking Dashboard'
        }}
        name="Staking.Dashboard"
        component={StakingDashboardScreen}
      /> */}
      <Stack.Screen
        options={{
          title: 'Validator Details'
        }}
        name="Validator.Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: 'All Active Validators'
        }}
        name="Validator.List"
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: 'Unstake'
        }}
        name="Undelegate"
        component={UndelegateScreen}
      />
      <Stack.Screen
        options={{
          title: 'Switch Validator'
        }}
        name="Redelegate"
        component={RedelegateScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false
        }}
        name="TxPendingResult"
        component={TxPendingResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false
        }}
        name="TxSuccessResult"
        component={TxSuccessResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false
        }}
        name="TxFailedResult"
        component={TxFailedResultScreen}
      />
    </Stack.Navigator>
  );
};

export const SettingStackScreen: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  const { analyticsStore } = useStore();

  return (
    <Stack.Navigator
      screenOptions={{
        ...PlainHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(['h5', 'color-text-black-high'])
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
        name="Setting"
        component={SettingScreen}
      />
      <Stack.Screen
        name="SettingSelectAccount"
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
          ...BlurredHeaderScreenOptionsPreset
        }}
        component={SettingSelectAccountScreen}
      />
      <Stack.Screen
        name="SettingSelectLang"
        options={{
          title: 'Select Currency',
          ...BlurredHeaderScreenOptionsPreset
        }}
        component={SettingSelectLangScreen}
      />
      <Stack.Screen
        name="Setting.ViewPrivateData"
        component={ViewPrivateDataScreen}
      />
      <Stack.Screen
        options={{
          title: 'Version'
        }}
        name="Setting.Version"
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
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(['h5', 'color-text-black-high'])
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: 'Address Book'
        }}
        name="AddressBook"
        component={AddressBookScreen}
      />
      <Stack.Screen
        options={{
          title: 'New Address Book'
        }}
        name="AddAddressBook"
        component={AddAddressBookScreen}
      />
    </Stack.Navigator>
  );
};

export const WebNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      initialRouteName="Browser"
      screenOptions={{
        ...WebpageScreenScreenOptionsPreset
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: 'Browser'
        }}
        name="Browser"
        component={OnboardingIntroScreen}
        // component={Browser}
      />
      <Stack.Screen
        options={{
          title: 'BookMarks',
          headerLeft: () => <ScreenHeaderLeft />
        }}
        name="BookMarks"
        component={BookMarks}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Web.Intro"
        component={WebScreen}
      />
      <Stack.Screen name="Web.dApp" component={DAppWebpageScreen} />
    </Stack.Navigator>
  );
};

export const InvestNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitle: ''
      }}
      initialRouteName="Invest"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: ''
        }}
        name="Invest"
        component={StakingDashboardScreen}
      />
      <Stack.Screen
        options={{
          title: 'Validator List'
        }}
        name="Validator.List"
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: 'Validator Details'
        }}
        name="Validator.Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: 'Stake'
        }}
        name="Delegate"
        component={DelegateScreen}
      />
      <Stack.Screen
        options={{
          title: 'Delegate Detail'
        }}
        name="Delegate.Detail"
        component={DelegateDetailScreen}
      />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();
  const { chainStore } = useStore();

  const focusedScreen = useFocusedScreen();

  // useEffect(() => {
  //   Linking.addEventListener('url', handleDeepLink);
  //   // NotificationUtils.getInstance().initListener();
  //   return () => {
  //     Linking.removeEventListener('url', handleDeepLink);
  //   };
  // }, []);

  useEffect(() => {
    // When the focused screen is not "Home" screen and the drawer is open,
    // try to close the drawer forcely.
    // navigate("Browser")
    // if (focusedScreen.name !== 'Home' && isDrawerOpen) {
    //   navigation.dispatch(DrawerActions.toggleDrawer());
    // }
  }, [focusedScreen.name, navigation]);

  const checkActiveTabBottom = (color: string) => {
    return color == '#C6C6CD';
  };

  const RenderTabsBarIcon = ({ color, name }) => {
    let checkColor = checkActiveTabBottom(color);
    let icon;
    let nameRoute = name;
    switch (name) {
      case 'Main':
        icon = checkColor ? <HomeOutlineIcon /> : <HomeFillIcon />;
        break;
      case 'Browser':
        icon = checkColor ? <BrowserOutLineIcon /> : <BrowserFillIcon />;
        break;
      case 'Invest':
        icon = checkColor ? <InvestOutlineIcon /> : <InvestFillIcon />;
        break;
      case 'Settings':
        icon = checkColor ? <SettingOutLineIcon /> : <SettingFillIcon />;
        break;
      default:
        icon = checkColor ? <SettingOutLineIcon /> : <SettingFillIcon />;
        break;
    }
    return (
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: !checkColor ? 30 : 12
        }}
      >
        {icon}
        {!!nameRoute && (
          <Text
            style={{
              fontSize: 12,
              lineHeight: 16,
              color: '#5F5E77'
            }}
          >
            {nameRoute}
          </Text>
        )}

        {!checkColor && (
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
            case 'Main':
              return <RenderTabsBarIcon color={color} name={'Main'} />;
            case 'Browser':
              return <RenderTabsBarIcon color={color} name={'Browser'} />;
            case 'Send':
              return (
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: !checkActiveTabBottom(color) ? 30 : 8
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
                  {!checkActiveTabBottom(color) && (
                    <View style={{ paddingTop: 14 }}>
                      <DotsIcon />
                    </View>
                  )}
                </View>
              );
            case 'Invest':
              return <RenderTabsBarIcon color={color} name={'Invest'} />;
            case 'Settings':
              return <RenderTabsBarIcon color={color} name={'Settings'} />;
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
        ),
      })}
      tabBarOptions={{
        activeTintColor: style.get('color-primary').color,
        inactiveTintColor: style.get('color-text-black-very-very-low').color,
        style: {
          borderTopWidth: 0.5,
          borderTopColor: style.get('border-color-border-white').borderColor,
          shadowColor: style.get('color-transparent').color,
          elevation: 0,
          paddingLeft: 10,
          paddingRight: 10,
          height: 110
        },
        showLabel: false
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={['Home']} />
      )}
    >
      <Tab.Screen name="Main" component={MainNavigation} />
      <Tab.Screen name="Browser" component={WebNavigation} />
      <Tab.Screen
        options={{
          title: 'Send'
        }}
        name="Send"
        component={TransferTokensScreen}
        initialParams={{
          currency: chainStore.current.stakeCurrency.coinMinimalDenom,
          chainId: chainStore.current.chainId
        }}
      />
      <Tab.Screen name="Invest" component={InvestNavigation} />
      <Tab.Screen
        name="Settings"
        component={SettingStackScreen}
        options={{
          unmountOnBlur: true
        }}
      />
    </Tab.Navigator>
  );
};

export const MainTabNavigationWithDrawer: FunctionComponent = () => {
  const focused = useFocusedScreen();

  return (
    <Drawer.Navigator
      drawerType="slide"
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        // If the focused screen is not "Home" screen,
        // disable the gesture to open drawer.
        swipeEnabled: focused.name === 'Home',
        gestureEnabled: focused.name === 'Home'
      }}
      gestureHandlerProps={{
        hitSlop: {}
      }}
    >
      <Drawer.Screen name="MainTab" component={MainTabNavigation} />
    </Drawer.Navigator>
  );
};

export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore, deepLinkUriStore } = useStore();
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

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
              initialRouteName={
                keyRingStore.status !== KeyRingStatus.UNLOCKED
                  ? 'Unlock'
                  : 'MainTab'
              }
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS
              }}
              headerMode="screen"
            >
              <Stack.Screen name="Unlock" component={UnlockScreen} />
              <Stack.Screen name="MainTab" component={MainTabNavigation} />
              <Stack.Screen name="Register" component={RegisterNavigation} />
              <Stack.Screen name="Others" component={OtherNavigation} />
              <Stack.Screen
                name="AddressBooks"
                component={AddressBookStackScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
          {/* <ModalsRenderer /> */}
        </SmartNavigatorProvider>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
