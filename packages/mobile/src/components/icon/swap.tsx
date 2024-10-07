import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const SwapIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color = "#C7C7CC", size = 24 }) => {
  return (
    <Svg width="20" height="15" viewBox="0 0 20 15" fill="none">
      <Path
        d="M15.65 0.349264L12.86 3.13926C12.54 3.45926 12.76 3.99926 13.21 3.99926H15V10.8793C15 11.8793 14.33 12.8093 13.34 12.9693C12.09 13.1793 11 12.2093 11 10.9993V4.16926C11 2.07926 9.47003 0.219264 7.39003 0.0192644C6.83453 -0.0354655 6.27373 0.0267332 5.74372 0.201856C5.21372 0.376978 4.72625 0.661144 4.31272 1.03606C3.89918 1.41097 3.56873 1.86833 3.34265 2.37868C3.11656 2.88904 2.99985 3.44108 3.00003 3.99926V10.9993H1.21003C0.760031 10.9993 0.54003 11.5393 0.86003 11.8493L3.65003 14.6393C3.85003 14.8393 4.16003 14.8393 4.36003 14.6393L7.15003 11.8493C7.21913 11.7788 7.26582 11.6894 7.28421 11.5924C7.30261 11.4954 7.29187 11.3952 7.25338 11.3043C7.21488 11.2134 7.15033 11.1359 7.06788 11.0816C6.98542 11.0273 6.88874 10.9987 6.79003 10.9993H5.00003V4.11926C5.00003 3.11926 5.67003 2.18926 6.66003 2.02926C7.91003 1.81926 9.00003 2.78926 9.00003 3.99926V10.8293C9.00003 12.9193 10.53 14.7793 12.61 14.9793C14.99 15.2093 17 13.3393 17 10.9993V3.99926H18.79C19.24 3.99926 19.46 3.45926 19.14 3.14926L16.35 0.359265C16.16 0.159265 15.84 0.159264 15.65 0.349264Z"
        fill={color}
      />
    </Svg>
  );
};