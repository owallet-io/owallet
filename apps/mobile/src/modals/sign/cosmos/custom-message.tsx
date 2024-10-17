import React, { FunctionComponent, PropsWithChildren } from "react";
import { Image, Text } from "react-native";
import { useStyle } from "@src/styles";
import images from "@assets/images";

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

  return (
    <Text style={style.flatten(["body3", "color-text-middle"])}>
      {children}
    </Text>
  );
};
