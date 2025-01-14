import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ScrollView, StyleSheet, View } from "react-native";
import { metrics } from "@src/themes";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { Text } from "@src/components/text";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { useStore } from "@src/stores";

export const PrivKeyConfirmModal: FunctionComponent<{
  onClose: Function;
  onConfirm: Function;
}> = observer(({ onClose, onConfirm }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(chainStore.current.chainId);

  return (
    <ScrollView
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title} weight="700" size={16}>
        {`Confirmation`.toUpperCase()}
      </Text>
      <View
        style={{
          borderRadius: 12,
          backgroundColor: colors["warning-surface-subtle"],
          paddingVertical: 8,
          paddingHorizontal: 4,
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors["warning-border-default"],
          marginBottom: metrics.screenHeight / 6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 6,
            alignItems: "center",
          }}
        >
          <OWIcon
            name="tdesignerror-triangle"
            color={colors["warning-text-body"]}
            size={16}
          />
          <OWText
            style={{ paddingLeft: 4 }}
            color={colors["warning-border-default"]}
            weight="500"
            size={14}
          >
            The private key you are about to generate will only function within{" "}
            {chainInfo.chainName} network. Do you wish to proceed?
          </OWText>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <OWButton
          style={styles.confirmBtn}
          textStyle={styles.txtBtn}
          type={"secondary"}
          label="No, Cancel"
          size="medium"
          onPress={() => {
            onClose();
          }}
        />
        <OWButton
          style={styles.confirmBtn}
          textStyle={styles.txtBtn}
          type={"primary"}
          label="Yes, Confirm"
          size="medium"
          onPress={() => {
            onConfirm();
          }}
        />
      </View>
    </ScrollView>
  );
});

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
