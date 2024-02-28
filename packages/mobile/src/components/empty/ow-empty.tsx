import { View, StyleSheet, ViewProps } from "react-native";
import React from "react";
import FastImage from "react-native-fast-image";
import images from "@src/assets/images";
import { Text } from "../text";
import { useTheme } from "@src/themes/theme-provider";
interface IOWEmpty extends ViewProps {
  style?: ViewProps["style"];
  type?: "list" | "crash";
  label?: string;
  sizeImage?: number;
}
const OWEmpty = ({
  style,
  sizeImage = 142,
  type = "list",
  ...props
}: IOWEmpty) => {
  const { label = type == "list" ? "No result found" : "Not found data" } =
    props;
  const { colors, images } = useTheme();
  return (
    <View style={[styles.container, style]} {...props}>
      <FastImage
        source={type === "crash" ? images.crash_empty : images.list_empty}
        style={{
          width: sizeImage,
          height: sizeImage,
        }}
        resizeMode={"contain"}
      />
      <Text
        color={colors["blue-300"]}
        style={styles.textStyle}
        variant="body1"
        typo="regular"
      >
        {label}
      </Text>
    </View>
  );
};

export default OWEmpty;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  textStyle: {
    paddingTop: 8,
    textAlign: "center",
  },
  stylesImage: {
    width: 142,
    height: 142,
  },
});
