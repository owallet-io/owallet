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

export const AddTokenConfirmModal: FunctionComponent<{
  onClose: Function;
  onConfirm: Function;
}> = observer(({ onClose, onConfirm }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <ScrollView
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          justifyContent: "center",
        }}
      >
        <OWIcon
          name="tdesignerror-triangle"
          color={colors["warning-text-body"]}
          size={16}
        />
        <Text style={styles.title} weight="700" size={16}>
          {`Confirmation`.toUpperCase()}
        </Text>
      </View>

      <View
        style={{
          borderRadius: 12,
          backgroundColor: colors["warning-surface-subtle"],
          paddingVertical: 8,
          paddingHorizontal: 4,
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors["warning-border-default"],
          marginBottom: 16,
        }}
      >
        <View
          style={{
            // flexDirection: "row",
            // paddingBottom: 6,
            gap: 6,
            paddingHorizontal: 8,
          }}
        >
          {/*<OWIcon*/}
          {/*    name="tdesignerror-triangle"*/}
          {/*    color={colors["warning-text-body"]}*/}
          {/*    size={16}*/}
          {/*/>*/}
          <OWText
            // color={colors["warning-border-default"]}
            weight="500"
            size={14}
          >
            • Before importing a token, ensure {"it's"} trustworthy to avoid
            scams and security risks.
          </OWText>
          <OWText
            // style={{paddingLeft: 4}}
            // color={colors["warning-border-default"]}
            weight="500"
            size={14}
          >
            • Please disable “Hide Dust” if the added token is not found.
          </OWText>
          <OWText
            // style={{paddingLeft: 4}}
            // color={colors["warning-border-default"]}
            weight="500"
            size={14}
          >
            • If the token has no amount, it will not be displayed.
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
