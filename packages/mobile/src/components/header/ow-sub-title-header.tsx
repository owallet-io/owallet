import {
  StyleSheet,
  Text,
  View,
  TextProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import React from "react";
import OWText, { OWTextProps } from "../text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { metrics, spacing } from "@src/themes";
interface IOWSubTitleHeader extends OWTextProps {
  title: string;
  containerStyle?: ViewStyle;
}
const OWSubTitleHeader = ({
  title,
  containerStyle,
  ...props
}: IOWSubTitleHeader) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.headerTitle, containerStyle]}>
      <OWText
        color={colors["text-title-login"]}
        typo="bold"
        variant="h3"
        {...props}
      >
        {title}
      </OWText>
    </View>
  );
};

export default OWSubTitleHeader;

const styles = StyleSheet.create({
  headerTitle: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    width: metrics.screenWidth,
    marginTop: spacing["top-pad"],
  },
});
