import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState
} from 'react';
import { observer } from 'mobx-react-lite';
import { BIP44Option } from './bip44-option';
import { registerModal } from '../../../modals/base';
import { CardModal } from '../../../modals/card';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { TextInput } from '../../../components/input';
import { colors, typography } from '../../../themes';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CText as Text } from '../../../components/text';
const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

export const BIP44AdvancedButton: FunctionComponent<{
  bip44Option: BIP44Option;
}> = observer(({ bip44Option }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // const isChangeZeroOrOne =
  //   change.isValid && (change.number === 0 || change.number === 1);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <BIP44SelectModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        bip44Option={bip44Option}
      />
      <Text onPress={() => setIsModalOpen(true)}>Advanced Option</Text>
      {/* <View
        style={{
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text
          style={{
            ...typography['body2'],
            color: colors['text-black-medium']
          }}
        >{`m/44’/`}</Text>
        <TextInput
          value={coinType.value}
          containerStyle={{
            minWidth: 58,
            paddingBottom: 0
          }}
          inputStyle={styles.borderInput}
          style={{ textAlign: 'right' }}
          keyboardType="number-pad"
          onChangeText={text => {
            bip44Option.setCoinType(coinType.number);

            coinType.setValue(text);
          }}
        />
        <Text>’/</Text>
        <TextInput
          value={account.value}
          containerStyle={{
            minWidth: 58,
            paddingBottom: 0
          }}
          inputStyle={styles.borderInput}
          style={{ textAlign: 'right' }}
          keyboardType="number-pad"
          onChangeText={text => {
            account.setValue(text);
            bip44Option.setAccount(account.number);
          }}
        />
        <Text>’/</Text>
        <TextInput
          inputStyle={styles.borderInput}
          value={change.value}
          containerStyle={{
            minWidth: 58,
            paddingBottom: 0
          }}
          style={{ textAlign: 'right' }}
          keyboardType="number-pad"
          onChangeText={text => {
            change.setValue(text);
            bip44Option.setChange(change.number);
          }}
        />
        <Text>/</Text>
        <TextInput
          inputStyle={styles.borderInput}
          value={index.value}
          containerStyle={{
            minWidth: 58,
            paddingBottom: 0
          }}
          style={{ textAlign: 'right' }}
          keyboardType="number-pad"
          onChangeText={text => {
            index.setValue(text);
            bip44Option.setIndex(index.number);
          }}
        />
      </View> */}
    </KeyboardAvoidingView>
  );
});

const useZeroOrPositiveIntegerString = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue: useCallback((text: string) => {
      if (!text) {
        setValue('');
        return;
      }

      const num = Number.parseInt(text);
      if (!Number.isNaN(num) && num >= 0) {
        setValue(num.toString());
      }
    }, []),
    isValid: useMemo(() => {
      if (!value) {
        return false;
      }

      const num = Number.parseInt(value);
      return !Number.isNaN(num) && num >= 0;
    }, [value]),
    number: useMemo(() => {
      return Number.parseInt(value);
    }, [value])
  };
};

export const BIP44SelectModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bip44Option: BIP44Option;
}> = registerModal(
  observer(({ bip44Option, close }) => {
    const account = useZeroOrPositiveIntegerString(
      bip44Option.account.toString()
    );

    const coinType = useZeroOrPositiveIntegerString(
      bip44Option.coinType ? bip44Option.coinType.toString() : '-'
    );
    const change = useZeroOrPositiveIntegerString(
      bip44Option.change.toString()
    );
    const index = useZeroOrPositiveIntegerString(bip44Option.index.toString());

    const isChangeZeroOrOne =
      change.isValid && (change.number === 0 || change.number === 1);

    return (
      <CardModal title="HD Derivation Path">
        <Text
          style={{
            ...typography['body2'],
            marginBottom: 18,
            color: colors['text-black-medium']
          }}
        >
          Set custom address derivation path by modifying the indexes below:
        </Text>
        <View
          style={{
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              ...typography['body2'],
              color: colors['text-black-medium']
            }}
          >{`m/44’/`}</Text>
          <TextInput
            value={coinType.value}
            containerStyle={{
              minWidth: 58,
              paddingBottom: 0
            }}
            inputStyle={styles.borderInput}
            style={{ textAlign: 'right' }}
            keyboardType="number-pad"
            onChangeText={coinType.setValue}
          />
          <Text>’/</Text>
          <TextInput
            value={account.value}
            containerStyle={{
              minWidth: 58,
              paddingBottom: 0
            }}
            style={{ textAlign: 'right' }}
            keyboardType="number-pad"
            onChangeText={account.setValue}
          />
          <Text>’/</Text>
          <TextInput
            value={change.value}
            containerStyle={{
              minWidth: 58,
              paddingBottom: 0
            }}
            style={{ textAlign: 'right' }}
            keyboardType="number-pad"
            onChangeText={change.setValue}
          />
          <Text>/</Text>
          <TextInput
            value={index.value}
            containerStyle={{
              minWidth: 58,
              paddingBottom: 0
            }}
            style={{ textAlign: 'right' }}
            keyboardType="number-pad"
            onChangeText={index.setValue}
          />
        </View>
        {change.isValid && !isChangeZeroOrOne ? (
          <Text
            style={{
              color: colors['color-danger'],
              paddingBottom: 8,
              ...typography['text-caption2']
            }}
          >
            Change should be 0 or 1
          </Text>
        ) : null}
        <TouchableOpacity
          disabled={
            !account.isValid ||
            !change.isValid ||
            !index.isValid ||
            !isChangeZeroOrOne
          }
          style={{
            marginBottom: 240,
            marginTop: 32,
            backgroundColor: colors['purple-900'],
            borderRadius: 8
          }}
          onPress={() => {
            bip44Option.setCoinType(coinType.number);
            bip44Option.setAccount(account.number);
            bip44Option.setChange(change.number);
            bip44Option.setIndex(index.number);
            close();
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
            Confirm
          </Text>
        </TouchableOpacity>
        {/* <Button
          text="Confirm"
          size="large"
          disabled={
            !account.isValid ||
            !change.isValid ||
            !index.isValid ||
            !isChangeZeroOrOne
          }
          onPress={() => {
            bip44Option.setAccount(account.number);
            bip44Option.setChange(change.number);
            bip44Option.setIndex(index.number);

            close();
          }}
        /> */}
      </CardModal>
    );
  }),
  {
    disableSafeArea: true
  }
);

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
