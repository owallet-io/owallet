import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const WalletIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color = "#292D32", size = 24 }) => {
  return (
    <Svg fill="none" width="24" height="24" viewBox="0 0 24 24">
      <Path
        d="M20.97 16.08C20.73 18.75 18.8 20.5 16 20.5H7C4.24 20.5 2 18.26 2 15.5V8.5C2 5.78 3.64 3.88 6.19 3.56C6.45 3.52 6.72 3.5 7 3.5H16C16.26 3.5 16.51 3.51 16.75 3.55C19.14 3.83 20.76 5.5 20.97 7.92C21 8.21 20.76 8.45 20.47 8.45H18.92C17.96 8.45 17.07 8.82 16.43 9.48C15.67 10.22 15.29 11.26 15.38 12.3C15.54 14.12 17.14 15.55 19.04 15.55H20.47C20.76 15.55 21 15.79 20.97 16.08Z"
        fill={color}
      />
      <Path
        d="M22 10.97V13.03C22 13.58 21.56 14.03 21 14.05H19.04C17.96 14.05 16.97 13.26 16.88 12.18C16.82 11.55 17.06 10.96 17.48 10.55C17.85 10.17 18.36 9.94995 18.92 9.94995H21C21.56 9.96995 22 10.42 22 10.97Z"
        fill={color}
      />
    </Svg>
  );
};

export const WalletOutLineIcon: FunctionComponent<{
  size?: number;
}> = ({ size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.0399 14.7999C17.5299 14.7999 16.2499 13.6799 16.1299 12.2399C16.0499 11.4099 16.3499 10.5999 16.9499 10.0099C17.4499 9.48995 18.1599 9.19995 18.9099 9.19995H20.9999C21.9899 9.22995 22.7499 10.0099 22.7499 10.9699V13.03C22.7499 13.99 21.9899 14.7699 21.0299 14.7999H19.0399ZM20.9699 10.7H18.9199C18.5699 10.7 18.2499 10.8299 18.0199 11.0699C17.7299 11.3499 17.5899 11.7299 17.6299 12.1099C17.6799 12.7699 18.3199 13.2999 19.0399 13.2999H20.9999C21.1299 13.2999 21.2499 13.18 21.2499 13.03V10.9699C21.2499 10.8199 21.1299 10.71 20.9699 10.7Z"
        fill="#292D32"
      />
      <Path
        d="M16 21.25H7C3.56 21.25 1.25 18.94 1.25 15.5V8.5C1.25 5.42 3.14998 3.19001 6.09998 2.82001C6.36998 2.78001 6.68 2.75 7 2.75H16C16.24 2.75 16.55 2.76 16.87 2.81C19.82 3.15 21.75 5.39 21.75 8.5V9.95001C21.75 10.36 21.41 10.7 21 10.7H18.92C18.57 10.7 18.25 10.83 18.02 11.07L18.01 11.08C17.73 11.35 17.6 11.72 17.63 12.1C17.68 12.76 18.32 13.29 19.04 13.29H21C21.41 13.29 21.75 13.63 21.75 14.04V15.49C21.75 18.94 19.44 21.25 16 21.25ZM7 4.25C6.76 4.25 6.52999 4.26999 6.29999 4.29999C4.09999 4.57999 2.75 6.18 2.75 8.5V15.5C2.75 18.08 4.42 19.75 7 19.75H16C18.58 19.75 20.25 18.08 20.25 15.5V14.8H19.04C17.53 14.8 16.25 13.68 16.13 12.24C16.05 11.42 16.35 10.6 16.95 10.02C17.47 9.49002 18.17 9.20001 18.92 9.20001H20.25V8.5C20.25 6.16 18.88 4.54998 16.66 4.28998C16.42 4.24998 16.21 4.25 16 4.25H7Z"
        fill="#292D32"
      />
    </Svg>
  );
};