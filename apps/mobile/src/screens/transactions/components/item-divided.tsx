import { StyleSheet, View } from "react-native";
import React from "react";
import { useTheme } from "@src/themes/theme-provider";

const ItemDivided = () => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.divided,
        { backgroundColor: colors["divided-border-transaction-detail"] },
      ]}
    />
  );
};

export default ItemDivided;

const styles = StyleSheet.create({
  divided: {
    marginVertical: 7,
    height: 0.5,
  },
});
