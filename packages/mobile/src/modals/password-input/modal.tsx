import React, { FunctionComponent, useState } from 'react';
import { registerModal } from '../base';
import { CText as Text } from '../../components/text';
import { CardModal } from '../card';
import { TextInput } from '../../components/input';
import { Button } from '../../components/button';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextStyle,
  TouchableOpacity,
  View
} from 'react-native';
import { colors, metrics, typography } from '../../themes';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

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
    const [password, setPassword] = useState('');
    const [isInvalidPassword, setIsInvalidPassword] = useState(false);

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
      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
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
                  color: colors['text-black-medium']
                }}
              >
                {paragraph || 'Do not reveal your mnemonic to anyone'}
              </Text>
            ) : (
              <Text />
            )}
            <TextInput
              label="Enter your password to continue"
              error={isInvalidPassword ? 'Invalid password' : undefined}
              onChangeText={text => {
                setPassword(text);
              }}
              inputStyle={{
                borderColor: colors['purple-100'],
                borderWidth: 1,
                backgroundColor: colors['white'],
                paddingLeft: 11,
                paddingRight: 11,
                paddingTop: 12,
                borderRadius: 8
              }}
              value={password}
              returnKeyType="done"
              secureTextEntry={true}
              // onSubmitEditing={submitPassword}
            />
          </TouchableWithoutFeedback>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <TouchableOpacity
              onPress={() => close()}
              style={{
                backgroundColor: colors['purple-900'],
                borderRadius: 8,
                width: '48%'
              }}
            >
              <Text
                style={{
                  color: colors['white'],
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 16,
                  lineHeight: 22,
                  padding: 16
                }}
              >
                {textButtonLeft}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={submitPassword}
              style={{
                borderRadius: 8,
                width: '48%',
                ...buttonRightStyle,
                backgroundColor: !password
                  ? colors['gray-10']
                  : buttonRightStyle
                  ? buttonRightStyle?.backgroundColor
                  : buttonRightStyle?.backgroundColor
                  ? colors['purple-900']
                  : colors['purple-900']
              }}
              disabled={!password || disabled}
            >
              <Text
                style={{
                  color: colors['white'],
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 16,
                  lineHeight: 22,
                  padding: 16
                }}
              >
                {textButtonRight}
              </Text>
            </TouchableOpacity>
          </View>
        </CardModal>
      </KeyboardAvoidingView>
    );
  },
  {
    disableSafeArea: true
  }
);
