import React, { FunctionComponent, useState } from 'react';
import { registerModal } from '../base';
import { Text } from '@src/components/text';
import { CardModal } from '../card';
import { TextInput } from '../../components/input';
import { Button } from '../../components/button';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextStyle,
  TouchableOpacity,
  View
} from 'react-native';
import { metrics, typography } from '../../themes';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useStore } from '../../stores';
import { useTheme } from '@src/themes/theme-provider';
import OWButtonGroup from '@src/components/button/OWButtonGroup';

export const PasswordInputModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  paragraph?: string;
  labelStyle?: TextStyle;
  textButtonLeft?: string;
  textButtonRight?: string;
  buttonRightStyle?: TextStyle;
  disabled?: boolean;
  /**
   * If any error thrown in the `onEnterPassword`, the password considered as invalid password.
   * @param password
   */
  onEnterPassword: (password: string) => Promise<void>;
}> = registerModal(
  ({
    close,
    title,
    paragraph,
    onEnterPassword,
    labelStyle,
    textButtonLeft = 'Cancel',
    textButtonRight = 'Approve',
    buttonRightStyle,
    disabled
  }) => {
    const { appInitStore } = useStore();
    const [password, setPassword] = useState('');
    const [isInvalidPassword, setIsInvalidPassword] = useState(false);
    const scheme = appInitStore.getInitApp.theme;
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    const submitPassword = async () => {
      setIsLoading(true);
      try {
        await onEnterPassword(password);
        setIsInvalidPassword(false);
        close();
      } catch (e) {
        console.log(e);
        setIsInvalidPassword(true);
      } finally {
        setIsLoading(false);
      }
    };
    const keyboardVerticalOffset =
      Platform.OS === 'ios' ? metrics.screenHeight / 2.1 : 0;

    return (
      // <KeyboardAvoidingView
      //   behavior="position"
      //   keyboardVerticalOffset={keyboardVerticalOffset}
      // >
        <CardModal title={title} labelStyle={labelStyle}>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            {paragraph ? (
              <Text
                style={{
                  ...typography['body2'],
                  marginBottom: 32,
                  color:
                    scheme === 'dark'
                      ? colors['sub-text']
                      : colors['text-black-medium']
                }}
              >
                {paragraph || 'Do not reveal your mnemonic to anyone'}
              </Text>
            ) : (
              <Text />
            )}
            <TextInput
              isBottomSheet
              label="Enter your password to continue"
              error={isInvalidPassword ? 'Invalid password' : undefined}
              onChangeText={(text) => {
                setPassword(text);
              }}
              labelStyle={{
                color:
                  scheme === 'dark'
                    ? colors['white']
                    : colors['text-black-high']
              }}
              inputStyle={{
                borderWidth: 1,
                backgroundColor: colors['background-input-modal'],
                paddingLeft: 11,
                paddingRight: 11,
                paddingTop: 12,
                borderRadius: 8,
                color:
                  scheme === 'dark'
                    ? colors['white']
                    : colors['text-black-high']
              }}
              value={password}
              returnKeyType="done"
              secureTextEntry={true}
              onSubmitEditing={submitPassword}
            />
          </TouchableWithoutFeedback>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <OWButtonGroup
              labelApprove={textButtonRight}
              onPressApprove={submitPassword}
              disabledApprove={!password || disabled}
              loadingApprove={isLoading}
              labelClose={textButtonLeft}
              onPressClose={close}
            />
          </View>
        </CardModal>
      // </KeyboardAvoidingView>
    );
  },
  {
    disableSafeArea: true
  }
);
