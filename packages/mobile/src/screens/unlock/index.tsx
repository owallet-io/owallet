import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import * as SplashScreen from 'expo-splash-screen';
import { TextInput } from '../../components/input';
import { Button } from '../../components/button';
import delay from 'delay';
import { useStore } from '../../stores';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StackActions, useNavigation } from '@react-navigation/native';
import { KeyRingStatus } from '@owallet/background';
import { KeychainStore } from '../../stores/keychain';
import { AccountStore } from '@owallet/stores';
import { autorun } from 'mobx';
import { colors } from '../../themes';
import { LoadingSpinner } from '../../components/spinner';

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
  const { keyRingStore, keychainStore, accountStore, chainStore } = useStore();
  const navigation = useNavigation();

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
    keyRingStore.status === KeyRingStatus.LOCKED
  );

  useEffect(() => {
    (async () => {
      await hideSplashScreen();
    })();
  }, [autoBiometryStatus, navigation]);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const tryBiometric = useCallback(async () => {
    try {
      setIsBiometricLoading(true);
      await delay(10);
      await keychainStore.tryUnlockWithBiometry();

      await hideSplashScreen();

      analyticsStore.logEvent("Account unlocked", {
        authType: "biometrics",
      });
    } catch (e) {
      console.log(e);
      setIsBiometricLoading(false);
    }
  }, [analyticsStore, keychainStore]);

  const tryUnlock = async () => {
    try {
      setIsLoading(true);
      await delay(10);
      await keyRingStore.unlock(password);

      await hideSplashScreen();

      analyticsStore.logEvent("Account unlocked", {
        authType: "password",
      });
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
    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      (async () => {
        await hideSplashScreen();
        navigateToHome();
      })();
    }
  }, [keyRingStore.status, navigateToHome]);

  return !routeToRegisterOnce.current &&
    keyRingStore.status === KeyRingStatus.EMPTY ? (
    <View />
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
                borderColor: colors['purple-100'],
                borderWidth: 1,
                backgroundColor: colors['white'],
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
                {isLoading ? (
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
              <Button
                containerStyle={{
                  marginTop: 40
                }}
                text="Use Biometric Authentication"
                mode="text"
                loading={isBiometricLoading}
                onPress={tryBiometric}
              />
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
