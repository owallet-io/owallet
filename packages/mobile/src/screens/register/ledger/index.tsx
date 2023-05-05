import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { RegisterConfig } from '@owallet/hooks';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import { useSmartNavigation } from '../../../navigation.provider';
import { Controller, useForm } from 'react-hook-form';
import { PageWithScrollView } from '../../../components/page';
import { TextInput } from '../../../components/input';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '@src/components/text';
import { useStore } from '../../../stores';
import { BIP44AdvancedButton, useBIP44Option } from '../bip44';
import { checkRouter, navigate } from '../../../router/root';
import { OWalletLogo } from '../owallet-logo';
import { spacing } from '../../../themes';
import OWButton from '../../../components/button/OWButton';
import OWIcon from '../../../components/ow-icon/ow-icon';
import { SCREENS } from '@src/common/constants';

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
  const { colors } = useTheme();
  const styles = useStyles();

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
        navigate(SCREENS.RegisterEnd, {
          password: getValues('password')
        });
      } else {
        smartNavigation.reset({
          index: 0,
          routes: [
            {
              name: SCREENS.RegisterEnd,
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
  const renderName = ({ field: { onChange, onBlur, value, ref } }) => {
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
  };
  const validatePass = (value: string) => {
    if (value.length < 8) {
      return 'Password must be longer than 8 characters';
    }
  };
  const renderPass = ({ field: { onChange, onBlur, value, ref } }) => {
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
          <OWButton
            style={styles.padIcon}
            type="link"
            onPress={() => setStatusPass(!statusPass)}
            icon={
              <OWIcon
                name={!statusPass ? 'eye' : 'eye-slash'}
                color={colors['icon-purple-700-gray']}
                size={22}
              />
            }
          />
        }
        secureTextEntry={!statusPass}
        error={errors.password?.message}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        ref={ref}
      />
    );
  };
  const validateConfirmPass = (value: string) => {
    if (value.length < 8) {
      return 'Password must be longer than 8 characters';
    }

    if (getValues('password') !== value) {
      return "Password doesn't match";
    }
  };
  const onGoBack = () => {
    if (checkRouter(props?.route?.name, 'RegisterNewLedgerMain')) {
      smartNavigation.goBack();
    } else {
      smartNavigation.navigateSmart('Register.Intro', {});
    }
  };

  const requestPermissions = async () => {
    await requestMultiple([
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT
    ]);
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const renderConfirmPass = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label="Confirm password"
        returnKeyType="done"
        inputRight={
          <OWButton
            style={styles.padIcon}
            type="link"
            onPress={() => setStatusConfirmPass(!statusConfirmPass)}
            icon={
              <OWIcon
                name={!statusConfirmPass ? 'eye' : 'eye-slash'}
                color={colors['icon-purple-700-gray']}
                size={22}
              />
            }
          />
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
  };
  return (
    <PageWithScrollView
      contentContainerStyle={styles.containerContentStyle}
      backgroundColor={colors['plain-background']}
    >
      <View style={styles.viewHeader}>
        <Text style={styles.titleHeader}>Import ledger Nano X</Text>
        <View>
          <OWalletLogo size={72} />
        </View>
      </View>
      <Controller
        control={control}
        rules={{
          required: 'Name is required'
        }}
        render={renderName}
        name="name"
        defaultValue=""
      />
      {mode === 'create' ? (
        <React.Fragment>
          <Controller
            control={control}
            rules={{
              required: 'Password is required',
              validate: validatePass
            }}
            render={renderPass}
            name="password"
            defaultValue=""
          />
          <Controller
            control={control}
            rules={{
              required: 'Confirm password is required',
              validate: validateConfirmPass
            }}
            render={renderConfirmPass}
            name="confirmPassword"
            defaultValue=""
          />
        </React.Fragment>
      ) : null}
      <BIP44AdvancedButton bip44Option={bip44Option} />
      <View style={styles.heightView} />
      <OWButton
        loading={isCreating}
        disabled={isCreating}
        onPress={submit}
        label={'Next'}
      />
      <OWButton type="link" onPress={onGoBack} label={'Go back'} />

      {/* Mock element for bottom padding */}
      <View
        style={{
          height: 20
        }}
      />
    </PageWithScrollView>
  );
});

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    padIcon: {
      width: 22,
      height: 22
    },
    heightView: { height: 20 },
    titleHeader: {
      fontSize: 24,
      lineHeight: 34,
      fontWeight: '700',
      color: colors['label']
    },
    viewHeader: {
      height: 72,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    containerContentStyle: {
      flexGrow: 1,
      paddingHorizontal: spacing['page-pad'],
      paddingTop: Platform.OS == 'android' ? 50 : 0
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
    }
  });
};
