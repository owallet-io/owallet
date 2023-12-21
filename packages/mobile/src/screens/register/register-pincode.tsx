import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Clipboard, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { RegisterConfig } from '@owallet/hooks';

import OWButtonIcon from '@src/components/button/ow-button-icon';
import { LRRedact } from '@logrocket/react-native';
import OWText from '@src/components/text/ow-text';
import { metrics } from '@src/themes';
import NumericPad from 'react-native-numeric-pad';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import { useSmartNavigation } from '@src/navigation.provider';
import { useBIP44Option } from './bip44';
import { useNewMnemonicConfig } from './mnemonic';
import { Controller, useForm } from 'react-hook-form';
import { checkRouter, navigate } from '@src/router/root';
import { TextInput } from '@src/components/input';
import { OWButton } from '@src/components/button';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { CheckIcon } from '@src/components/icon';
import { SCREENS } from '@src/common/constants';
import { showToast } from '@src/utils/helper';
import { LoadingWalletScreen } from './loading-wallet';

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewPincodeScreen: FunctionComponent = observer(props => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();
  const { colors } = useTheme();
  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option();

  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);
  const [mode] = useState(registerConfig.mode);
  console.log('mode', mode);

  const [statusPass, setStatusPass] = useState(false);
  const [isNumericPad, setNumericPad] = useState(true);
  const [confirmCode, setConfirmCode] = useState(null);
  const [prevPad, setPrevPad] = useState(null);
  const [counter, setCounter] = useState(0);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const navigation = useNavigation();

  const [isCreating, setIsCreating] = useState(false);

  const onVerifyMnemonic = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      await registerConfig.createMnemonic(
        `OWallet-${Math.floor(Math.random() * (100 - 1)) + 1}`,
        newMnemonicConfig.mnemonic,
        newMnemonicConfig.password,
        bip44Option.bip44HDPath
      );
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Register.Done',
            params: {
              password: newMnemonicConfig.password,
              type: 'new'
            }
          }
        ]
      });
    } catch (err) {
      console.log('errrr,', err);
    }
  }, [newMnemonicConfig, isCreating]);
  const {
    control,
    formState: { errors }
  } = useForm<FormData>();

  const onGoBack = () => {
    if (checkRouter(props?.route?.name, 'RegisterMain')) {
      smartNavigation.goBack();
    } else {
      smartNavigation.navigateSmart('Register.Intro', {});
    }
  };

  const onSubmitEditingUserName = () => {
    if (mode === 'add') {
    }
    if (mode === 'create') {
    }
  };

  useEffect(() => {
    if (mode === 'add' && newMnemonicConfig.mnemonic) {
      setTimeout(() => {
        onVerifyMnemonic();
      }, 2000);
    }
  }, [newMnemonicConfig.mnemonic]);

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
    newMnemonicConfig.setPassword(code);
    setCode('');
    numpadRef?.current?.clearAll();
    setPrevPad('numeric');
  };

  const handleContinue = () => {
    setPrevPad('alphabet');
    if (password.length >= 6) {
      if (!confirmCode) {
        setConfirmCode(password);
        newMnemonicConfig.setPassword(password);
        setPassword('');
      } else {
        handleCheckConfirm(password);
      }
    } else {
      showToast({
        message: '*The password must be at least 6 characters',
        type: 'danger'
      });
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

  const onHandeCreateMnemonic = () => {
    numpadRef?.current?.clearAll();
    onVerifyMnemonic();
  };

  const onHandleConfirmPincodeError = () => {
    showToast({
      message: `${counter} times false. Please try again`,
      type: 'danger'
    });
    setConfirmCode(null);
    pinRef?.current?.shake().then(() => setCode(''));
    numpadRef?.current?.clearAll();
    setCounter(0);
    setPassword('');
  };

  const onHandleResetPincode = () => {
    showToast({
      message: `Password doesn't match`,
      type: 'danger'
    });
    pinRef?.current?.shake().then(() => setCode(''));
    setPassword('');
    numpadRef?.current?.clearAll();
  };

  const handleCheckConfirm = confirmPass => {
    if (confirmCode === confirmPass && counter < 3) {
      onHandeCreateMnemonic();
    } else {
      setCounter(counter + 1);
      if (counter > 3) {
        onHandleConfirmPincodeError();
      } else {
        onHandleResetPincode();
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

  useEffect(() => {
    if (code.length >= 6) {
      if (confirmCode) {
        handleConfirm();
      } else {
        handleSetPassword();
      }
    }
  }, [code]);

  const renderPassword = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        accessibilityLabel="password"
        returnKeyType="done"
        secureTextEntry={statusPass}
        value={password}
        containerStyle={{
          paddingBottom: 8
        }}
        error={isFailed ? 'Invalid password' : undefined}
        onChangeText={txt => {
          setPassword(txt);
        }}
        onSubmitEditing={() => {}}
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
    );
  };
  const validatePassword = (value: string) => {
    if (value.length < 6) {
      return 'Password must be longer than 6 characters';
    }
  };

  const styles = useStyles();

  return mode === 'add' ? (
    <LoadingWalletScreen mode={mode} />
  ) : (
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <TouchableOpacity style={styles.goBack} onPress={onGoBack}>
        <OWIcon size={16} name="arrow-left" />
      </TouchableOpacity>
      <View style={styles.aic}>
        <OWText variant="h2" typo="bold">
          {confirmCode ? 'Confirm your' : 'Set'} passcode
        </OWText>
        <OWText color={colors['text-body']} weight={'500'}>
          Secure your wallet by setting a passcode
        </OWText>
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
              <Controller
                control={control}
                rules={{
                  required: 'Password is required',
                  validate: validatePassword
                }}
                render={renderPassword}
                name="password"
                defaultValue=""
              />
              <OWText size={13} color={colors['text-body']} weight={'400'}>
                *The password must be at least 6 characters
              </OWText>
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

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    mockView: {
      height: 20
    },
    padIcon: {
      paddingLeft: 10,
      width: 'auto'
    },
    icon: {
      width: 22,
      height: 22,
      tintColor: colors['icon-purple-700-gray']
    },
    containerBtnCopy: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    containerWord: {
      marginTop: 14,
      marginBottom: 16,
      paddingTop: 16,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 10,
      borderColor: colors['border-purple-100-gray-800'],
      borderWidth: 1,
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap'
    },
    title: {
      fontSize: 24,
      lineHeight: 34,
      fontWeight: '700',
      color: colors['text-title']
    },
    headerContainer: {
      height: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    borderInput: {
      borderColor: colors['border-purple-100-gray-800'],
      backgroundColor: 'transparent',
      borderWidth: 1,
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8
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
};
