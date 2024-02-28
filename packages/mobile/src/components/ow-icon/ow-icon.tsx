import React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import Icon, { IconProps } from "./icomoon";
export interface IOWIconProps extends IconProps {
  type?: "images";
  source?: ImageSourcePropType;
}
const OWIcon = ({ type, ...props }: IOWIconProps) => {
  if (type == "images")
    return (
      <Image
        style={{
          width: props.size,
          height: props.size,
          tintColor: props.color,
        }}
        source={props.source}
        resizeMode="contain"
      />
    );
  return <Icon {...props} />;
};

export default OWIcon;

const styles = StyleSheet.create({});
