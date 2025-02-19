import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { registerModal } from "@src/modals/base";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@src/components/text";
import { OWButton } from "@src/components/button";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";

export const SlippageConfirmModal = registerModal(
  //@ts-ignore
  ({ close, impactWarning, handleConfirm }) => {
    const safeAreaInsets = useSafeAreaInsets();

    const { colors } = useTheme();
    const styles = styling(colors);

    return (
      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { paddingBottom: safeAreaInsets.bottom }]}
      >
        <Text style={styles.title} weight="700" size={16}>
          {`Confirmation`.toUpperCase()}
        </Text>
        <View
          style={{
            borderRadius: 12,
            backgroundColor: colors["warning-surface-subtle"],
            padding: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors["warning-border-default"],
            marginBottom: metrics.screenHeight / 6,
            flexDirection: "row",
          }}
        >
          <OWText
            color={colors["warning-border-default"]}
            weight="500"
            size={14}
          >
            This swap has price impact over {impactWarning.toFixed(2)}%. Are you
            sure you have reviewed the swap details ?
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
              handleConfirm();
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
