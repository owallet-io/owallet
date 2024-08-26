import React, { FunctionComponent } from "react";
import Svg, { Path, Rect } from "react-native-svg";

export const TabIcon: FunctionComponent<{
  color: string;
  size: number;
  onPress?: () => void;
}> = ({ color, size, onPress }) => {
  return (
    <Svg
      onPress={onPress}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Rect
        x="2.75"
        y="2.75"
        width="18.5"
        height="18.5"
        rx="3.25"
        stroke={color}
        stroke-width="1.5"
      />
    </Svg>
  );
};
