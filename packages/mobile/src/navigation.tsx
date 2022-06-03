/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import {
  BIP44HDPath,
  ExportKeyRingData,
  KeyRingStatus,
} from '@owallet/background';
import {
  DrawerActions,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import { useStore } from './stores';
import { observer } from 'mobx-react-lite';
import { HomeScreen } from './screens/home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import { SendScreen } from './screens/send';
import {
  GovernanceDetailsScreen,
  GovernanceScreen,
} from './screens/governance';
import {
  createDrawerNavigator,
  useIsDrawerOpen,
} from '@react-navigation/drawer';
import { DrawerContent } from './components/drawer';
import { useStyle } from './styles';
import { BorderlessButton } from 'react-native-gesture-handler';
import { createSmartNavigatorProvider, SmartNavigator } from './hooks';
import { SettingScreen } from './screens/setting';
import { SettingSelectAccountScreen } from './screens/setting/screens/select-account';
import { SettingSelectLangScreen } from './screens/setting/screens/select-lang';
import { ViewPrivateDataScreen } from './screens/setting/screens/view-private-data';
import { WebScreen } from './screens/web';
import { RegisterIntroScreen } from './screens/register';
import {
  NewMnemonicConfig,
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from './screens/register/mnemonic';
import { RegisterEndScreen } from './screens/register/end';
import { RegisterNewUserScreen } from './screens/register/new-user';
import { RegisterNotNewUserScreen } from './screens/register/not-new-user';
import {
  AddressBookConfig,
  AddressBookData,
  IMemoConfig,
  IRecipientConfig,
  RegisterConfig,
} from '@owallet/hooks';
import {
  DelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from './screens/stake';
import {
  DownArrowIcon,
  OpenDrawerIcon,
  ScanIcon,
  SendIcon,
  SettingIcon,
  WalletIcon,
} from './components/icon';
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from './screens/setting/screens/address-book';
import { NewLedgerScreen } from './screens/register/ledger';
import { PageScrollPositionProvider } from './providers/page-scroll-position';
import {
  BlurredHeaderScreenOptionsPreset,
  getPlainHeaderScreenOptionsPresetWithBackgroundColor,
  HeaderLeftButton,
  HeaderRightButton,
  PlainHeaderScreenOptionsPreset,
} from './components/header';
import { TokensScreen } from './screens/tokens';
import { UndelegateScreen } from './screens/stake/undelegate';
import { RedelegateScreen } from './screens/stake/redelegate';
import { CameraScreen } from './screens/camera';
import {
  FocusedScreenProvider,
  useFocusedScreen,
} from './providers/focused-screen';
// import Svg, { Path, Rect } from "react-native-svg";
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen,
} from './screens/tx-result';
import { TorusSignInScreen } from './screens/register/torus';
import {
  HeaderAddIcon,
  HeaderWalletConnectIcon,
} from './components/header/icon';
import { BlurredBottomTabBar } from './components/bottom-tabbar';
import { UnlockScreen } from './screens/unlock';
import { OWalletVersionScreen } from './screens/setting/screens/version';
import { ManageWalletConnectScreen } from './screens/manage-wallet-connect';
import {
  ImportFromExtensionIntroScreen,
  ImportFromExtensionScreen,
  ImportFromExtensionSetPasswordScreen,
} from './screens/register/import-from-extension';
import { DAppWebpageScreen } from './screens/web/webpages';
import { WebpageScreenScreenOptionsPreset } from './screens/web/components/webpage-screen';

const { SmartNavigatorProvider, useSmartNavigation } =
  createSmartNavigatorProvider(
    new SmartNavigator({
      'Register.Intro': {
        upperScreenName: 'Register',
      },
      'Register.NewUser': {
        upperScreenName: 'Register',
      },
      'Register.NotNewUser': {
        upperScreenName: 'Register',
      },
      'Register.NewMnemonic': {
        upperScreenName: 'Register',
      },
      'Register.VerifyMnemonic': {
        upperScreenName: 'Register',
      },
      'Register.RecoverMnemonic': {
        upperScreenName: 'Register',
      },
      'Register.NewLedger': {
        upperScreenName: 'Register',
      },
      'Register.TorusSignIn': {
        upperScreenName: 'Register',
      },
      'Register.ImportFromExtension.Intro': {
        upperScreenName: 'Register',
      },
      'Register.ImportFromExtension': {
        upperScreenName: 'Register',
      },
      'Register.ImportFromExtension.SetPassword': {
        upperScreenName: 'Register',
      },
      'Register.End': {
        upperScreenName: 'Register',
      },
      Home: {
        upperScreenName: 'Main',
      },
      Send: {
        upperScreenName: 'Others',
      },
      Tokens: {
        upperScreenName: 'Others',
      },
      Camera: {
        upperScreenName: 'Others',
      },
      ManageWalletConnect: {
        upperScreenName: 'Others',
      },
      'Staking.Dashboard': {
        upperScreenName: 'Others',
      },
      'Validator.Details': {
        upperScreenName: 'Others',
      },
      'Validator.List': {
        upperScreenName: 'Others',
      },
      Delegate: {
        upperScreenName: 'Others',
      },
      Undelegate: {
        upperScreenName: 'Others',
      },
      Redelegate: {
        upperScreenName: 'Others',
      },
      Governance: {
        upperScreenName: 'Others',
      },
      'Governance Details': {
        upperScreenName: 'Others',
      },
      Setting: {
        upperScreenName: 'Settings',
      },
      SettingSelectAccount: {
        upperScreenName: 'Settings',
      },
      SettingSelectLang: {
        upperScreenName: 'Settings',
      },
      'Setting.ViewPrivateData': {
        upperScreenName: 'Settings',
      },
      'Setting.Version': {
        upperScreenName: 'Settings',
      },
      AddressBook: {
        upperScreenName: 'AddressBooks',
      },
      AddAddressBook: {
        upperScreenName: 'AddressBooks',
      },
      Result: {
        upperScreenName: 'Others',
      },
      TxPendingResult: {
        upperScreenName: 'Others',
      },
      TxSuccessResult: {
        upperScreenName: 'Others',
      },
      TxFailedResult: {
        upperScreenName: 'Others',
      },
      'Web.Intro': {
        upperScreenName: 'Web',
      },
      'Web.dApp': {
        upperScreenName: 'Web',
      },
      'Web.dApp': {
        upperScreenName: 'Web'
      }
    }).withParams<{
      'Register.NewMnemonic': {
        registerConfig: RegisterConfig;
      };
      'Register.VerifyMnemonic': {
        registerConfig: RegisterConfig;
        newMnemonicConfig: NewMnemonicConfig;
        bip44HDPath: BIP44HDPath;
      };
      'Register.RecoverMnemonic': {
        registerConfig: RegisterConfig;
      };
      'Register.NewLedger': {
        registerConfig: RegisterConfig;
      };
      'Register.TorusSignIn': {
        registerConfig: RegisterConfig;
        type: 'google' | 'apple';
      };
      'Register.ImportFromExtension.Intro': {
        registerConfig: RegisterConfig;
      };
      'Register.ImportFromExtension': {
        registerConfig: RegisterConfig;
      };
      'Register.ImportFromExtension.SetPassword': {
        registerConfig: RegisterConfig;
        exportKeyRingDatas: ExportKeyRingData[];
        addressBooks: { [chainId: string]: AddressBookData[] | undefined };
      };
      'Register.End': {
        password?: string;
      };
      Send: {
        chainId?: string;
        currency?: string;
        recipient?: string;
      };
      'Validator.Details': {
        validatorAddress: string;
      };
      'Validator.List': {
        validatorSelector?: (validatorAddress: string) => void;
      };
      Delegate: {
        validatorAddress: string;
      };
      Undelegate: {
        validatorAddress: string;
      };
      Redelegate: {
        validatorAddress: string;
      };
      'Governance Details': {
        proposalId: string;
      };
      'Setting.ViewPrivateData': {
        privateData: string;
        privateDataType: string;
      };
      AddressBook: {
        recipientConfig?: IRecipientConfig;
        memoConfig?: IMemoConfig;
      };
      AddAddressBook: {
        chainId: string;
        addressBookConfig: AddressBookConfig;
      };
      TxPendingResult: {
        chainId?: string;
        txHash: string;
      };
      TxSuccessResult: {
        chainId?: string;
        txHash: string;
      };
      TxFailedResult: {
        chainId?: string;
        txHash: string;
      };
    }>()
  );

export { useSmartNavigation };

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
        <Text
          style={style.flatten(['h4', 'color-text-black-low', 'margin-left-4'])}
        >
          {chainStore.current.chainName + ' '}
        </Text>
        <DownArrowIcon
          height={12}
          color={style.get('color-text-black-low').color}
        />
      </View>
    </HeaderLeftButton>
  );
});

