import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import { spacing } from "../../themes";

export const CardBody: FunctionComponent<{
  style?: ViewStyle;
}> = ({ children, ...props }) => {
  return (
    <View
      style={[
        {
          paddingHorizontal: spacing["card-horizontal"],
          paddingVertical: spacing["card-vertical"],
        },
        props.style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
