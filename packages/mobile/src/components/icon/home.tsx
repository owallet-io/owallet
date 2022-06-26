import React, { FunctionComponent } from 'react';
import Svg, { Path } from 'react-native-svg';

export const HomeIcon: FunctionComponent<{
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
      <Path
        d="M9.02 2.83999L3.63 7.03999C2.73 7.73999 2 9.22999 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.28999 21.19 7.73999 20.2 7.04999L14.02 2.71999C12.62 1.73999 10.37 1.78999 9.02 2.83999Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M12 17.99V14.99"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export const HomeFillIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color = 'none', size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M20.04 6.82L14.28 2.79C12.71 1.69 10.3 1.75 8.79 2.92L3.78 6.83C2.78 7.61 1.99 9.21 1.99 10.47V17.37C1.99 19.92 4.06 22 6.61 22H17.39C19.94 22 22.01 19.93 22.01 17.38V10.6C22.01 9.25 21.14 7.59 20.04 6.82ZM12.75 18C12.75 18.41 12.41 18.75 12 18.75C11.59 18.75 11.25 18.41 11.25 18V15C11.25 14.59 11.59 14.25 12 14.25C12.41 14.25 12.75 14.59 12.75 15V18Z"
        fill="#1C1B4B"
      />
    </Svg>
  );
};

export const HomeOutlineIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color = 'none', size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M9.02 2.83999L3.63 7.03999C2.73 7.73999 2 9.22999 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.28999 21.19 7.73999 20.2 7.04999L14.02 2.71999C12.62 1.73999 10.37 1.78999 9.02 2.83999Z"
        stroke="#5F5E77"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M12 17.99V14.99"
        stroke="#5F5E77"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};
