import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import { colors, metrics } from "../../themes";

export const Card: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style: propStyle, children }) => {
  return (
    <View
      style={{
        width: metrics.screenWidth,
        backgroundColor: colors["card"],
        overflow: "hidden",
        ...propStyle,
      }}
    >
      {children}
    </View>
  );
};
