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
  TouchableOpacity,
  View
} from 'react-native';
import { colors, typography } from '../../themes';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export const PasswordInputModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  paragraph?: string;
  /**
   * If any error thrown in the `onEnterPassword`, the password considered as invalid password.
   * @param password
   */
  onEnterPassword: (password: string) => Promise<void>;
}> = registerModal(
  ({ close, title, paragraph, onEnterPassword }) => {
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

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 360 : 0;

    return (
      <CardModal title={title}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Text
              style={{
                ...typography['body2'],
                marginBottom: 32,
                color: colors['text-black-medium']
              }}
            >
              {paragraph || 'Do not reveal your mnemonic to anyone'}
            </Text>
            <TextInput
              label="Enter your password"
              error={isInvalidPassword ? 'Invalid password' : undefined}
              onChangeText={(text) => {
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
              onSubmitEditing={submitPassword}
            />
            <TouchableOpacity
              onPress={submitPassword}
              style={{
                marginBottom: 24,
                marginTop: 44,
                backgroundColor: colors['purple-900'],
                borderRadius: 8
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
                Approve
              </Text>
            </TouchableOpacity>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </CardModal>
    );
  },
  {
    disableSafeArea: true
  }
);
