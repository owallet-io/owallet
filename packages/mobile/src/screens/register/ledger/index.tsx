import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RegisterConfig } from '@owallet/hooks';
import { useStyle } from '../../../styles';
import { useSmartNavigation } from '../../../navigation.provider';
import { Controller, useForm } from 'react-hook-form';
import { PageWithScrollView } from '../../../components/page';
import { TextInput } from '../../../components/input';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CText as Text } from '../../../components/text';
import { useStore } from '../../../stores';
import { Button } from '../../../components/button';
import { BIP44AdvancedButton, useBIP44Option } from '../bip44';
import {
  checkRouter,
  checkRouterPaddingBottomBar,
  navigate
} from '../../../router/root';
import { OWalletLogo } from '../owallet-logo';
import { colors } from '../../../themes';

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewLedgerScreen: FunctionComponent = observer(props => {
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

  const style = useStyle();

  const { analyticsStore, chainStore } = useStore();

  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option(chainStore.current.coinType ?? 118);
  const [mode] = useState(registerConfig.mode);

  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors }
  } = useForm<FormData>();

  const [isCreating, setIsCreating] = useState(false);
  const [statusPass, setStatusPass] = useState(false);
  const [statusConfirmPass, setStatusConfirmPass] = useState(false);

  const submit = handleSubmit(async () => {
    setIsCreating(true);

    try {
      // Re-create ledger when change network
      await registerConfig.createLedger(
        getValues('name'),
        getValues('password'),
        {
          ...bip44Option.bip44HDPath,
          coinType:
            bip44Option.bip44HDPath?.coinType ?? chainStore.current.coinType
        }
      );
      analyticsStore.setUserProperties({
        registerType: 'ledger',
        accountType: 'ledger'
      });

      if (checkRouter(props?.route?.name, 'RegisterNewLedgerMain')) {
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
    } catch (e) {
      // Definitely, the error can be thrown when the ledger connection failed
      console.log(e);
      setIsCreating(false);
    }
  });

  return (
    <PageWithScrollView
      contentContainerStyle={{
        flexGrow: 1
      }}
      style={{
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
          Import ledger Nano X
        </Text>
        <View>
          <OWalletLogo size={72} />
        </View>
      </View>
      <Controller
        control={control}
        rules={{
          required: 'Name is required'
        }}
        render={({ field: { onChange, onBlur, value, ref } }) => {
          return (
            <TextInput
              label="Username"
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
      {/* <BIP44AdvancedButton bip44Option={bip44Option} /> */}
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
                  label="Password"
                  returnKeyType="next"
                  secureTextEntry={true}
                  onSubmitEditing={() => {
                    setFocus('confirmPassword');
                  }}
                  inputStyle={{
                    ...styles.borderInput
                  }}
                  inputRight={
                    <TouchableOpacity
                      onPress={() => setStatusPass(!statusPass)}
                    >
                      <Image
                        style={{
                          width: 22,
                          height: 22
                        }}
                        source={require('../../../assets/image/transactions/eye.png')}
                        resizeMode="contain"
                        fadeDuration={0}
                      />
                    </TouchableOpacity>
                  }
                  secureTextEntry={!statusPass}
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
                  inputRight={
                    <TouchableOpacity
                      onPress={() => setStatusConfirmPass(!statusConfirmPass)}
                    >
                      <Image
                        style={{
                          width: 22,
                          height: 22
                        }}
                        source={require('../../../assets/image/transactions/eye.png')}
                        resizeMode="contain"
                        fadeDuration={0}
                      />
                    </TouchableOpacity>
                  }
                  secureTextEntry={!statusConfirmPass}
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
      <BIP44AdvancedButton bip44Option={bip44Option} />
      <View style={{ height: 20 }} />
      <TouchableOpacity
        disabled={isCreating}
        onPress={submit}
        style={{
          marginBottom: 24,
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
            'RegisterNewLedgerMain'
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
            if (checkRouter(props?.route?.name, 'RegisterNewLedgerMain')) {
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
    borderRadius: 8
  }
});
