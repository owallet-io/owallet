import React from "react";
//@ts-ignore
import IcoMoon, { IconProps } from "react-icomoon";
import iconSet from "./selection.json";
import { icons } from "./icons";
type iconTypes = (typeof icons)[number];
export interface IconProps extends Omit<IconProps, "iconSet" | "icon"> {
  icon?: iconTypes;
}

export const OWIcon = ({ icon, ...restProps }: IconProps) => (
  <IcoMoon iconSet={iconSet} icon={icon} {...restProps} />
);
