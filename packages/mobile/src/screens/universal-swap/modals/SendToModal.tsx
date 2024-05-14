import {
  Clipboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { registerModal } from "@src/modals/base";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@src/components/text";
import { OWButton } from "@src/components/button";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import { TextInput } from "@src/components/input";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { AlertIcon } from "@src/components/icon";

export const SendToModal = registerModal(
  //@ts-ignore
  ({ close, handleSendToAddress, sendToAddress, handleToggle }) => {
    const safeAreaInsets = useSafeAreaInsets();

    const [address, setAdress] = useState("");

    const { colors } = useTheme();
    const styles = styling(colors);

    const onPaste = async () => {
      const text = await Clipboard.getString();
      if (text) {
        setAdress(text);
      }
    };

    useEffect(() => {
      setAdress(sendToAddress);
    }, [sendToAddress]);

    return (
      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { paddingBottom: safeAreaInsets.bottom }]}
      >
        <Text style={styles.title} weight="700" size={16}>
          SEND TO
        </Text>
        <View>
          <TextInput
            value={address}
            // multiline
            topInInputContainer={
              <View style={{ paddingBottom: 4 }}>
                <OWText>Address</OWText>
              </View>
            }
            onChangeText={(txt) => setAdress(txt.toLowerCase())}
            inputContainerStyle={{
              borderColor: colors["neutral-border-strong"],
              borderRadius: 12,
            }}
            labelStyle={{
              fontSize: 16,
              fontWeight: "700",
              color: colors["label"],
              lineHeight: 22,
            }}
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
                style={{
                  backgroundColor: colors["neutral-surface-action3"],
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}
                onPress={() => {
                  onPaste();
                }}
              >
                <OWText weight="600">Paste</OWText>
              </TouchableOpacity>
            }
            autoCorrect={false}
            autoCapitalize="none"
            autoCompleteType="off"
          />
          {/* <TextInput
            // multiline
            topInInputContainer={
              <View style={{ paddingBottom: 4 }}>
                <OWText>Memo</OWText>
              </View>
            }
            inputContainerStyle={{
              borderColor: colors["neutral-border-strong"],
              borderRadius: 12
            }}
            labelStyle={{
              fontSize: 16,
              fontWeight: "700",
              color: colors["label"],
              lineHeight: 22
            }}
            placeholder="Required if send to some CEX"
            autoCorrect={false}
            autoCapitalize="none"
            autoCompleteType="off"
          /> */}
        </View>
        <View
          style={{
            borderRadius: 12,
            backgroundColor: colors["warning-surface-subtle"],
            padding: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors["warning-border-default"],
            marginBottom: metrics.screenHeight / 6,
          }}
        >
          <View style={{ flexDirection: "row", paddingBottom: 6 }}>
            <OWIcon
              name="tdesignerror-triangle"
              color={colors["warning-text-body"]}
              size={16}
            />
            <OWText
              style={{ paddingLeft: 8 }}
              color={colors["warning-border-default"]}
              weight="500"
              size={14}
            >
              Verify your address!
            </OWText>
          </View>
          <OWText
            color={colors["warning-border-default"]}
            weight="500"
            size={14}
          >
            Sending to CEX needing a memo isn't supported
          </OWText>
          <OWText weight="400" size={12}>
            Ensure that the network of the recipient address match your entered
            token to avoid potential loss of funds
          </OWText>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <OWButton
            style={styles.confirmBtn}
            textStyle={styles.txtBtn}
            type={"secondary"}
            label="Cancel"
            size="medium"
            onPress={() => {
              close();
              handleToggle(false);
            }}
          />
          <OWButton
            style={styles.confirmBtn}
            textStyle={styles.txtBtn}
            type={"primary"}
            label="Confirm"
            size="medium"
            onPress={() => {
              close();
              handleSendToAddress(address);
            }}
          />
        </View>
      </ScrollView>
    );
  }
);

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    txtBtn: {
      fontWeight: "700",
      fontSize: 16,
    },
    confirmBtn: {
      width: metrics.screenWidth / 2.35,
      marginTop: 16,
      height: 48,
      borderRadius: 999,
    },
    title: {
      paddingVertical: 10,
      alignSelf: "center",
    },
    container: {
      paddingHorizontal: 24,
    },
  });
