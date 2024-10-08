import {
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import React from "react";
import { Text } from "../text";
import { spacing } from "@src/themes";
import { useTheme } from "@src/themes/theme-provider";
interface IOWButtonPage extends TouchableOpacityProps {
  title: string;
  active: boolean;
  style?: TouchableOpacityProps["style"];
}
const OWButtonPage = ({ title, style, active, ...props }: IOWButtonPage) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      {...props}
      style={[
        styles.containerButton,
        {
          borderBottomColor: active ? colors["purple-100"] : colors["blue-300"],
        },
        style,
      ]}
    >
      <Text
        size={14}
        typo="bold"
        color={active ? colors["purple-100"] : colors["blue-300"]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default OWButtonPage;

const styles = StyleSheet.create({
  containerButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing["12"],
    borderBottomWidth: 1,
  },
});
