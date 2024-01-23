import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { RegisterConfig } from '@owallet/hooks';
import { useSmartNavigation } from '../../../navigation.provider';
import { Controller, useForm } from 'react-hook-form';
import { TextInput } from '../../../components/input';
import { StyleSheet, TouchableOpacity, View, Clipboard } from 'react-native';
import { useStore } from '../../../stores';
import { useBIP44Option } from '../bip44';
import { Buffer } from 'buffer';
import { checkRouter, navigate } from '../../../router/root';
import { metrics, typography } from '../../../themes';
import OWButton from '../../../components/button/OWButton';
import OWIcon from '../../../components/ow-icon/ow-icon';
import { SCREENS } from '@src/common/constants';
import OWText from '@src/components/text/ow-text';
import { showToast } from '@src/utils/helper';
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
    setValue,
    getValues,
    formState: { errors }
  } = useForm<FormData>();
  const { colors } = useTheme();
  const styles = useStyle();

  const [isCreating, setIsCreating] = useState(false);
  const submit = handleSubmit(async () => {
    setIsCreating(true);

    // check if the mode is create or add
    // add - do the flowing process below
    const mnemonic = trimWordsStr(getValues('mnemonic'));
    const walletName = getValues('name');
    if (!isPrivateKey(mnemonic)) {
      await registerConfig.createMnemonic(walletName, mnemonic, getValues('password'), bip44Option.bip44HDPath);
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
    if (checkRouter(route?.name, 'RegisterRecoverPhraseMain')) {
      navigate(SCREENS.RegisterDone, {
        password: getValues('password'),
        type: 'recover',
        walletName: walletName
      });
    } else {
      smartNavigation.reset({
        index: 0,
        routes: [
          {
            name: SCREENS.RegisterDone,
            params: {
              password: getValues('password'),
              type: 'recover',
              walletName: walletName
            }
          }
        ]
      });
    }
  });

  const handleCreateWithMnemonic = () => {
    // check if the mode is create or add
    // create - do the flowing process below
    const mnemonic = trimWordsStr(getValues('mnemonic'));

    smartNavigation.navigateSmart('Register.NewPincode', {
      registerConfig,
      words: mnemonic,
      walletName: getValues('name')
    });
  };

  const onPaste = async () => {
    const text = await Clipboard.getString();
    if (text) {
      setValue('mnemonic', text, {
        shouldValidate: true
      });
    }
  };
  const onGoBack = () => {
    if (checkRouter(route?.name, 'RegisterRecoverMnemonicMain')) {
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

  const handleValidate = () => {
    if (validateMnemonic(getValues('mnemonic'))?.length > 0) {
      showToast({
        type: 'danger',
        message: validateMnemonic(getValues('mnemonic'))
      });
      return false;
    }
    if (getValues('name').length <= 0) {
      showToast({
        type: 'danger',
        message: 'Wallet name is required'
      });
      return false;
    }
    return true;
  };

  const renderMnemonic = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label=""
        returnKeyType="next"
        multiline={true}
        numberOfLines={4}
        placeholder={'Enter your recovery phrase or private key...'}
        inputContainerStyle={styles.mnemonicInput}
        bottomInInputContainer={<View />}
        style={{
          minHeight: 20 * 4,
          textAlignVertical: 'top',
          ...typography['h6'],
          color: colors['neutral-text-body']
        }}
        onSubmitEditing={() => {}}
        inputStyle={{
          ...styles.borderInput
        }}
        error={errors.mnemonic?.message}
        onBlur={onBlur}
        onChangeText={txt => {
          onChange(txt.toLocaleLowerCase());
        }}
        value={value}
        ref={ref}
      />
    );
  };

  const renderWalletName = ({ field: { onChange, onBlur, value, ref } }) => {
    return (
      <TextInput
        label=""
        topInInputContainer={
          <View style={{ paddingBottom: 4 }}>
            <OWText>Wallet Name</OWText>
          </View>
        }
        returnKeyType="next"
        inputStyle={{
          width: metrics.screenWidth - 32,
          borderColor: colors['neutral-border-strong']
        }}
        style={{ fontWeight: '600', paddingLeft: 4, fontSize: 15 }}
        inputLeft={<OWIcon size={20} name="wallet-outline" color={colors['primary-text-action']} />}
        error={errors.name?.message}
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
        <TouchableOpacity onPress={onGoBack} style={styles.goBack}>
          <OWIcon size={16} color={colors['neutral-icon-on-light']} name="arrow-left" />
        </TouchableOpacity>
        <View style={[styles.aic, styles.title]}>
          <OWText variant="heading" style={{ textAlign: 'center' }} typo="bold">
            Enter recovery phrase or private key
          </OWText>

          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32
            }}
          />
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

          <View style={styles.paste}>
            <TouchableOpacity
              style={styles.pasteBtn}
              onPress={() => {
                onPaste();
              }}
            >
              <OWIcon size={20} name="mnemo" color={colors['primary-text-action']} />
              <OWText
                style={{ paddingLeft: 4 }}
                variant="h2"
                weight="600"
                size={14}
                color={colors['primary-text-action']}
              >
                Paste from clipboard
              </OWText>
            </TouchableOpacity>
          </View>
          <Controller
            control={control}
            rules={{
              required: 'Wallet name is required'
            }}
            render={renderWalletName}
            name="name"
            defaultValue={`OWallet-${Math.floor(Math.random() * (100 - 1)) + 1}`}
          />
        </View>
      </View>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32
            }}
            label={mode === 'add' ? 'Import' : ' Next'}
            loading={isCreating}
            disabled={isCreating}
            onPress={() => {
              if (!handleValidate()) {
                return;
              }
              if (mode === 'add') {
                submit();
              } else {
                handleCreateWithMnemonic();
              }
            }}
          />
        </View>
      </View>
    </View>
  );
});

const useStyle = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    mnemonicInput: {
      width: metrics.screenWidth - 40,
      paddingLeft: 20,
      paddingRight: 20,
      paddingVertical: 10,
      backgroundColor: 'transparent'
    },
    borderInput: {
      borderColor: colors['primary-surface-default'],
      borderWidth: 2,
      backgroundColor: 'transparent',
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8
    },

    container: {
      paddingTop: metrics.screenHeight / 14,
      justifyContent: 'space-between',
      height: '100%',
      backgroundColor: colors['neutral-surface-card']
    },
    signIn: {
      width: '100%',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors['neutral-border-default'],
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
    title: {
      paddingHorizontal: 16,
      paddingTop: 24
    },
    goBack: {
      backgroundColor: colors['neutral-surface-action3'],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 16
    },
    paste: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      width: '100%'
    },
    pasteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end'
    }
  });
};
