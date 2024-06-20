import { useTheme } from "@src/themes/theme-provider";
import { View } from "react-native";
import FastImage from "react-native-fast-image";
import OWText from "@src/components/text/ow-text";
import React from "react";

export const EmptyTx = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 42,
        marginBottom: 0,
      }}
    >
      <FastImage
        source={require("@src/assets/image/img_empty.png")}
        style={{
          width: 150,
          height: 150,
        }}
        resizeMode={"contain"}
      />
      <OWText color={colors["neutral-text-title"]} size={16} weight="700">
        {"NO TRANSACTIONS YET".toUpperCase()}
      </OWText>
    </View>
  );
};
