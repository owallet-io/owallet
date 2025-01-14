import { View, StyleSheet, ViewProps } from "react-native";
import React from "react";
import FastImage from "react-native-fast-image";
import { Text } from "../text";
import { useTheme } from "@src/themes/theme-provider";
import globalImages from "@assets/images";
import { eventTheme } from "@utils/helper";
import { imagesNoel } from "@assets/images/noels";
import images from "@assets/images";
interface IOWEmpty extends ViewProps {
  style?: ViewProps["style"];
  type?: "list" | "crash" | "cash" | "nft";
  label?: string;
  sizeImage?: number;
}

const OWEmpty = ({
  style,
  sizeImage = 160,
  type = "list",
  ...props
}: IOWEmpty) => {
  const { label = type == "list" ? "No result found" : "Not found data" } =
    props;
  const { colors, images } = useTheme();
  const imgList = {
    list:
      eventTheme === "noel" ? imagesNoel.img_planet : globalImages.img_planet,
    crash: images.crash_empty,
    cash: eventTheme === "noel" ? imagesNoel.img_money : images.money_empty,
    nft: eventTheme === "noel" ? imagesNoel.img_color : globalImages.img_color,
  };

  return (
    <View
      style={[
        styles.container,
        style,
        { backgroundColor: colors["neutral-surface-card"] },
      ]}
      {...props}
    >
      <FastImage
        source={imgList[type]}
        style={{
          width: sizeImage,
          height: sizeImage,
        }}
        resizeMode={"contain"}
      />
      <Text
        color={colors["neutral-text-title"]}
        style={styles.textStyle}
        size={16}
        weight="700"
      >
        {label.toUpperCase()}
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
