import React from "react";
import Icomoon from "react-native-icomoon";
import type { IconMoonProps } from "react-native-icomoon";
import json from "../../assets/selection.json";

export interface IconProps extends Omit<IconMoonProps, "iconSet" | "name"> {
  name?: IconMoonProps["name"];
}

export default function Icon({ name, ...restProps }: IconProps) {
  return <Icomoon iconSet={json} name={name} {...restProps} />;
}
