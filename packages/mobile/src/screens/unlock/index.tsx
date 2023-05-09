import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { observer } from 'mobx-react-lite';
import * as SplashScreen from 'expo-splash-screen';
import { TextInput } from '../../components/input';
import delay from 'delay';
import { useStore } from '../../stores';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StackActions, useNavigation } from '@react-navigation/native';
import { KeyRingStatus } from '@owallet/background';
import { KeychainStore } from '../../stores/keychain';
import { AccountStore } from '@owallet/stores';
import { autorun } from 'mobx';
import { spacing } from '../../themes';
import { LoadingSpinner } from '../../components/spinner';
import { ProgressBar } from '../../components/progress-bar';
import CodePush from 'react-native-code-push';
import messaging from '@react-native-firebase/messaging';
import { MaintainScreen } from '../../components/maintain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@src/themes/theme-provider';
import OWButton from '@src/components/button/OWButton';
import { showToast } from '@src/utils/helper';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
let splashScreenHided = false;
async function hideSplashScreen() {
  if (!splashScreenHided) {
    if (await SplashScreen.hideAsync()) {
      splashScreenHided = true;
    }
  }
}

async function waitAccountLoad(
  accountStore: AccountStore<any, any, any, any>,
  chainId: string
): Promise<void> {
  if (accountStore.getAccount(chainId).bech32Address) {
    return;
  }

  return new Promise((resolve) => {
    const disposer = autorun(() => {
      if (accountStore.getAccount(chainId).bech32Address) {
        resolve();
        if (disposer) {
          disposer();
        }
      }
    });
  });
}

enum AutoBiomtricStatus {
  NO_NEED,
  NEED,
  FAILED,
  SUCCESS
}

const useAutoBiomtric = (keychainStore: KeychainStore, tryEnabled: boolean) => {
  const [status, setStatus] = useState(AutoBiomtricStatus.NO_NEED);
  const tryBiometricAutoOnce = useRef(false);

  useEffect(() => {
    if (keychainStore.isBiometryOn && status === AutoBiomtricStatus.NO_NEED) {
      setStatus(AutoBiomtricStatus.NEED);
    }
  }, [keychainStore.isBiometryOn, status]);

  useEffect(() => {
    if (
      !tryBiometricAutoOnce.current &&
      status === AutoBiomtricStatus.NEED &&
      tryEnabled
    ) {
      tryBiometricAutoOnce.current = true;
      (async () => {
        try {
          await delay(2000);
          await keychainStore.tryUnlockWithBiometry();
          setStatus(AutoBiomtricStatus.SUCCESS);
        } catch (e) {
          console.log(e);
          setStatus(AutoBiomtricStatus.FAILED);
        }
      })();
    }
  }, [keychainStore, status, tryEnabled]);

  return status;
};

