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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { CText as Text } from './components/text';
import { KeyRingStatus } from '@owallet/background';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
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
import { createDrawerNavigator } from '@react-navigation/drawer';
// import { DrawerContent } from './components/drawer';
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
  InvestFillIcon,
  Notification,
  Scanner,
  GoBack,
  CarbonNotification
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
import { NetworkModal } from './screens/home/components';
import { SelectNetworkScreen } from './screens/network';
import { colors, spacing, typography } from './themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Hash } from '@owallet/crypto';
import { useRoute } from '@react-navigation/core';
import { TransferNFTScreen } from './screens/transfer-nft';
import { DashBoardScreen } from './screens/dashboard';
import { lightColors } from './themes/colors';
import { NotificationScreen } from './screens/notifications';

const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const HomeScreenHeaderLeft: FunctionComponent = observer(() => {
  const style = useStyle();

  const navigation = useNavigation();

  return (
    <HeaderLeftButton
      onPress={() => {
        if (navigation.canGoBack) navigation.goBack();
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
  const smartNavigation = useSmartNavigation();
  const { notificationStore } = useStore();

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <View
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      >
        <TouchableOpacity
          onPress={() => {
            // smartNavigation.navigateSmart('Transactions', {});
            navigation.navigate('Others', {
              screen: 'Notifications'
            });
          }}
          style={{ paddingRight: 8 }}
        >
          {notificationStore?.getReadNotifications?.length >=
          notificationStore?.getTotal ? (
            <CarbonNotification size={24} color={colors['purple-700']} />
          ) : (
            <Notification size={24} color={colors['purple-700']} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Others', {
              screen: 'Camera'
              // screen: 'Notifications'
            });
          }}
        >
          <Scanner size={24} color={colors['purple-700']} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const HomeScreenHeaderTitle: FunctionComponent = observer(() => {
  const { chainStore, modalStore } = useStore();

  const smartNavigation = useSmartNavigation();
  const deterministicNumber = useCallback(chainInfo => {
    const bytes = Hash.sha256(
      Buffer.from(chainInfo.stakeCurrency.coinMinimalDenom)
    );
    return (
      (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
    );
  }, []);

  const profileColor = useCallback(
    chainInfo => {
      const random = [colors['purple-400']];

      return random[deterministicNumber(chainInfo) % random.length];
    },
    [deterministicNumber]
  );
  // const navigation = useNavigation();
  const _onPressNetworkModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      NetworkModal({
        profileColor,
        chainStore,
        modalStore,
        smartNavigation
      })
    );
  };
  return (
    <React.Fragment>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <TouchableWithoutFeedback onPress={_onPressNetworkModal}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 50
            }}
          >
            <DotsIcon />
            <Text
              style={{
                ...typography['h5'],
                ...colors['color-text-black-low'],
                marginLeft: spacing['8']
              }}
            >
              {chainStore.current.chainName + ' Network'}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </React.Fragment>
  );
});

