import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const DownArrowIcon: FunctionComponent<{
  color?: string;
  height?: number;
}> = ({ color = "none", height = 24 }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipRule="evenodd"
      width={height}
      height={height}
      viewBox="0 0 12 12"
      style={{
        height,
        aspectRatio: 8 / 14,
      }}
    >
      <Path
        fill="none"
        fillRule="nonzero"
        stroke={color}
        strokeWidth="2"
        d="M2.03996 4.45499L5.29996 7.71499C5.68496 8.09999 6.31496 8.09999 6.69996 7.71499L9.95996 4.45499"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
        transform="translate(-.139 -.243) scale(1.03469)"
      />
    </Svg>
  );
};
