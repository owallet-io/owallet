import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const QuantityIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color = "#5F5E77", size = 24 }) => {
  return (
    <Svg fill="none" width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.36001 2.46334C8.12769 2.46334 7.93222 2.50449 7.81912 2.55513L7.81725 2.55596L3.88244 4.30328C3.65555 4.40339 3.52984 4.50115 3.46884 4.56816C3.4541 4.58435 3.44438 4.59718 3.43809 4.60667C3.44438 4.61616 3.4541 4.62899 3.46884 4.64519C3.52984 4.71219 3.65555 4.80996 3.88244 4.91006L3.88391 4.91071L7.81912 6.65821C7.93222 6.70886 8.12769 6.75 8.36001 6.75C8.59234 6.75 8.7878 6.70886 8.9009 6.65821L8.90278 6.65738L12.8361 4.91071L12.8376 4.91006C13.0645 4.80996 13.1902 4.71219 13.2512 4.64519C13.2659 4.62899 13.2756 4.61616 13.2819 4.60667C13.2756 4.59718 13.2659 4.58435 13.2512 4.56816C13.1902 4.50115 13.0645 4.40338 12.8376 4.30328L12.8361 4.30263L8.90278 2.55596L8.9009 2.55513C8.7878 2.50449 8.59234 2.46334 8.36001 2.46334ZM9.44476 1.33776C9.11142 1.18874 8.71732 1.13 8.36001 1.13C8.00273 1.13 7.60866 1.18873 7.27532 1.33773C7.27496 1.33789 7.2746 1.33805 7.27424 1.33822L3.34425 3.08339C3.34452 3.08328 3.34399 3.08351 3.34425 3.08339C2.7109 3.36301 2.09668 3.86229 2.09668 4.60667C2.09668 5.35105 2.7101 5.84998 3.34345 6.1296C3.34318 6.12948 3.34372 6.12971 3.34345 6.1296L7.27424 7.87513C7.27458 7.87528 7.27491 7.87543 7.27525 7.87558C7.6086 8.0246 8.0027 8.08334 8.36001 8.08334C8.71733 8.08334 9.11142 8.0246 9.44477 7.87558C9.44511 7.87543 9.44545 7.87528 9.44579 7.87513L13.3758 6.12995C13.3755 6.13005 13.376 6.12985 13.3758 6.12995C14.0092 5.85034 14.6233 5.35109 14.6233 4.60667C14.6233 3.86226 14.0099 3.36331 13.3765 3.0837C13.3767 3.08381 13.3762 3.0836 13.3765 3.0837L9.44579 1.33822C9.44545 1.33806 9.44511 1.33791 9.44476 1.33776Z"
        fill={color}
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2.49967 6.66667C2.86786 6.66667 3.16634 6.96515 3.16634 7.33334C3.16634 7.45635 3.21693 7.63358 3.33264 7.81143C3.44835 7.98926 3.58973 8.10711 3.7023 8.15681L3.70393 8.15754L3.70393 8.15754L8.22935 10.1703C8.22953 10.1704 8.22972 10.1705 8.22991 10.1706C8.40637 10.2484 8.6017 10.2462 8.7656 10.1723L8.76875 10.1709L8.76875 10.1709L13.2954 8.15754L13.2971 8.15681C13.4096 8.10711 13.551 7.98926 13.6667 7.81143C13.7824 7.63358 13.833 7.45635 13.833 7.33334C13.833 6.96515 14.1315 6.66667 14.4997 6.66667C14.8679 6.66667 15.1663 6.96515 15.1663 7.33334C15.1663 7.77032 15.0069 8.19643 14.7843 8.53858C14.5619 8.88049 14.2369 9.19908 13.8365 9.37613C13.8362 9.37626 13.8359 9.3764 13.8356 9.37653L9.31375 11.3877C9.31316 11.388 9.31257 11.3883 9.31198 11.3885C8.79647 11.6204 8.20614 11.618 7.69 11.3897L7.68875 11.3891L3.16372 9.37653C3.16341 9.37639 3.1631 9.37626 3.1628 9.37612C2.76245 9.19908 2.4375 8.88048 2.21504 8.53858C1.99242 8.19643 1.83301 7.77032 1.83301 7.33334C1.83301 6.96515 2.13148 6.66667 2.49967 6.66667Z"
        fill={color}
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2.49967 10C2.86786 10 3.16634 10.2985 3.16634 10.6667C3.16634 11.0207 3.37563 11.3439 3.7046 11.4912C3.70476 11.4912 3.70443 11.4911 3.7046 11.4912L8.22935 13.5036C8.22951 13.5037 8.22918 13.5036 8.22935 13.5036C8.40582 13.5815 8.60169 13.5795 8.7656 13.5056L8.76875 13.5042L13.2943 11.4914C13.2944 11.4913 13.2941 11.4915 13.2943 11.4914C13.6232 11.3441 13.833 11.0207 13.833 10.6667C13.833 10.2985 14.1315 10 14.4997 10C14.8679 10 15.1663 10.2985 15.1663 10.6667C15.1663 11.5525 14.6425 12.3491 13.8384 12.7086L13.8373 12.7091L9.31375 14.7211C9.31316 14.7213 9.31257 14.7216 9.31198 14.7219C8.79647 14.9537 8.20614 14.9513 7.69 14.723L3.16092 12.7086C2.35684 12.3491 1.83301 11.5525 1.83301 10.6667C1.83301 10.2985 2.13148 10 2.49967 10Z"
        fill={color}
      />
    </Svg>
  );
};

export const QuantityOutLineIcon: FunctionComponent<{
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