const HomeScreenHeaderRight: FunctionComponent = observer(() => {
  const { walletConnectStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  return (
    <React.Fragment>
      <HeaderRightButton
        onPress={() => {
          navigation.navigate('Others', {
            screen: 'Camera',
          });
        }}
      >
        {/* <ScanIcon size={28} color={style.get("color-primary").color} /> */}
      </HeaderRightButton>
      {walletConnectStore.sessions.length > 0 ? (
        <HeaderRightButton
          style={{
            right: 42
          }}
          onPress={() => {
            navigation.navigate('Others', {
              screen: 'ManageWalletConnect',
            });
          }}
        >
          <HeaderWalletConnectIcon />
        </HeaderRightButton>
      ) : null}
    </React.Fragment>
  );
});

export const MainNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitle: '',
      }}
      initialRouteName="Home"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerLeft: () => <HomeScreenHeaderLeft />,
          headerRight: () => <HomeScreenHeaderRight />
        }}
        name="Home"
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...PlainHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(['h5', 'color-text-black-high']),
      }}
      initialRouteName="Register.Intro"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: '',
        }}
        name="Register.Intro"
        component={RegisterIntroScreen}
      />
      <Stack.Screen
        options={{
          title: 'Create a New Wallet',
        }}
        name="Register.NewUser"
        component={RegisterNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Existing Wallet',
        }}
        name="Register.NotNewUser"
        component={RegisterNotNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: 'Create New Mnemonic',
        }}
        name="Register.NewMnemonic"
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Verify Mnemonic',
        }}
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Existing Wallet',
        }}
        name="Register.RecoverMnemonic"
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Hardware Wallet',
        }}
        name="Register.NewLedger"
        component={NewLedgerScreen}
      />
      <Stack.Screen
        options={{
          title: "Sign in with Google",
        }}
        name="Register.TorusSignIn"
        component={TorusSignInScreen}
      />
      <Stack.Screen
        options={{
          // Only show the back button.
          title: '',
        }}
        name="Register.ImportFromExtension.Intro"
        component={ImportFromExtensionIntroScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false
        }}
        name="Register.ImportFromExtension"
        component={ImportFromExtensionScreen}
      />
      <Stack.Screen
        options={{
          title: 'Import Extension',
        }}
        name="Register.ImportFromExtension.SetPassword"
        component={ImportFromExtensionSetPasswordScreen}
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
        headerTitleStyle: style.flatten(['h5', 'color-text-black-high']),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: 'Send',
        }}
        name="Send"
        component={SendScreen}
      />
      <Stack.Screen
        options={{
          title: 'Tokens',
        }}
        name="Tokens"
        component={TokensScreen}
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
          title: 'WalletConnect',
        }}
        name="ManageWalletConnect"
        component={ManageWalletConnectScreen}
      />
      <Stack.Screen
        options={{
          title: 'Validator List',
        }}
        name="Validator List"
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: 'Validator Details',
        }}
        name="Validator Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: 'Governance',
        }}
        name="Governance"
        component={GovernanceScreen}
      />
      <Stack.Screen
        options={{
          title: 'Proposal',
        }}
        name="Governance Details"
        component={GovernanceDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: 'Staking Dashboard',
        }}
        name="Staking.Dashboard"
        component={StakingDashboardScreen}
      />
      <Stack.Screen
        options={{
          title: 'Validator Details',
        }}
        name="Validator.Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: 'All Active Validators',
        }}
        name="Validator.List"
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: 'Stake',
        }}
        name="Delegate"
        component={DelegateScreen}
      />
      <Stack.Screen
        options={{
          title: 'Unstake',
        }}
        name="Undelegate"
        component={UndelegateScreen}
      />
      <Stack.Screen
        options={{
          title: 'Switch Validator',
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
        headerTitleStyle: style.flatten(['h5', 'color-text-black-high']),
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
          headerTitleStyle: style.flatten(['h3', 'color-text-black-high']),
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
                  screen: 'Register.Intro',
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
          ...BlurredHeaderScreenOptionsPreset,
        }}
        component={SettingSelectLangScreen}
      />
      <Stack.Screen
        name="Setting.ViewPrivateData"
        component={ViewPrivateDataScreen}
      />
      <Stack.Screen
        options={{
          title: 'Version',
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
        headerTitleStyle: style.flatten(['h5', 'color-text-black-high']),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: 'Address Book',
        }}
        name="AddressBook"
        component={AddressBookScreen}
      />
      <Stack.Screen
        options={{
          title: 'New Address Book',
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
      initialRouteName="Web.Intro"
      screenOptions={{
        ...WebpageScreenScreenOptionsPreset
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="Web.Intro"
        component={WebScreen}
      />
      <Stack.Screen name="Web.dApp" component={DAppWebpageScreen} />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  const focusedScreen = useFocusedScreen();
  const isDrawerOpen = useIsDrawerOpen();

  useEffect(() => {
    // When the focused screen is not "Home" screen and the drawer is open,
    // try to close the drawer forcely.
    if (focusedScreen.name !== 'Home' && isDrawerOpen) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  }, [focusedScreen.name, isDrawerOpen, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          switch (route.name) {
            case 'Main':
              return <WalletIcon color={color} size={24} />;
            case 'Web':
              return <SendIcon />;
            case 'Settings':
              return <SettingIcon color={color} />;
          }
        },

        tabBarButton: (props) => (
          <View
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
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
                maxWidth: '100%',
              }}
            />
          </View>
        )
      })}
      tabBarOptions={{
        activeTintColor: style.get('color-primary').color,
        inactiveTintColor: style.get('color-text-black-very-very-low').color,
        style: {
          borderTopWidth: 0.5,
          borderTopColor: style.get('border-color-border-white').borderColor,
          shadowColor: style.get('color-transparent').color,
          elevation: 0,
          paddingLeft: 30,
          paddingRight: 30,
          height: 70,
        },
        showLabel: false
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={['Home']} />
      )}
    >
      <Tab.Screen name="Main" component={MainNavigation} />
      {__DEV__ ? <Tab.Screen name="Web" component={WebScreen} /> : null}
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
        gestureEnabled: focused.name === 'Home',
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
  const { keyRingStore } = useStore();

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={
                keyRingStore.status !== KeyRingStatus.UNLOCKED
                  ? 'Unlock'
                  : 'MainTabDrawer'
              }
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS
              }}
              headerMode="screen"
            >
              <Stack.Screen name="Unlock" component={UnlockScreen} />
              <Stack.Screen
                name="MainTabDrawer"
                component={MainTabNavigationWithDrawer}
              />
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
