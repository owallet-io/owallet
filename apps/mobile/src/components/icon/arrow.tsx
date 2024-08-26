import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export interface IconProps {
  size?: number;
  color?: string;
}

export const RightArrowIcon: FunctionComponent<
  IconProps & {
    height: number;
    type?: string;
    onPress?: () => void;
  }
> = ({ color, height, type, onPress }) => {
  let transfromCss =
    type === "left" ? { transform: [{ rotate: "180deg" }] } : {};
  return (
    <Svg
      onPress={onPress}
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipRule="evenodd"
      viewBox="0 0 8 14"
      style={{
        height,
        aspectRatio: 8 / 14,
        ...transfromCss,
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

export const DoubleRightArrowIcon: FunctionComponent<
  IconProps & { height: number }
> = ({ color, height }) => {
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

export const LeftArrowIcon: FunctionComponent<IconProps> = ({
  color = "#5F5E77",
  size = 24,
}) => {
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

export const ArrowOpsiteUpDownIcon: FunctionComponent<IconProps> = ({
  size = 24,
  color = "#1C1B4B",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M11.0462 6.6665C10.9731 6.6665 10.9 6.63393 10.8424 6.56412L8.33491 3.5298C8.15031 3.30641 7.85034 3.30641 7.66574 3.5298L5.15829 6.56412C5.04676 6.69908 4.86217 6.69908 4.75064 6.56412C4.63911 6.42916 4.63911 6.20577 4.75064 6.07081L7.25809 3.03649C7.66574 2.54318 8.33106 2.54318 8.74256 3.03649L11.25 6.07081C11.3615 6.20577 11.3615 6.42916 11.25 6.56412C11.1923 6.62927 11.1193 6.6665 11.0462 6.6665Z"
        fill={color}
      />
      <Path
        d="M4.95479 9.33301C5.02786 9.33301 5.10093 9.36559 5.15862 9.43539L7.66607 12.4697C7.85067 12.6931 8.15064 12.6931 8.33523 12.4697L10.8427 9.43539C10.9542 9.30043 11.1388 9.30043 11.2503 9.43539C11.3619 9.57036 11.3619 9.79374 11.2503 9.9287L8.74289 12.963C8.33523 13.4563 7.66991 13.4563 7.25841 12.963L4.75096 9.9287C4.63944 9.79374 4.63944 9.57036 4.75096 9.43539C4.80865 9.37024 4.88172 9.33301 4.95479 9.33301Z"
        fill={color}
      />
    </Svg>
  );
};

export const RightLightIcon: FunctionComponent<IconProps> = ({
  size = 24,
  color = "#5F5E77",
}) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.90991 19.9201L15.4299 13.4001C16.1999 12.6301 16.1999 11.3701 15.4299 10.6001L8.90991 4.08008"
        stroke={color}
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export const LeftLightIcon: FunctionComponent<IconProps> = ({
  size = 24,
  color = "#5F5E77",
}) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.0901 19.9201L8.57009 13.4001C7.80009 12.6301 7.80009 11.3701 8.57009 10.6001L15.0901 4.08008"
        stroke={color}
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};
