import React, { FunctionComponent, useState } from 'react';
import { PageWithScrollView } from '../../../components/page';
import { observer } from 'mobx-react-lite';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RegisterConfig } from '@owallet/hooks';
import { useSmartNavigation } from '../../../navigation.provider';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from '../../../components/input';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/button';
import Clipboard from 'expo-clipboard';
import { useStore } from '../../../stores';
import { BIP44AdvancedButton, useBIP44Option } from '../bip44';
import { Buffer } from 'buffer';
import {
  checkRouter,
  checkRouterPaddingBottomBar,
  navigate
} from '../../../router/root';
import { OWalletLogo } from '../owallet-logo';
import { colors, typography } from '../../../themes';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require('bip39');

function isPrivateKey(str: string): boolean {
  if (str.startsWith('0x')) {
    return true;
  }

  if (str.length === 64) {
    try {
      return Buffer.from(str, 'hex').length === 32;
    } catch {
      return false;
    }
  }
  return false;
}

function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
    .map((word) => word.trim())
    .filter((word) => word.trim().length > 0);
  return words.join(' ');
}

interface FormData {
  mnemonic: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export const RecoverMnemonicScreen: FunctionComponent = observer(() => {
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

  const { analyticsStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option();
  const [mode] = useState(registerConfig.mode);

  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<FormData>();

  const [isCreating, setIsCreating] = useState(false);

  const submit = handleSubmit(async () => {
    setIsCreating(true);

    const mnemonic = trimWordsStr(getValues('mnemonic'));

    if (!isPrivateKey(mnemonic)) {
      await registerConfig.createMnemonic(
        getValues('name'),
        mnemonic,
        getValues('password'),
        bip44Option.bip44HDPath
      );
      analyticsStore.setUserProperties({
        registerType: 'seed',
        accountType: 'mnemonic'
      });
    } else {
      const privateKey = Buffer.from(mnemonic.trim().replace('0x', ''), 'hex');
      await registerConfig.createPrivateKey(
        getValues('name'),
        privateKey,
        getValues('password')
      );
      analyticsStore.setUserProperties({
        registerType: 'seed',
        accountType: 'privateKey'
      });
    }
    if (checkRouter(props?.route?.name, 'RegisterRecoverMnemonicMain')) {
      navigate('RegisterEnd', {
        password: getValues('password')
      });
    } else {
      smartNavigation.reset({
        index: 0,
        routes: [
          {
            name: 'Register.End',
            params: {
              password: getValues('password')
            }
          }
        ]
      });
    }

    analyticsStore.setUserId();
    analyticsStore.setUserProperties({
      registerType: "seed",
    });
    analyticsStore.logEvent("Import account finished", {
      accountType: "mnemonic",
    });

    smartNavigation.reset({
      index: 0,
      routes: [
        {
          name: 'Register.End',
          params: {
            password: getValues('password')
          }
        }
      ]
    });
  });

  return (
    <PageWithScrollView
      contentContainerStyle={{
        display: 'flex',
        flexGrow: 1,
        paddingLeft: 20,
        paddingRight: 20
      }}
      backgroundColor={colors['white']}
    >
      <View
        style={{
          height: 72,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text
          style={{
            fontSize: 24,
            lineHeight: 34,
            fontWeight: '700',
            color: '#1C1C1E'
          }}
        >
          Import wallet
        </Text>
        <View>
          <OWalletLogo size={72} />
        </View>
      </View>
      <Controller
        control={control}
        rules={{
          required: 'Mnemonic is required',
          validate: (value: string) => {
            value = trimWordsStr(value);
            if (!isPrivateKey(value)) {
              if (value.split(' ').length < 8) {
                return 'Too short mnemonic';
              }

              if (!bip39.validateMnemonic(value)) {
                return 'Invalid mnemonic';
              }
            } else {
              value = value.replace('0x', '');
              if (value.length !== 64) {
                return 'Invalid length of private key';
              }

              try {
                if (
                  Buffer.from(value, 'hex').toString('hex').toLowerCase() !==
                  value.toLowerCase()
                ) {
                  return 'Invalid private key';
                }
              } catch {
                return 'Invalid private key';
              }
            }
          }
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Mnemonic"
              returnKeyType="next"
              multiline={true}
              numberOfLines={4}
              inputContainerStyle={{
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 10,
                paddingBottom: 10
              }}
              bottomInInputContainer={
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row'
                  }}
                >
                  <View
                    style={{
                      flex: 1
                    }}
                  />
                  <Button
                    containerStyle={{
                      height: 36
                    }}
                    style={{
                      paddingLeft: 12,
                      paddingRight: 12,
                      backgroundColor: 'white'
                    }}
                    textStyle={{
                      color: colors['purple-700']
                    }}
                    mode="text"
                    text="Paste"
                    onPress={async () => {
                      const text = await Clipboard.getStringAsync();
                      if (text) {
                        setValue('mnemonic', text, {
                          shouldValidate: true
                        });
                        setFocus('name');
                      }
                    }}
                  />
                </View>
              }
              style={{
                minHeight: 20 * 4,
                textAlignVertical: 'top',
                ...typography['h6'],
                color: colors['text-black-medium']
              }}
              onSubmitEditing={() => {
                setFocus('name');
              }}
              inputStyle={{
                ...styles.borderInput
              }}
              error={errors.mnemonic?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="mnemonic"
        defaultValue=""
      />
      <Controller
        control={control}
        rules={{
          required: 'Name is required'
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Username"
              containerStyle={{
                paddingBottom: 6
              }}
              returnKeyType={mode === 'add' ? 'done' : 'next'}
              onSubmitEditing={() => {
                if (mode === 'add') {
                  submit();
                }
                if (mode === 'create') {
                  setFocus('password');
                }
              }}
              inputStyle={{
                ...styles.borderInput
              }}
              error={errors.name?.message}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              ref={ref}
            />
          );
        }}
        name="name"
        defaultValue=""
      />
      <BIP44AdvancedButton bip44Option={bip44Option} />
      {mode === 'create' ? (
        <React.Fragment>
          <Controller
            control={control}
            rules={{
              required: 'Password is required',
              validate: (value: string) => {
                if (value.length < 8) {
                  return 'Password must be longer than 8 characters';
                }
              }
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  label="New password"
                  returnKeyType="next"
                  secureTextEntry={true}
                  onSubmitEditing={() => {
                    setFocus('confirmPassword');
                  }}
                  inputStyle={{
                    ...styles.borderInput
                  }}
                  error={errors.password?.message}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  ref={ref}
                />
              );
            }}
            name="password"
            defaultValue=""
          />
          <Controller
            control={control}
            rules={{
              required: 'Confirm password is required',
              validate: (value: string) => {
                if (value.length < 8) {
                  return 'Password must be longer than 8 characters';
                }

                if (getValues('password') !== value) {
                  return "Password doesn't match";
                }
              }
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => {
              return (
                <TextInput
                  label="Confirm password"
                  returnKeyType="done"
                  secureTextEntry={true}
                  onSubmitEditing={() => {
                    submit();
                  }}
                  inputStyle={{
                    ...styles.borderInput
                  }}
                  error={errors.confirmPassword?.message}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  ref={ref}
                />
              );
            }}
            name="confirmPassword"
            defaultValue=""
          />
        </React.Fragment>
      ) : null}
      <TouchableOpacity
        disabled={isCreating}
        onPress={submit}
        style={{
          marginBottom: 24,
          marginTop: 32,
          backgroundColor: colors['purple-900'],
          borderRadius: 8
        }}
      >
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            padding: 16
          }}
        >
          Next
        </Text>
      </TouchableOpacity>
      <View
        style={{
          paddingBottom: checkRouterPaddingBottomBar(
            props?.route?.name,
            'RegisterRecoverMnemonicMain'
          )
        }}
      >
        <Text
          style={{
            color: colors['purple-900'],
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16
          }}
          onPress={() => {
            if (
              checkRouter(props?.route?.name, 'RegisterRecoverMnemonicMain')
            ) {
              smartNavigation.goBack();
            } else {
              smartNavigation.navigateSmart('Register.Intro', {});
            }
          }}
        >
          Go back
        </Text>
      </View>
      {/* Mock element for bottom padding */}
      <View
        style={{
          height: 20
        }}
      />
    </PageWithScrollView>
  );
});

const styles = StyleSheet.create({
  borderInput: {
    borderColor: colors['purple-100'],
    borderWidth: 1,
    backgroundColor: colors['white'],
    paddingLeft: 11,
    paddingRight: 11,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 4
  }
});
