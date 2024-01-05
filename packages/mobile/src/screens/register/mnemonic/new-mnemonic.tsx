import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Clipboard } from 'react-native';
import { observer } from 'mobx-react-lite';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { RegisterConfig } from '@owallet/hooks';
import { useNewMnemonicConfig } from './hook';
import { PageWithScrollView } from '../../../components/page';
import { CheckIcon } from '../../../components/icon';
import { WordChip } from '../../../components/mnemonic';
import { Text } from '@src/components/text';
import { TextInput } from '../../../components/input';
import { Controller, useForm } from 'react-hook-form';
import { useSmartNavigation } from '../../../navigation.provider';
import { useSimpleTimer } from '../../../hooks';
import { BIP44AdvancedButton, useBIP44Option } from '../bip44';
import { navigate, checkRouter } from '../../../router/root';
import { OWalletLogo } from '../owallet-logo';
import OWButton from '../../../components/button/OWButton';
import OWIcon from '../../../components/ow-icon/ow-icon';
import { spacing } from '../../../themes';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { LRRedact } from '@logrocket/react-native';

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewMnemonicScreen: FunctionComponent = observer(props => {
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
  const [statusPass, setStatusPass] = useState(false);
  const [statusConfirmPass, setStatusConfirmPass] = useState(false);

  const words = newMnemonicConfig.mnemonic.split(' ');

  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors }
  } = useForm<FormData>();

  const submit = handleSubmit(() => {
    newMnemonicConfig.setName(getValues('name'));
    newMnemonicConfig.setPassword(getValues('password'));

    if (checkRouter(props?.route?.name, 'RegisterMain')) {
      navigate('RegisterVerifyMnemonicMain', {
        registerConfig,
        newMnemonicConfig,
        bip44HDPath: bip44Option.bip44HDPath
      });
    } else {
      smartNavigation.navigateSmart('Register.VerifyMnemonic', {
        registerConfig,
        newMnemonicConfig,
        bip44HDPath: bip44Option.bip44HDPath
      });
    }
  });
  const onGoBack = () => {
    if (checkRouter(props?.route?.name, 'RegisterMain')) {
      smartNavigation.goBack();
    } else {
      smartNavigation.navigateSmart('Register.Intro', {});
    }
  };
  const onSubmitEditingUserName = () => {
    if (mode === 'add') {
      submit();
    }
    if (mode === 'create') {
      setFocus('password');
    }
  };
  const renderUserName = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label="Username"
        inputStyle={{
          ...styles.borderInput
        }}
        returnKeyType={mode === 'add' ? 'done' : 'next'}
        onSubmitEditing={onSubmitEditingUserName}
        error={errors.name?.message}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        ref={ref}
      />
    );
  };
  const onSubmitEditingPassword = () => {
    setFocus('confirmPassword');
  };
  const showPass = () => setStatusPass(!statusPass);
  const renderPassword = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label="Password"
        returnKeyType="next"
        inputStyle={{
          ...styles.borderInput
        }}
        secureTextEntry={true}
        onSubmitEditing={onSubmitEditingPassword}
        inputRight={
          <OWButtonIcon
            style={styles.padIcon}
            onPress={showPass}
            name={!statusPass ? 'eye' : 'eye-slash'}
            colorIcon={colors['icon-primary-surface-default-gray']}
            sizeIcon={22}
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
  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return 'Password must be longer than 8 characters';
    }
  };
  const showConfirmPass = useCallback(() => setStatusConfirmPass(!statusConfirmPass), [statusConfirmPass]);

  const renderConfirmPassword = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label="Confirm password"
        returnKeyType="done"
        inputRight={
          <OWButton
            style={styles.padIcon}
            type="link"
            onPress={showConfirmPass}
            icon={
              <OWIcon
                name={!statusConfirmPass ? 'eye' : 'eye-slash'}
                color={colors['icon-primary-surface-default-gray']}
                size={22}
              />
            }
          />
        }
        secureTextEntry={!statusConfirmPass}
        onSubmitEditing={submit}
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
  const validateConfirmPassword = (value: string) => {
    if (value.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if (getValues('password') !== value) {
      return "Password doesn't match";
    }
  };
  const styles = useStyles();

  return (
    <PageWithScrollView contentContainerStyle={styles.container} backgroundColor={colors['plain-background']}>
      {/* Mock for flexible margin top */}
      <LRRedact>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create new wallet</Text>
          <View>
            <OWalletLogo size={72} />
          </View>
        </View>
        <WordsCard words={words} />
        <Controller
          control={control}
          rules={{
            required: 'Name is required'
          }}
          render={renderUserName}
          name="name"
          defaultValue={`OWallet-${Math.floor(Math.random() * 100)}`}
        />
        {mode === 'create' ? (
          <React.Fragment>
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
            <Controller
              control={control}
              rules={{
                required: 'Confirm password is required',
                validate: validateConfirmPassword
              }}
              render={renderConfirmPassword}
              name="confirmPassword"
              defaultValue=""
            />
          </React.Fragment>
        ) : null}
        <BIP44AdvancedButton bip44Option={bip44Option} />
        <OWButton onPress={submit} label="Next" />
        <OWButton onPress={onGoBack} label="Go back" type="link" />
      </LRRedact>
    </PageWithScrollView>
  );
});

const WordsCard: FunctionComponent<{
  words: string[];
}> = ({ words }) => {
  const { isTimedOut, setTimer } = useSimpleTimer();
  const { colors } = useTheme();
  /*
    On IOS, user can peek the words by right side gesture from the verifying mnemonic screen.
    To prevent this, hide the words if the screen lost the focus.
   */
  const [hideWord, setHideWord] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setHideWord(false);
    } else {
      const timeout = setTimeout(() => {
        setHideWord(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isFocused]);
  const onCopy = useCallback(() => {
    Clipboard.setString(words.join(' '));
    setTimer(3000);
  }, [words]);
  const styles = useStyles();
  return (
    <View style={styles.containerWord}>
      {words.map((word, i) => {
        return <WordChip key={i.toString()} index={i + 1} word={word} hideWord={hideWord} />;
      })}

      <View style={styles.containerBtnCopy}>
        <View
          style={{
            flex: 1
          }}
        />
        <OWButton
          style={styles.padIcon}
          onPress={onCopy}
          icon={
            isTimedOut ? (
              <CheckIcon />
            ) : (
              <OWIcon name="copy" color={colors['icon-primary-surface-default-gray']} size={20} />
            )
          }
          type="link"
        />
      </View>
    </View>
  );
};

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
      tintColor: colors['icon-primary-surface-default-gray']
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
    container: {
      paddingHorizontal: spacing['page-pad'],
      // flexGrow: 1,
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
