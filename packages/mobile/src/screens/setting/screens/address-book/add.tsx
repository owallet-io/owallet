import React, { FunctionComponent, useEffect, useState } from 'react';
import { PageWithScrollView } from '../../../../components/page';
import { useStyle } from '../../../../styles';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  AddressBookConfig,
  RecipientConfig,
  useMemoConfig,
  useRecipientConfig
} from '@owallet/hooks';
import { observer } from 'mobx-react-lite';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import { useStore } from '../../../../stores';
import { EthereumEndpoint } from '@owallet/common';
import {
  AddressInput,
  MemoInput,
  TextInput
} from '../../../../components/input';
import { Button } from '../../../../components/button';
import { useSmartNavigation } from '../../../../navigation.provider';
import { colors, spacing } from '../../../../themes';
import { Scanner } from '../../../../components/icon';
import {
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  addNewBookRoot: {
    backgroundColor: colors['white'],
    // marginTop: spacing['24'],
    paddingHorizontal: spacing['20'],
    paddingVertical: spacing['24'],
    borderRadius: spacing['24']
  },
  addNewBookLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors['gray-900'],
    lineHeight: 22
  },
  addNewBookInput: {
    borderTopLeftRadius: spacing['8'],
    borderTopRightRadius: spacing['8'],
    borderBottomLeftRadius: spacing['8'],
    borderBottomRightRadius: spacing['8']
  }
});

export const AddAddressBookScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
          addressBookConfig: AddressBookConfig;
          recipient: string;
        }
      >,
      string
    >
  >();

  const { chainStore, analyticsStore } = useStore();

  const recipientConfig = useRecipientConfig(
    chainStore,
    route.params.chainId,
    EthereumEndpoint
  );

  const smartNavigation = useSmartNavigation();
  const addressBookConfig = route.params.addressBookConfig;
  const [name, setName] = useState('');

  useEffect(() => {
    if (route?.params?.recipient) {
      recipientConfig.setRawRecipient(route?.params?.recipient);
    }
  }, [route?.params?.recipient]);

  const memoConfig = useMemoConfig(chainStore, route.params.chainId);
  // const keyboardVerticalOffset = Platform.OS === 'ios' ? -50 : 0;

  return (
    // <PageWithScrollView behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}>
    <PageWithScrollView style={{ marginTop: spacing['24']}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.addNewBookRoot}>
          <TextInput
            label="User name"
            value={name}
            onChangeText={(text) => setName(text)}
            labelStyle={styles.addNewBookLabel}
            inputContainerStyle={styles.addNewBookInput}
            placeholder="Type your user name"
          />
          <AddressInput
            label="Wallet address"
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            disableAddressBook={false}
            labelStyle={styles.addNewBookLabel}
            inputContainerStyle={styles.addNewBookInput}
            placeholder="Tap to paste"
            inputRight={
              <TouchableOpacity
                onPress={() => {
                  smartNavigation.navigateSmart('Camera', {
                    screenCurrent: 'addressbook'
                  });
                }}
              >
                <Scanner color={colors['purple-900']} />
              </TouchableOpacity>
            }
          />
          <MemoInput
            label="Memo (optional)"
            memoConfig={memoConfig}
            labelStyle={styles.addNewBookLabel}
            inputContainerStyle={{
              ...styles.addNewBookInput,
              height: 190
            }}
            multiline={false}
            placeholder="Type memo here"
          />
          <Button
            text="Save"
            size="large"
            style={
              name && {
                backgroundColor: colors['purple-900']
              }
            }
            disabled={
              !name ||
              recipientConfig.getError() != null ||
              memoConfig.getError() != null
            }
            onPress={async () => {
              if (
                name &&
                recipientConfig.getError() == null &&
                memoConfig.getError() == null
              ) {
                await addressBookConfig.addAddressBook({
                  name,
                  address: recipientConfig.rawRecipient,
                  memo: memoConfig.memo
                });
                smartNavigation.goBack();
              }
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </PageWithScrollView>
  );
});
