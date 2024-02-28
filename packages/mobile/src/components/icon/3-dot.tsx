import React, { FunctionComponent } from "react";
import Svg, { Circle } from "react-native-svg";

export const ThreeDotIcon: FunctionComponent<{
  color?: string;
  size?: number;
  onPress?: () => void;
}> = ({ color = "#AEAEB2", size = 20, onPress }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle
        cx="4"
        cy="12"
        r="2"
        transform="rotate(-90 4 12)"
        fill="#636366"
      />
      <Circle
        cx="12"
        cy="12"
        r="2"
        transform="rotate(-90 12 12)"
        fill="#636366"
      />
      <Circle
        cx="20"
        cy="12"
        r="2"
        transform="rotate(-90 20 12)"
        fill="#636366"
      />
    </Svg>
  );
};
