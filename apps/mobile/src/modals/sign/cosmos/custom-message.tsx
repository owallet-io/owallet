import React, { FunctionComponent, PropsWithChildren } from "react";
import { Image, Text } from "react-native";
import { useStyle } from "@src/styles";
import images from "@assets/images";
import OWText from "@components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";

export const CustomIcon: FunctionComponent = () => {
  return (
    <Image
      style={{ width: 48, height: 48 }}
      source={images.carbon_notification}
    />
  );
};

export const UnknownMessageContent: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const style = useStyle();
  const { colors } = useTheme();
  return (
    <OWText
      style={{
        ...style.flatten(["body3"]),
        color: colors["neutral-text-body"],
      }}
    >
      {children}
    </OWText>
  );
};
