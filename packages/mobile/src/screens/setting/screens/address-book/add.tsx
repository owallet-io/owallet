import { EthereumEndpoint } from "@owallet/common";
import {
  AddressBookConfig,
  useAddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@owallet/hooks";
import { RouteProp, useRoute } from "@react-navigation/native";
import { OWBox } from "@src/components/card";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AsyncKVStore } from "../../../../common";
import { OWButton } from "../../../../components/button";
import { Scanner } from "../../../../components/icon";
import {
  AddressInput,
  MemoInput,
  TextInput,
} from "../../../../components/input";
import { PageWithScrollView } from "../../../../components/page";
import { useSmartNavigation } from "../../../../navigation.provider";
import { useStore } from "../../../../stores";
import { spacing } from "../../../../themes";

const styling = (colors) =>
  StyleSheet.create({
    addNewBookRoot: {
      backgroundColor: colors["background"],
      // marginTop: spacing['24'],
      paddingHorizontal: spacing["20"],
      paddingVertical: spacing["24"],
      borderRadius: spacing["24"],
    },
    addNewBookLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: colors["label"],
      lineHeight: 22,
    },
    addNewBookInput: {
      borderTopLeftRadius: spacing["8"],
      borderTopRightRadius: spacing["8"],
      borderBottomLeftRadius: spacing["8"],
      borderBottomRightRadius: spacing["8"],
      color: colors["sub-text"],
      backgroundColor: colors["background-box"],
    },
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
          addressBookObj?: Object;
        }
      >,
      string
    >
  >();

  const { chainStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);

  const recipientConfig = useRecipientConfig(
    chainStore,
    route.params.chainId,
    EthereumEndpoint
  );

  const smartNavigation = useSmartNavigation();
  // const addressBookConfig = route.params.addressBookConfig;

  const addressBookConfig = route.params.addressBookConfig
    ? route.params.addressBookConfig
    : useAddressBookConfig(
        new AsyncKVStore("address_book"),
        chainStore,
        chainStore.current.chainId,
        {
          setRecipient: (recipient: string) => {
            if (recipientConfig) {
              recipientConfig.setRawRecipient(recipient);
            }
          },
          setMemo: (memo: string) => {
            if (memoConfig) {
              memoConfig.setMemo(memo);
            }
          },
        }
      );

  const [name, setName] = useState("");
  useEffect(() => {
    if (route?.params?.recipient) {
      recipientConfig.setRawRecipient(route?.params?.recipient);
    }
    if (route?.params?.addressBookObj) {
      setName(route?.params?.addressBookObj?.name);
    }
  }, [route?.params?.recipient, route?.params?.addressBookObj]);

  const memoConfig = useMemoConfig(chainStore, route.params.chainId);
  // const keyboardVerticalOffset = Platform.OS === 'ios' ? -50 : 0;

  return (
    // <PageWithScrollView behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}>
    <PageWithScrollView
      backgroundColor={colors["background"]}
      style={{ marginTop: spacing["24"] }}
    >
      <OWBox>
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
                smartNavigation.navigateSmart("Camera", {
                  screenCurrent: "addressbook",
                  name,
                });
              }}
            >
              <Scanner color={colors["primary-surface-default"]} />
            </TouchableOpacity>
          }
        />
        <MemoInput
          label="Memo (optional)"
          memoConfig={memoConfig}
          labelStyle={styles.addNewBookLabel}
          inputContainerStyle={{
            ...styles.addNewBookInput,
            height: 190,
          }}
          multiline={false}
          placeholder="Type memo here"
        />
        <OWButton
          label="Save"
          size="large"
          type="primary"
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
                memo: memoConfig.memo,
              });
              smartNavigation.goBack();
              // smartNavigation.navigateSmart('AddressBook', {});
            }
          }}
        />
      </OWBox>
    </PageWithScrollView>
  );
});