export const UnlockScreen: FunctionComponent = observer(() => {
  const {
    keyRingStore,
    keychainStore,
    accountStore,
    chainStore,
    appInitStore,
    notificationStore
  } = useStore();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const navigateToHomeOnce = useRef(false);
  const navigateToHome = useCallback(async () => {
    if (!navigateToHomeOnce.current) {
      await waitAccountLoad(accountStore, chainStore.current.chainId);
      navigation.dispatch(StackActions.replace('MainTab'));
    }
    navigateToHomeOnce.current = true;
  }, [accountStore, chainStore, navigation]);

  const autoBiometryStatus = useAutoBiomtric(
    keychainStore,
    keyRingStore.status === KeyRingStatus.LOCKED && loaded
  );

  useEffect(() => {
    (async () => {
      await hideSplashScreen();
    })();
  }, [autoBiometryStatus, navigation]);

  useEffect(() => {
    if (__DEV__) {
      return;
    }
    CodePush.sync(
      {
        // updateDialog: {
        //   appendReleaseDescription: true,
        //   title: 'Update available'
        // },
        installMode: CodePush.InstallMode.IMMEDIATE
      },
      (status) => {
        switch (status) {
          case CodePush.SyncStatus.UP_TO_DATE:
            console.log('UP_TO_DATE');
            // Show "downloading" modal
            // modal.open();
            setLoaded(true);
            break;
          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            console.log('DOWNLOADING_PACKAGE');
            // Show "downloading" modal
            // modal.open();
            appInitStore?.updateDate(Date.now());
            setDownloading(true);
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            console.log('INSTALLING_UPDATE');
            // show installing
            setInstalling(true);
            break;
          case CodePush.SyncStatus.UPDATE_INSTALLED:
            console.log('UPDATE_INSTALLED');
            setDownloading(false);
            setInstalling(false);
            setLoaded(true);
            appInitStore?.updateDate(Date.now());
            // Hide loading modal
            break;
        }
      },
      ({ receivedBytes, totalBytes }) => {
        /* Update download modal progress */
        setProgress(Math.ceil((receivedBytes / totalBytes) * 100));
      }
    );
  }, []);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const tryBiometric = useCallback(async () => {
    try {
      setIsBiometricLoading(true);
      setIsLoading(true);
      await delay(10);
      await keychainStore.tryUnlockWithBiometry();
      setIsLoading(false);
      await hideSplashScreen();
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      setIsBiometricLoading(false);
    }
  }, [keychainStore]);

  const tryUnlock = async () => {
    try {
      setIsLoading(true);
      await delay(10);
      await keyRingStore.unlock(password);

      await hideSplashScreen();
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      setIsFailed(true);
    }
  };

  const routeToRegisterOnce = useRef(false);
  useEffect(() => {
    if (
      !routeToRegisterOnce.current &&
      keyRingStore.status === KeyRingStatus.EMPTY
    ) {
      (async () => {
        await hideSplashScreen();
        routeToRegisterOnce.current = true;
        navigation.dispatch(
          StackActions.replace('Register', {
            screen: 'Register.Intro'
          })
        );
      })();
    }
  }, [keyRingStore.status, navigation]);

  useEffect(() => {
    const appStateHandler = (state: AppStateStatus) => {
      if (state !== 'active') {
        setDownloading(false);
        setInstalling(false);
      }
    };
    AppState.addEventListener('change', appStateHandler);

    return () => {
      AppState.removeEventListener('change', appStateHandler);
    };
  }, []);

  useEffect(() => {
    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      (async () => {
        await hideSplashScreen();
        if (!downloading) {
          navigateToHome();
        }
      })();
    }
  }, [keyRingStore.status, navigateToHome, downloading]);

  useEffect(() => {
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage
      );
      // const data = JSON.parse(remoteMessage?.data?.data);
      const data = { data: JSON.stringify(remoteMessage) };

      notificationStore?.updateNotidata(data);

      console.log(
        'Notification caused app to open from background state with data:',
        data
      );
    });
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        // const data = JSON.parse(remoteMessage?.data?.data);
        // console.log('message', data.message);
      });
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      showToast({
        text1: remoteMessage?.notification?.title,
        text2: remoteMessage?.notification?.body,
        onPress: () => Toast.hide()
      });
      // const formatData = JSON.parse(remoteMessage?.data?.data);
      // console.log('raw', remoteMessage?.data);
      // console.log('formattedData', formatData);
    });

    return unsubscribe;
  }, []);

  // Notification setup section
  const regisFcmToken = useCallback(async (FCMToken) => {
    await AsyncStorage.setItem('FCM_TOKEN', FCMToken);
  }, []);

  const getToken = useCallback(async () => {
    const fcmToken = await AsyncStorage.getItem('FCM_TOKEN');

    if (!fcmToken) {
      messaging()
        .getToken()
        .then(async (FCMToken) => {
          console.log('FCMToken ===', FCMToken);
          if (FCMToken) {
            regisFcmToken(FCMToken);
          } else {
            Alert.alert('[FCMService] User does not have a device token');
          }
        })
        .catch((error) => {
          let err = `FCM token get error: ${error}`;
          Alert.alert(err);
          console.log('[FCMService] getToken rejected ', error);
        });
    } else {
      // regisFcmToken(fcmToken);
    }
  }, [regisFcmToken]);

  const registerAppWithFCM = useCallback(() => {
    if (Platform.OS === 'ios') {
      messaging()
        .registerDeviceForRemoteMessages()
        .then((register) => {
          getToken();
        });
      //await messaging().setAutoInitEnabled(true);
    } else {
      getToken();
    }
  }, [getToken]);

  const requestPermission = useCallback(() => {
    messaging()
      .requestPermission()
      .then(() => {
        registerAppWithFCM();
      })
      .catch((error) => {
        console.log('[FCMService] Requested persmission rejected ', error);
      });
  }, [registerAppWithFCM]);

  const checkPermission = useCallback(() => {
    messaging()
      .hasPermission()
      .then((enabled) => {
        if (enabled) {
          //user has permission
          registerAppWithFCM();
        } else {
          //user don't have permission
          requestPermission();
        }
      })
      .catch((error) => {
        requestPermission();
        let err = `check permission error${error}`;
        Alert.alert(err);
        // console.log("[FCMService] Permission rejected", error)
      });
  }, [registerAppWithFCM, requestPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {});

    return unsubscribe;
  }, []);

  // return <MaintainScreen />;

  return !routeToRegisterOnce.current &&
    keyRingStore.status === KeyRingStatus.EMPTY ? (
    <View />
  ) : downloading || installing ? (
    <View
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors['background-container']
      }}
    >
      <View
        style={{
          marginBottom: spacing['24']
        }}
      >
        <Image
          style={{
            height: 70,
            width: 70
          }}
          fadeDuration={0}
          resizeMode="contain"
          source={require('../../assets/logo/splash-image.png')}
        />
      </View>
      <Text
        style={{
          color: colors['purple-700'],
          textAlign: 'center',
          fontWeight: '600',
          fontSize: 16,
          lineHeight: 22,
          opacity: isLoading ? 0.5 : 1
        }}
      >
        {installing ? `Installing` : `Checking for`} update
      </Text>
      <View style={{ marginVertical: 12 }}>
        <Text
          style={{
            color: colors['purple-700'],
            textAlign: 'center',
            fontSize: 13,
            lineHeight: 22
          }}
        >
          {progress}%
        </Text>
        <ProgressBar progress={progress} styles={{ width: 260 }} />
      </View>
      <TouchableOpacity
        onPress={() => {
          setDownloading(false);
          setInstalling(false);
        }}
      >
        <Text
          style={{
            color: colors['purple-700'],
            textAlign: 'center',
            fontWeight: '600',
            fontSize: 16,
            lineHeight: 22,
            opacity: isLoading ? 0.5 : 1
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <React.Fragment>
      <View
        style={{
          flex: 1,
          backgroundColor: colors['background-container']
        }}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1
          }}
        >
          <View
            style={{
              flex: 5
            }}
          />
          <View
            style={{
              flex: 3
            }}
          >
            <Image
              style={{
                marginBottom: 102,
                height: '100%',
                width: '100%'
              }}
              fadeDuration={0}
              resizeMode="contain"
              source={require('../../assets/logo/splash-image.png')}
            />
          </View>
          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20
            }}
          >
            <TextInput
              containerStyle={{
                paddingBottom: 40
              }}
              label="Password"
              accessibilityLabel="password"
              returnKeyType="done"
              secureTextEntry={true}
              value={password}
              error={isFailed ? 'Invalid password' : undefined}
              onChangeText={setPassword}
              onSubmitEditing={tryUnlock}
            />
            <OWButton
              label="Sign In"
              disabled={isLoading}
              onPress={tryUnlock}
              loading={isLoading || isBiometricLoading}
            />

            {keychainStore.isBiometryOn && (
              <OWButton
                label="Use Biometric Authentication"
                style={styles.useBiometric}
                onPress={tryBiometric}
              />
            )}
          </View>
          <View
            style={{
              flex: 7
            }}
          />
        </KeyboardAwareScrollView>
      </View>
    </React.Fragment>
  );
});

const styles = StyleSheet.create({
  useBiometric: {
    marginTop: 44
  }
});
