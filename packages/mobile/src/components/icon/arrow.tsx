import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const RightArrowIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipRule="evenodd"
      viewBox="0 0 8 14"
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
        d="M1.188 1.375L6.813 7l-5.625 5.625"
        transform="translate(-.139 -.243) scale(1.03469)"
      />
    </Svg>
  );
};

export const DoubleRightArrowIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      viewBox="0 0 18 19"
      style={{
        height,
        aspectRatio: 18 / 19,
      }}
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8.833 1.833l7.875 7.875-7.875 7.875"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1.833 1.833l7.875 7.875-7.875 7.875"
      />
    </Svg>
  );
};

export const LeftArrowIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color = 'none', size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M9.57 5.92999L3.5 12L9.57 18.07"
        stroke="#5F5E77"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M20.4999 12H3.66992"
        stroke="#5F5E77"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};
