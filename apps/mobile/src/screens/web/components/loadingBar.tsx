import React, { FC } from "react";
import { View, StyleSheet } from "react-native";

export const LoadingBar: FC<{
  color: string;
  percent: number;
  height: number;
}> = ({ color, percent, height }) => {
  const style = {
    backgroundColor: color,
    width: `${percent * 100}%`,
    height,
  };
  return <View style={[styles.container, style as any]} />;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 100,
    top: 0,
    left: 0,
  },
});
