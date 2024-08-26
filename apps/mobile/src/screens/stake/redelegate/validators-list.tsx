import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@src/components/text";
import { spacing, typography } from "../../../themes";
import Validators from "./modal-validators";
import { useTheme } from "@src/themes/theme-provider";

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    containerAccount: {
      backgroundColor: colors["background-item-list"],
      paddingVertical: spacing["16"],
      borderRadius: spacing["8"],
      paddingHorizontal: spacing["16"],
      flexDirection: "row",
      marginTop: spacing["16"],
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
  });
};

const ValidatorsList = ({ onPressSelectValidator, dstValidatorAddress }) => {
  const styles = styling();
  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <View>
        <Text
          style={{
            ...typography.h6,
            fontWeight: "800",
            marginBottom: spacing["12"],
          }}
        >
          Select validator
        </Text>
      </View>
      <Validators
        onPressSelectValidator={onPressSelectValidator}
        dstValidatorAddress={dstValidatorAddress}
        styles={styles}
      />
    </View>
  );
};

export default ValidatorsList;
