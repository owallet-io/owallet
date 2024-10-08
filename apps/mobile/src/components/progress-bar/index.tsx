import { View } from "react-native";
import React, { FunctionComponent } from "react";
import { spacing } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";

export const ProgressBar: FunctionComponent<{
  progress: number;
  styles?: object;
  progressColor?: string;
}> = ({ progress = 0, styles = [], progressColor }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        height: 5,
        backgroundColor: colors["neutral-surface-pressed"],
        borderRadius: spacing["999"],
        overflow: "hidden",
        ...styles,
      }}
    >
      <View
        style={{
          height: 5,
          backgroundColor: progressColor ?? colors["neutral-border-bold"],
          borderRadius: spacing["32"],
          width: `${progress}%`,
        }}
      />
    </View>
  );
};
