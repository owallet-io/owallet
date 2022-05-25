import { StyleSheet, View } from "react-native";
import React, { FunctionComponent } from "react";
import { useStyle } from "../../styles";

export const ProgressBar: FunctionComponent<{
  progress: number;
  styles: Array<string>;
}> = ({ progress = 0, styles = [] }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "height-12",
        "background-color-secondary-500",
        "border-radius-32",
        "overflow-hidden",
        ...styles,
      ])}
    >
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "height-12",
            "background-color-primary",
            "border-radius-32",
          ]),
          {
            width: `${progress}%`,
          },
        ])}
      />
    </View>
  );
};
