import React, { FunctionComponent } from "react";
import Svg, { Rect, Path } from "react-native-svg";
import OWIcon from "../ow-icon/ow-icon";
import { colors } from "@src/themes";
import { View } from "react-native";

export const CheckIcon: FunctionComponent<{
  width?: number | string;
  height?: number | string;
  color?: string;
}> = ({ width = 16, height = 16, color = "#2DCE89" }) => {
  return (
    <View
      style={{
        backgroundColor: color,
        width,
        height,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <OWIcon name="check_stroke" color={colors["white"]} size={10} />
    </View>
  );
};
