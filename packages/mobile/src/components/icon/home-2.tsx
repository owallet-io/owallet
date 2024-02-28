import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const HomeLightIcon: FunctionComponent<{
  color?: string;
  size?: number;
  onPress?: () => void;
}> = ({ color = "#636366", size = 20, onPress }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.5 10.9998V9.49977C20.5 8.34869 19.9405 7.65617 19 6.99977L13 2.4998C11.67 1.56752 10.2825 1.5009 9 2.49977L3.5 6.99977C2.645 7.66568 2 8.4248 2 9.49977V17.9998C2 20.2068 2.796 20.9998 5 20.9998H8.5C9.05228 20.9998 9.5 20.5521 9.5 19.9998V14.9998C9.5 14.4475 9.94772 13.9998 10.5 13.9998H11"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M17.5001 22.0827C20.0314 22.0827 22.0834 20.0307 22.0834 17.4993C22.0834 14.968 20.0314 12.916 17.5001 12.916C14.9688 12.916 12.9167 14.968 12.9167 17.4993C12.9167 20.0307 14.9688 22.0827 17.5001 22.0827Z"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M15.6666 13.375H16.1249C15.2312 16.0517 15.2312 18.9483 16.1249 21.625H15.6666"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M18.875 13.375C19.7687 16.0517 19.7687 18.9483 18.875 21.625"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M13.375 19.3333V18.875C16.0517 19.7687 18.9483 19.7687 21.625 18.875V19.3333"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M13.375 16.1254C16.0517 15.2316 18.9483 15.2316 21.625 16.1254"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};
