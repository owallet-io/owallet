import { StyleSheet, Text, View, ViewProps, ViewStyle } from "react-native";
import React from "react";
import { metrics, spacing } from "@src/themes";
import { useTheme } from "@src/themes/theme-provider";
import OWLinearGradientBox from "./ow-linear-gradient-box";

export interface IOWBoxProps extends ViewProps {
  type?: "shadow" | "gradient" | "normal";
}
const useStyleType = ({ type }) => {
  const { colors, dark } = useTheme();
  let styles: ViewStyle = {};
  switch (type) {
    case "shadow":
      if (!dark) {
        styles = {
          shadowColor: colors["gray-150"],
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.26,
          shadowRadius: 2.62,
          borderRadius: spacing["12"],
          elevation: 4,
          width: "100%",
          backgroundColor: colors["background-box-shadow"],
        };
      } else {
        styles = {
          borderRadius: spacing["12"],
          width: "100%",
          backgroundColor: colors["background-box-shadow"],
        };
      }

      break;
    case "gradient":
      styles = {
        marginTop: spacing["top-pad"],
        width: "100%",
        paddingHorizontal: spacing["20"],
        paddingVertical: spacing["24"],
        borderRadius: spacing["12"],
      };
      break;
    case "normal":
      styles = {
        marginTop: spacing["top-pad"],
        width: metrics.screenWidth,
        padding: spacing["horizontal-pad"],
        borderRadius: spacing["horizontal-pad"],
        backgroundColor: colors["neutral-surface-card"],
      };
      break;
    default:
      styles = {
        marginTop: 24,
        width: metrics.screenWidth,
        padding: spacing["24"],
        borderRadius: spacing["24"],
        backgroundColor: colors["neutral-surface-card"],
      };
      break;
  }
  return styles;
};
const OWBox = ({ children, style, type = "normal", ...props }: IOWBoxProps) => {
  const ContainerElement = type == "gradient" ? OWLinearGradientBox : View;
  const stylesType = useStyleType({
    type,
  });
  return (
    <ContainerElement style={[stylesType, style]} {...props}>
      {children}
    </ContainerElement>
  );
};

export default OWBox;
