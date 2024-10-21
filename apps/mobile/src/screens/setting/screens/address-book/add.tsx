import { EthereumEndpoint } from "@owallet/common";
// import {
//   AddressBookConfig,
//   useMemoConfig,
//   useRecipientConfig,
// } from "@owallet/hooks";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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
import { goBack, navigate, RootStackParamList } from "@src/router/root";
import {
  useMemoConfig,
  useRecipientConfig,
  useTxConfigsValidate,
} from "@owallet/hooks";
import { useFocusAfterRouting } from "@hooks/use-focus";
import { useIntl } from "react-intl";
import { useStyle } from "@src/styles";

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
  const { chainStore, uiConfigStore } = useStore();
  const labelRef = useFocusAfterRouting();
  const navigate = useNavigation();
  const { colors } = useTheme();
  const route =
    useRoute<RouteProp<RootStackParamList, "Setting.General.ContactAdd">>();
  const intl = useIntl();

  const [chainId, setChainId] = useState(chainStore.chainInfosInUI[0].chainId);
  // If edit mode, this will be equal or greater than 0.
  const [editIndex, setEditIndex] = useState(-1);

  const [name, setName] = useState("");

  const recipientConfig = useRecipientConfig(chainStore, chainId, {
    allowHexAddressToBech32Address: !chainStore
      .getChain(chainId)
      .chainId.startsWith("injective"),
    icns: uiConfigStore.icnsInfo,
  });
  const memoConfig = useMemoConfig(chainStore, chainId);

  // Param "chainId" is required.
  const paramChainId = route.params.chainId;
  const paramEditIndex = route.params.editIndex;

  useEffect(() => {
    navigate.setOptions({
      title:
        editIndex < 0
          ? intl.formatMessage({ id: "page.setting.contacts.add.add-title" })
          : intl.formatMessage({ id: "page.setting.contacts.add.edit-title" }),
    });
  }, [editIndex, intl, navigate]);

  useEffect(() => {
    if (!paramChainId) {
      throw new Error('Param "chainId" is required');
    }

    setChainId(paramChainId);
    recipientConfig.setChain(paramChainId);
    memoConfig.setChain(paramChainId);

    if (typeof paramEditIndex !== "undefined") {
      const index = paramEditIndex;
      // const index = Number.parseInt(paramEditIndex, 10);
      const addressBook =
        uiConfigStore.addressBookConfig.getAddressBook(paramChainId);
      if (addressBook.length > index) {
        setEditIndex(index);
        const data = addressBook[index];
        setName(data.name);
        recipientConfig.setValue(data.address);
        memoConfig.setValue(data.memo);
        return;
      }
    }

    setEditIndex(-1);
  }, [
    intl,
    memoConfig,
    paramChainId,
    paramEditIndex,
    recipientConfig,
    uiConfigStore.addressBookConfig,
  ]);

  const txConfigsValidate = useTxConfigsValidate({
    recipientConfig,
    memoConfig,
  });

  const handleSubmit = () => {
    if (txConfigsValidate.interactionBlocked || name === "") {
      return;
    }
    if (editIndex < 0) {
      uiConfigStore.addressBookConfig.addAddressBook(chainId, {
        name,
        address: recipientConfig.value,
        memo: memoConfig.value,
      });
    } else {
      uiConfigStore.addressBookConfig.setAddressBookAt(chainId, editIndex, {
        name,
        address: recipientConfig.value,
        memo: memoConfig.value,
      });
    }

    navigate.goBack();
  };
  const styles = styling(colors);
  return (
    <PageWithBottom
      bottomGroup={
        <OWButton
          label="Save"
          disabled={txConfigsValidate.interactionBlocked || name === ""}
          onPress={() => handleSubmit()}
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
            ref={labelRef}
            value={name}
            onChange={(e) => {
              e.preventDefault();
              setName(e.nativeEvent.text);
            }}
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
              // <TouchableOpacity
              //   onPress={() => {
              //     navigate("Camera", {
              //       screenCurrent: "addressbook",
              //       name,
              //     });
              //   }}
              // >
              //   <OWIcon
              //     size={22}
              //     name="tdesign_scan"
              //     color={colors["neutral-icon-on-light"]}
              //   />
              // </TouchableOpacity>
              <></>
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
