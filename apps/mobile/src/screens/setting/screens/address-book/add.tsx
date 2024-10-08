import { EthereumEndpoint } from "@owallet/common";
import {
  AddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@owallet/hooks";
import { RouteProp, useRoute } from "@react-navigation/native";
import { OWBox } from "@src/components/card";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWText from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { showToast } from "@src/utils/helper";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { OWButton } from "../../../../components/button";
import {
  AddressInput,
  MemoInput,
  TextInput,
} from "../../../../components/input";

import { useStore } from "../../../../stores";
import { metrics, spacing } from "../../../../themes";
import { goBack, navigate } from "@src/router/root";

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
      backgroundColor: colors["neutral-surface-bg2"],
      borderWidth: 0,
    },
    input: {
      borderColor: colors["neutral-border-strong"],
      borderRadius: 12,
    },
    textInput: { fontWeight: "600", paddingLeft: 4, fontSize: 15 },
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

  const addressBookConfig = route.params.addressBookConfig;

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
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Save"
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
              if (addressBookConfig) {
                await addressBookConfig.addAddressBook({
                  name,
                  address: recipientConfig.rawRecipient,
                  memo: memoConfig.memo,
                });
                goBack();
              } else {
                showToast({
                  message: "Something went wrong! Plase try again.",
                  type: "danger",
                });
              }
            }
          }}
          style={[
            {
              width: metrics.screenWidth - 32,
              marginTop: 20,
              borderRadius: 999,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
            color: colors["neutral-text-action-on-dark-bg"],
          }}
        />
      }
    >
      <ScrollView
        contentContainerStyle={{ height: metrics.screenHeight }}
        showsVerticalScrollIndicator={false}
      >
        <OWBox style={{ backgroundColor: colors["neutral-surface-card"] }}>
          <TextInput
            label=""
            topInInputContainer={
              <View style={{ paddingBottom: 4 }}>
                <OWText>Contact name</OWText>
              </View>
            }
            returnKeyType="next"
            onSubmitEditing={() => {}}
            inputStyle={styles.input}
            style={styles.textInput}
            inputLeft={
              <OWIcon
                size={22}
                name="tdesign_book"
                color={colors["neutral-icon-on-light"]}
              />
            }
            onChangeText={(text) => setName(text)}
            value={name}
            placeholder="Enter contact name"
          />

          <AddressInput
            label=""
            topInInputContainer={
              <View style={{ paddingBottom: 4 }}>
                <OWText>Address</OWText>
              </View>
            }
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            disableAddressBook={false}
            inputContainerStyle={styles.input}
            labelStyle={styles.addNewBookLabel}
            placeholder="Enter address"
            inputLeft={
              <View style={{ paddingRight: 6 }}>
                <OWIcon
                  size={22}
                  name="wallet"
                  color={colors["neutral-icon-on-light"]}
                />
              </View>
            }
            inputRight={
              <TouchableOpacity
                onPress={() => {
                  navigate("Camera", {
                    screenCurrent: "addressbook",
                    name,
                  });
                }}
              >
                <OWIcon
                  size={22}
                  name="tdesign_scan"
                  color={colors["neutral-icon-on-light"]}
                />
              </TouchableOpacity>
            }
          />
          <MemoInput
            label=""
            topInInputContainer={
              <View style={{ paddingBottom: 4 }}>
                <OWText>Memo(Optional)</OWText>
              </View>
            }
            inputLeft={
              <View style={{ paddingRight: 6 }}>
                <OWIcon
                  size={22}
                  name="tdesign_mail"
                  color={colors["neutral-icon-on-light"]}
                />
              </View>
            }
            inputContainerStyle={styles.input}
            memoConfig={memoConfig}
            labelStyle={styles.addNewBookLabel}
            multiline={false}
            placeholder="Type memo here"
          />
        </OWBox>
      </ScrollView>
    </PageWithBottom>
  );
});
