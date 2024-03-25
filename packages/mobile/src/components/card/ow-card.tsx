import { View, ViewProps, ViewStyle, Image } from "react-native";
import React from "react";
import { metrics } from "@src/themes";
import { useTheme } from "@src/themes/theme-provider";

export interface IOWBoxProps extends ViewProps {
  type?: "normal" | "ink";
}
const useStyleType = ({ type }) => {
  const { colors } = useTheme();
  let styles: ViewStyle = {};
  switch (type) {
    default:
      styles = {
        backgroundColor: colors["neutral-surface-card"],
        width: metrics.screenWidth - 32,
        borderRadius: 24,
        position: "relative",
        padding: 16,
        overflow: "hidden",
        alignSelf: "center",
        marginTop: 2,
      };
      break;
  }
  return styles;
};
const OWCard = ({ children, style, type = "ink", ...props }: IOWBoxProps) => {
  const ContainerElement = View;
  const stylesType = useStyleType({
    type,
  });
  return (
    <ContainerElement style={[stylesType, style]} {...props}>
      {type === "ink" ? (
        <Image
          style={{
            width: metrics.screenWidth - 32,
            height: 260,
            position: "absolute",
          }}
          source={require("../../assets/image/img-bg.png")}
          resizeMode="cover"
          fadeDuration={0}
        />
      ) : null}
      <View>{children}</View>
    </ContainerElement>
  );
};

export default OWCard;
