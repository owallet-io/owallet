import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { metrics } from '@src/themes';
import { TextInput } from '../../components/input';
import delay from 'delay';
import { useStore } from '../../stores';
import { RouteProp, StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { KeyRingStatus } from '@owallet/background';
import { AccountStore } from '@owallet/stores';
import { autorun } from 'mobx';
import { useTheme } from '@src/themes/theme-provider';
import OWButton from '@src/components/button/OWButton';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import NumericPad from 'react-native-numeric-pad';
import OWIcon from '@src/components/ow-icon/ow-icon';
import OWText from '@src/components/text/ow-text';
import OWButtonIcon from '@src/components/button/ow-button-icon';

async function waitAccountLoad(accountStore: AccountStore<any, any, any, any>, chainId: string): Promise<void> {
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

export const PincodeRegisterScreen: FunctionComponent = observer(() => {
  const { keyRingStore, keychainStore, accountStore, chainStore, appInitStore, notificationStore } = useStore();
  const navigation = useNavigation();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          isNewWallet?: boolean;
        }
      >,
      string
    >
  >();
  // const isNewWallet = route?.params?.isNewWallet;
  const isNewWallet = true;

  const { colors } = useTheme();
  const styles = styling(colors);

  const [downloading, setDownloading] = useState(false);
  const [isNumericPad, setNumericPad] = useState(true);
  const [confirmCode, setConfirmCode] = useState(null);
  const [prevPad, setPrevPad] = useState(null);
  const [counter, setCounter] = useState(0);
  const [installing, setInstalling] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusPass, setStatusPass] = useState(true);
  const navigateToHomeOnce = useRef(false);
  const navigateToHome = useCallback(async () => {
    const chainId = chainStore.current.chainId;
    const isLedger = accountStore.getAccount(chainId).isNanoLedger;
    if (!navigateToHomeOnce.current) {
      if (!!accountStore.getAccount(chainId).bech32Address === false && chainId?.startsWith('inj') && isLedger) {
        navigation.dispatch(StackActions.replace('MainTab'));
      } else {
        await waitAccountLoad(accountStore, chainId);
        navigation.dispatch(StackActions.replace('MainTab'));
      }
    }
    navigateToHomeOnce.current = true;
  }, [accountStore, chainStore, navigation]);

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
      await keyRingStore.unlock(password, false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      setIsFailed(true);
    }
  };

  const routeToRegisterOnce = useRef(false);
  useEffect(() => {
    if (!routeToRegisterOnce.current && keyRingStore.status === KeyRingStatus.EMPTY) {
      (() => {
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
    const subscription = AppState.addEventListener('change', appStateHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      (async () => {
        if (!downloading) {
          navigateToHome();
        }
      })();
    }
  }, [keyRingStore.status, navigateToHome, downloading]);

  const showPass = () => setStatusPass(!statusPass);

  const pinRef = useRef(null);
  const numpadRef = useRef(null);

  const [code, setCode] = useState('');

  useEffect(() => {
    if (pinRef?.current) {
      pinRef.current.focus();
    }
  }, []);

  const handleSetPassword = () => {
    setConfirmCode(code);
    setCode('');
    numpadRef?.current?.clearAll();
    setPrevPad('numeric');
  };

  const handleContinue = () => {
    setPrevPad('alphabet');
    if (!confirmCode) {
      setConfirmCode(password);
      setPassword('');
    } else {
      handleCheckConfirm(password);
    }
  };

  const onSwitchPad = type => {
    setCode('');
    if (type === 'numeric') {
      setNumericPad(true);
    } else {
      setNumericPad(false);
    }
  };

  const handleCheckConfirm = confirmPass => {
    if (confirmCode === confirmPass && counter < 3) {
      numpadRef?.current?.clearAll();
    } else {
      setCounter(counter + 1);
      if (counter > 3) {
        setConfirmCode(null);
        pinRef?.current?.shake().then(() => setCode(''));
        numpadRef?.current?.clearAll();
        setCounter(0);
        setPassword('');
      } else {
        pinRef?.current?.shake().then(() => setCode(''));
        numpadRef?.current?.clearAll();
      }
    }
  };

  const handleConfirm = () => {
    if (prevPad === 'numeric') {
      handleCheckConfirm(code);
    } else {
      handleCheckConfirm(password);
    }
  };

  const handleLogin = () => {
    pinRef?.current?.shake().then(() => setCode(''));
    numpadRef?.current?.clearAll();
  };

  useEffect(() => {
    if (code.length >= 6) {
      if (!isNewWallet) {
        handleLogin();
      } else {
        if (confirmCode) {
          handleConfirm();
        } else {
          handleSetPassword();
        }
      }
    }
  }, [code]);

  return !routeToRegisterOnce.current && keyRingStore.status === KeyRingStatus.EMPTY ? (
    <View />
  ) : (
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <TouchableOpacity style={styles.goBack}>
        <OWIcon size={16} name="arrow-left" />
      </TouchableOpacity>
      <View style={styles.aic}>
        <OWText variant="h2" typo="bold">
          {confirmCode ? 'Confirm your' : 'Set'} passcode
        </OWText>
        <OWText>Secure your wallet by setting a passcode</OWText>
        <View
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 32
          }}
        >
          {isNumericPad ? (
            <SmoothPinCodeInput
              ref={pinRef}
              value={code}
              codeLength={6}
              cellStyle={{
                borderWidth: 0
              }}
              cellStyleFocused={{
                borderColor: colors['sub-text']
              }}
              placeholder={
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 48,
                    opacity: 0.1,
                    backgroundColor: colors['text-black-high']
                  }}
                />
              }
              mask={
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 48,
                    opacity: 0.7,
                    backgroundColor: colors['green-active']
                  }}
                />
              }
              maskDelay={1000}
              password={true}
              //   onFulfill={}
              onBackspace={code => console.log(code)}
            />
          ) : (
            <View
              style={{
                width: metrics.screenWidth,
                paddingHorizontal: 20
              }}
            >
              <TextInput
                accessibilityLabel="password"
                returnKeyType="done"
                secureTextEntry={statusPass}
                value={password}
                error={isFailed ? 'Invalid password' : undefined}
                onChangeText={txt => {
                  setPassword(txt);
                }}
                onSubmitEditing={tryUnlock}
                placeholder="Enter your passcode"
                inputRight={
                  <OWButtonIcon
                    style={styles.padIcon}
                    onPress={showPass}
                    name={statusPass ? 'eye' : 'eye-slash'}
                    colorIcon={colors['icon-purple-700-gray']}
                    sizeIcon={22}
                  />
                }
              />
            </View>
          )}
        </View>
        <View style={[styles.rc, styles.switch]}>
          <TouchableOpacity
            style={[styles.switchText, isNumericPad ? styles.switchTextActive : { marginRight: 9 }]}
            onPress={() => onSwitchPad('numeric')}
          >
            <OWText weight="500" size={16}>
              123
            </OWText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchText, !isNumericPad ? styles.switchTextActive : { marginLeft: 9 }]}
            onPress={() => onSwitchPad('alphabet')}
          >
            <OWText weight="500" size={16}>
              Aa
            </OWText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.aic}>
        {isNumericPad ? (
          <NumericPad
            ref={numpadRef}
            numLength={6}
            buttonSize={60}
            activeOpacity={0.1}
            onValueChange={value => {
              setCode(value);
            }}
            allowDecimal={false}
            // style={{ backgroundColor: 'black', paddingVertical: 12 }}
            // buttonAreaStyle={{ backgroundColor: 'gray' }}
            buttonItemStyle={styles.buttonItemStyle}
            buttonTextStyle={styles.buttonTextStyle}
            //@ts-ignore
            rightBottomButton={<OWIcon size={22} name="arrow-left" />}
            onRightBottomButtonPress={() => {
              numpadRef.current.clear();
            }}
          />
        ) : (
          <View style={styles.signIn}>
            <OWButton
              style={{
                borderRadius: 32
              }}
              label="Continue"
              disabled={isLoading || !password}
              onPress={() => {
                // tryUnlock();
                handleContinue();
              }}
              loading={isLoading || isBiometricLoading}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
});

const styling = colors =>
  StyleSheet.create({
    useBiometric: {
      // marginTop: 44
    },
    container: {
      paddingTop: metrics.screenHeight / 14,
      justifyContent: 'space-between',
      height: '100%'
    },
    signIn: {
      width: '100%',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors['gray-300'],
      padding: 16
    },
    padIcon: {
      paddingLeft: 10,
      width: 'auto'
    },
    aic: {
      alignItems: 'center',
      paddingBottom: 20
    },
    rc: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    buttonTextStyle: { fontSize: 22, color: colors['text-black-high'], fontFamily: 'SpaceGrotesk-SemiBold' },
    buttonItemStyle: {
      backgroundColor: colors['background-light-gray'],
      width: 110,
      height: 80,
      borderRadius: 8
    },
    switch: {
      backgroundColor: colors['background-light-gray'],
      padding: 4,
      borderRadius: 999,
      marginTop: 32
    },
    switchText: {
      paddingHorizontal: 24,
      paddingVertical: 6
    },
    switchTextActive: {
      backgroundColor: colors['background-light'],
      borderRadius: 999
    },
    goBack: {
      backgroundColor: colors['background-light-gray'],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 16
    }
  });
