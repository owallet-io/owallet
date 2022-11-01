import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  AppState,
  AppStateStatus,
  Image,
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
import {
  StackActions,
  useNavigation,
  useTheme
} from '@react-navigation/native';
import { KeyRingStatus } from '@owallet/background';
import { KeychainStore } from '../../stores/keychain';
import { AccountStore } from '@owallet/stores';
import { autorun } from 'mobx';
import { spacing } from '../../themes';
import { LoadingSpinner } from '../../components/spinner';
import { ProgressBar } from '../../components/progress-bar';
import CodePush from 'react-native-code-push';

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

  return new Promise(resolve => {
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
    appInitStore
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
      status => {
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
            appInitStore.updateDate(Date.now());
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
            appInitStore.updateDate(Date.now());
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
        backgroundColor: colors['splash-background']
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
        {/* <Image
          style={{
            width: 300,
            height: 8
          }}
          fadeDuration={0}
          resizeMode="stretch"
          source={require('../../assets/image/transactions/process_pedding.gif')}
        /> */}
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
          backgroundColor: colors['splash-background']
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
              inputStyle={{
                borderColor: colors['border'],
                borderWidth: 1,
                backgroundColor: colors['item'],
                paddingLeft: 11,
                paddingRight: 11,
                paddingTop: 12,
                paddingBottom: 12,
                borderRadius: 4
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
            <TouchableOpacity
              disabled={isLoading}
              onPress={tryUnlock}
              style={{
                marginBottom: 24,
                backgroundColor: colors['purple-900'],
                borderRadius: 8
              }}
            >
              <View
                style={{
                  padding: 16,
                  alignItems: 'center'
                }}
              >
                {isLoading || isBiometricLoading ? (
                  <LoadingSpinner color={colors['white']} size={20} />
                ) : (
                  <Text
                    style={{
                      color: colors['white'],
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 16,
                      lineHeight: 22,
                      opacity: isLoading ? 0.5 : 1
                    }}
                  >
                    Sign in
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            {keychainStore.isBiometryOn ? (
              <TouchableOpacity
                onPress={tryBiometric}
                style={{
                  marginBottom: 24,
                  marginTop: 44,
                  backgroundColor: colors['purple-900'],
                  borderRadius: 8
                }}
              >
                <Text
                  style={{
                    color: colors['white'],
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 16,
                    lineHeight: 22,
                    padding: 16
                  }}
                >
                  Use Biometric Authentication
                </Text>
              </TouchableOpacity>
            ) : null}
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
