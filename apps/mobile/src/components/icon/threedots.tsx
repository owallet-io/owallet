import React, { FunctionComponent } from "react";
import Svg, { Circle } from "react-native-svg";

export const ThreeDotsIcon: FunctionComponent<{
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
      <Circle cx="12" cy="4" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="20" r="2" fill={color} />
    </Svg>
  );
};

export const DotsIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color = "none", size = 9 }) => {
  return (
    <Svg width={size} height={size - 1} viewBox="0 0 9 8" fill={color}>
      <Circle cx="4.5" cy="4" r="4" fill="#945EF8" />
    </Svg>
  );
};
