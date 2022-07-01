import React, { FunctionComponent, useState } from 'react';
import { registerModal } from '../base';
import { CText as Text } from '../../components/text';
import { CardModal } from '../card';
import { TextInput } from '../../components/input';
import { Button } from '../../components/button';
import { TouchableOpacity, View } from 'react-native';
import { colors, typography } from '../../themes';

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

    return (
      <CardModal title={title}>
        <Text
          style={{
            ...typography['body2'],
            marginBottom: 32,
            color: colors['text-black-medium']
          }}
        >
          {paragraph || 'Enter your password to continue'}
        </Text>
        <TextInput
          label="Password"
          error={isInvalidPassword ? 'Invalid password' : undefined}
          onChangeText={(text) => {
            setPassword(text);
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
      </CardModal>
    );
  },
  {
    disableSafeArea: true
  }
);
