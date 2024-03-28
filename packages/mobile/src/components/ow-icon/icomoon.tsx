import React from "react";
import Icomoon from "react-native-icomoon";
import type { IconMoonProps } from "react-native-icomoon";
import json from "../../assets/selection.json";
import { icons } from "./icons";
// import {iconList} from 'react-icomoon';
// @ts-ignore
// const icons = iconList(json) as const;
// const data = icons as const
type iconTypes = (typeof icons)[number];

export interface IconProps extends Omit<IconMoonProps, "iconSet" | "name"> {
  name: iconTypes;
}

export default function Icon({ name, ...restProps }: IconProps) {
  return <Icomoon iconSet={json} name={name} {...restProps} />;
}
