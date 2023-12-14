import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { metrics } from '@src/themes';
import { TextInput } from '../../components/input';
import delay from 'delay';
import { useStore } from '../../stores';
import { StackActions, useNavigation } from '@react-navigation/native';
import { KeyRingStatus } from '@owallet/background';
import { AccountStore } from '@owallet/stores';
import { autorun } from 'mobx';
import { useTheme } from '@src/themes/theme-provider';
import OWButton from '@src/components/button/OWButton';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import NumericPad from 'react-native-numeric-pad';
import OWIcon from '@src/components/ow-icon/ow-icon';
import OWText from '@src/components/text/ow-text';

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

export const PincodeScreen: FunctionComponent = observer(() => {
  const { keyRingStore, keychainStore, accountStore, chainStore, appInitStore, notificationStore } = useStore();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = styling(colors);

  const [downloading, setDownloading] = useState(false);
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

  const pinRef = useRef();
  const numpadRef = useRef(null);

  const [code, setCode] = useState('');

  const _checkCode = code => {
    if (code != '1234') {
      if (pinRef?.current) {
        //@ts-ignore
        pinRef.current.shake().then(() => setCode(''));
      }
    }
  };

  useEffect(() => {
    if (pinRef?.current) {
      //@ts-ignore
      pinRef.current.focus();
    }
  }, []);

  return !routeToRegisterOnce.current && keyRingStore.status === KeyRingStatus.EMPTY ? (
    <View />
  ) : (
    <View
      style={{
        paddingTop: metrics.screenHeight / 7,
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <View style={styles.aic}>
        <OWText variant="h2" typo="bold">
          Enter your passcode
        </OWText>
        <View
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 32
          }}
        >
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
                  backgroundColor: colors['text-black-high']
                }}
              />
            }
            maskDelay={1000}
            password={true}
            onFulfill={_checkCode}
            onBackspace={code => console.log(code)}
          />
        </View>
      </View>
      <View style={styles.aic}>
        <View style={styles.rc}>
          <OWIcon size={14} name="arrow-left" color={colors['purple-900']} />
          <OWText style={{ paddingLeft: 8 }} variant="h2" weight="600" size={14} color={colors['purple-900']}>
            Sign in with Face ID
          </OWText>
        </View>
        <NumericPad
          ref={numpadRef}
          numLength={8}
          buttonSize={60}
          activeOpacity={0.1}
          onValueChange={value => setCode(value)}
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
      </View>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
    useBiometric: {
      // marginTop: 44
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
    }
  });