export const CustomHeader: FunctionComponent = observer(() => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const smartNavigation = useSmartNavigation();
  const route = useRoute();

  const onPressBack = () => {
    if (navigation.canGoBack) {
      navigation.goBack();
      return;
    }
    if (smartNavigation.canGoBack) {
      smartNavigation.goBack();
      return;
    }
    navigate('MainTab');
  };

  return (
    <React.Fragment>
      <View
        style={{
          backgroundColor: colors['white'],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingTop: top,
          paddingBottom: spacing['20'],
          paddingHorizontal: spacing['12']
        }}
      >
        {route.name === 'Home' || route.name === 'Network.select' ? (
          <View />
        ) : (
          <TouchableWithoutFeedback onPress={onPressBack}>
            <View>
              <HeaderBackButtonIcon />
            </View>
          </TouchableWithoutFeedback>
        )}

        <View>
          <HomeScreenHeaderTitle />
        </View>
        <View>
          <HomeScreenHeaderRight />
        </View>
      </View>
    </React.Fragment>
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
          header: () => <CustomHeader />
        }}
        name="Home"
        component={HomeScreen}
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
        name="RegisterRecoverMnemonicMain"
        component={RecoverMnemonicScreen}
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
          header: () => <CustomHeader />
          // headerLeft: null
        }}
        name="Tokens"
        component={TokensScreen}
      />
      <Stack.Screen
        options={{
          header: () => <CustomHeader />
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

export const SendNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitle: ''
      }}
      initialRouteName="TransferTokensScreen"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          header: () => <CustomHeader />
        }}
        name="TransferTokensScreen"
        component={TransferTokensScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const style = useStyle();
  const { appInitStore } = useStore();

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
          title: 'Send',
          header: () => <CustomHeader />
        }}
        name="Send"
        component={SendScreen}
      />
      <Stack.Screen
        options={{
          title: 'Transfer',
          header: () => <CustomHeader />
        }}
        name="TransferNFT"
        component={TransferNFTScreen}
      />
      <Stack.Screen
        options={{
          header: () => <CustomHeader />
        }}
        name="Transactions"
        component={Transactions}
      />
      <Stack.Screen
        options={{
          header: () => <CustomHeader />
        }}
        name="Notifications"
        component={NotificationScreen}
      />
      <Stack.Screen
        options={{
          header: () => <CustomHeader />
        }}
        name="Dashboard"
        component={DashBoardScreen}
      />
      <Stack.Screen
        options={{
          header: () => <CustomHeader />
        }}
        name="Transactions.Detail"
        component={TransactionDetail}
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
      <Stack.Screen
        options={{
          header: () => <CustomHeader />
        }}
        name="Network.select"
        component={SelectNetworkScreen}
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
          title: 'Add new contact',
          ...getPlainHeaderScreenOptionsPresetWithBackgroundColor(
            style.get('color-setting-screen-background-transparent').color
          ),
          headerTitleStyle: style.flatten(['h3', 'color-text-black-high'])
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
        component={Browser}
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
        headerTitle: '',
        header: () => <CustomHeader />
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
      <Stack.Screen
        options={{
          title: 'Switch Validator'
        }}
        name="Redelegate"
        component={RedelegateScreen}
      />
      <Stack.Screen
        options={{
          title: 'Unstake'
        }}
        name="Undelegate"
        component={UndelegateScreen}
      />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();
  const { chainStore } = useStore();

  const focusedScreen = useFocusedScreen();

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
      case 'Home':
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
              return <RenderTabsBarIcon color={color} name={'Home'} />;
            case 'Browser':
              return <RenderTabsBarIcon color={color} name={'Browser'} />;
            case 'SendNavigation':
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
        tabBarButton: props => (
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
          borderTopColor: style.get('border-color-border-white').borderColor,
          shadowColor: style.get('color-transparent').color,
          elevation: 0,
          paddingLeft: 10,
          paddingRight: 10,
          height: Platform.OS === 'android' ? 80 : 110
        },
        showLabel: false
      }}
      tabBar={props => (
        <BlurredBottomTabBar {...props} enabledScreens={['Home']} />
      )}
    >
      <Tab.Screen name="Main" component={MainNavigation} />
      <Tab.Screen name="Browser" component={WebNavigation} />
      <Tab.Screen
        options={{
          title: 'SendNavigation'
        }}
        name="SendNavigation"
        component={SendNavigation}
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

// export const MainTabNavigationWithDrawer: FunctionComponent = () => {
//   const focused = useFocusedScreen();

//   return (
//     <Drawer.Navigator
//       drawerType="slide"
//       drawerContent={(props) => <DrawerContent {...props} />}
//       screenOptions={{
//         // If the focused screen is not "Home" screen,
//         // disable the gesture to open drawer.
//         swipeEnabled: focused.name === 'Home',
//         gestureEnabled: focused.name === 'Home'
//       }}
//       gestureHandlerProps={{
//         hitSlop: {}
//       }}
//     >
//       <Drawer.Screen name="MainTab" component={MainTabNavigation} />
//     </Drawer.Navigator>
//   );
// };

export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore, deepLinkUriStore, appInitStore } = useStore();
  useEffect(() => {
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          const SCHEME_IOS = 'owallet://open_url?url=';
          const SCHEME_ANDROID = 'app.owallet.oauth://google/open_url?url=';
          deepLinkUriStore.updateDeepLink(
            url.replace(SCHEME_ANDROID, '').replace(SCHEME_IOS, '')
          );
        }
      })
      .catch(err => {
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
          <NavigationContainer
            ref={navigationRef}
            theme={scheme === 'dark' ? DarkTheme : DefaultTheme}
          >
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

const DarkTheme = {
  dark: true,
  colors: {
    ...colors
  }
};

const DefaultTheme = {
  dark: false,
  colors: {
    ...lightColors
  }
};
