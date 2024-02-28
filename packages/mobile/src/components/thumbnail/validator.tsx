import { useTheme } from "@src/themes/theme-provider";
import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { spacing } from "../../themes";
import { PersonIcon } from "../icon";

export const ValidatorThumbnail: FunctionComponent<{
  style?: ViewStyle;
  url?: string;
  size: number;
}> = ({ style: propStyle, url, size }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: spacing["6"],
        ...propStyle,
      }}
    >
      {url ? (
        <FastImage
          style={{
            width: size,
            height: size,
          }}
          source={{
            uri: url,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        <PersonIcon size={size} color={colors["primary-text"]} />
      )}
    </View>
  );
};
