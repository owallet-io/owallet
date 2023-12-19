import React, { FunctionComponent, useState } from 'react';
import { PageWithScrollView } from '../../../components/page';
import { observer } from 'mobx-react-lite';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { RegisterConfig } from '@owallet/hooks';
import { useSmartNavigation } from '../../../navigation.provider';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from '../../../components/input';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, Clipboard } from 'react-native';
import { Button } from '../../../components/button';
import { useStore } from '../../../stores';
import { BIP44AdvancedButton, useBIP44Option } from '../bip44';
import { Buffer } from 'buffer';
import { checkRouter, checkRouterPaddingBottomBar, navigate } from '../../../router/root';
import { OWalletLogo } from '../owallet-logo';
import { metrics, spacing, typography } from '../../../themes';
import { LoadingSpinner } from '../../../components/spinner';
import OWButton from '../../../components/button/OWButton';
import OWIcon from '../../../components/ow-icon/ow-icon';
import { SCREENS } from '@src/common/constants';
import { LRRedact } from '@logrocket/react-native';
import OWText from '@src/components/text/ow-text';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require('bip39');

function isPrivateKey(str: string): boolean {
  if (str?.startsWith('0x')) {
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
  const words = splited.map(word => word.trim()).filter(word => word.trim().length > 0);
  return words.join(' ');
}

interface FormData {
  mnemonic: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export const RecoverPhraseScreen: FunctionComponent = observer(props => {
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
  const { colors } = useTheme();
  const styles = useStyle();

  const [isCreating, setIsCreating] = useState(false);
  const [statusPass, setStatusPass] = useState(false);
  const [statusConfirmPass, setStatusConfirmPass] = useState(false);
  const submit = handleSubmit(async () => {
    setIsCreating(true);

    const mnemonic = trimWordsStr(getValues('mnemonic'));
    if (!isPrivateKey(mnemonic)) {
      await registerConfig.createMnemonic(getValues('name'), mnemonic, getValues('password'), bip44Option.bip44HDPath);
      analyticsStore.setUserProperties({
        registerType: 'seed',
        accountType: 'mnemonic'
      });
    } else {
      const privateKey = Buffer.from(mnemonic.trim().replace('0x', ''), 'hex');
      await registerConfig.createPrivateKey(getValues('name'), privateKey, getValues('password'));
      analyticsStore.setUserProperties({
        registerType: 'seed',
        accountType: 'privateKey'
      });
    }
    if (checkRouter(props?.route?.name, 'RegisterRecoverMnemonicMain')) {
      navigate(SCREENS.RegisterEnd, {
        password: getValues('password'),
        type: 'recover'
      });
    } else {
      smartNavigation.reset({
        index: 0,
        routes: [
          {
            name: 'Register.End',
            params: {
              password: getValues('password'),
              type: 'recover'
            }
          }
        ]
      });
    }
  });
  const onPaste = async () => {
    const text = await Clipboard.getString();
    if (text) {
      setValue('mnemonic', text, {
        shouldValidate: true
      });
      setFocus('name');
    }
  };
  const onGoBack = () => {
    if (checkRouter(props?.route?.name, 'RegisterRecoverMnemonicMain')) {
      smartNavigation.goBack();
    } else {
      smartNavigation.navigateSmart('Register.Intro', {});
    }
  };
  const validateMnemonic = (value: string) => {
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
        if (Buffer.from(value, 'hex').toString('hex').toLowerCase() !== value.toLowerCase()) {
          return 'Invalid private key';
        }
      } catch {
        return 'Invalid private key';
      }
    }
  };
  const renderMnemonic = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label="Mnemonic / Private key"
        returnKeyType="next"
        multiline={true}
        numberOfLines={4}
        inputContainerStyle={styles.mnemonicInput}
        bottomInInputContainer={
          <View style={styles.containerInputMnemonic}>
            <View />

            <OWButton type="secondary" label="Paste" size="small" fullWidth={false} onPress={onPaste} />
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
  };
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
        label="New password"
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
            icon={<OWIcon name={!statusPass ? 'eye' : 'eye-slash'} color={colors['icon-purple-700-gray']} size={22} />}
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
  const renderConfirmPass = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label="Confirm password"
        returnKeyType="done"
        onSubmitEditing={() => {
          submit();
        }}
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
    <View style={styles.container}>
      <View>
        <TouchableOpacity style={styles.goBack}>
          <OWIcon size={16} name="arrow-left" />
        </TouchableOpacity>
        <View style={[styles.aic, styles.title]}>
          <OWText variant="h2" style={{ textAlign: 'center' }} typo="bold">
            Enter recovery phrase or private key
          </OWText>

          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32
            }}
          ></View>
          <Controller
            control={control}
            rules={{
              required: 'Mnemonic is required',
              validate: validateMnemonic
            }}
            render={renderMnemonic}
            name="mnemonic"
            defaultValue=""
          />
          <TouchableOpacity onPress={() => {}}>
            <View style={styles.rc}>
              <OWIcon size={14} name="copy" color={colors['purple-900']} />
              <OWText style={{ paddingLeft: 8 }} variant="h2" weight="600" size={14} color={colors['purple-900']}>
                Paste from clipboard
              </OWText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32
            }}
            label="Import"
            disabled={false}
            onPress={() => {}}
            loading={false}
          />
        </View>
      </View>
    </View>
  );
});

const useStyle = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    containerInputMnemonic: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    mnemonicInput: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingVertical: 10,
      backgroundColor: 'transparent'
    },
    padIcon: {
      width: 22,
      height: 22
    },
    titleHeader: {
      fontSize: 24,
      lineHeight: 34,
      fontWeight: '700',
      color: colors['label']
    },
    headerView: {
      height: 72,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    borderInput: {
      borderColor: colors['border-purple-100-gray-800'],
      borderWidth: 1,
      backgroundColor: 'transparent',
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8
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
      padding: 16,
      borderColor: colors['primary-default'],
      borderWidth: 1,
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap'
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
    goBack: {
      backgroundColor: colors['background-light-gray'],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 16
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24
    }
  });
};
