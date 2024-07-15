import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../../styles";

export const HeaderBackButtonIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color, size = 28 }) => {
  const style = useStyle();

  if (!color) {
    color = style.get("color-text-black-low").color;
  }

  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.344 21.875L5.469 14l7.875-7.875M6.563 14H22.53"
      />
    </Svg>
  );
};

export const HeaderBackDownButtonIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color, size = 28 }) => {
  const style = useStyle();

  if (!color) {
    color = style.get("color-text-black-low").color;
  }

  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <path
        d="M18.0703 14.43L12.0003 20.5L5.93031 14.43"
        stroke="#8C93A7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.50008L12 20.3301"
        stroke="#8C93A7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
