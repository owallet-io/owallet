import { StyleSheet, Text, View, TouchableOpacityProps } from "react-native";
import React from "react";
import OWButton, { IOWButtonProps } from "./OWButton";
import OWIcon, { IOWIconProps } from "../ow-icon/ow-icon";
import { IconProps } from "../ow-icon/icomoon";
interface IOWButtonIcon extends IOWButtonProps {
  typeIcon?: IOWIconProps["type"];
  source?: IOWIconProps["source"];
  name?: IconProps["name"];
  sizeIcon?: IconProps["size"];
  colorIcon?: IconProps["color"];
}
const OWButtonIcon = ({ ...props }: IOWButtonIcon) => {
  return (
    <OWButton
      type="link"
      {...props}
      icon={
        <OWIcon
          type={props.typeIcon}
          source={props.source}
          name={props.name}
          color={props.colorIcon}
          size={props.sizeIcon}
        />
      }
    />
  );
};

export default OWButtonIcon;

const styles = StyleSheet.create({});
