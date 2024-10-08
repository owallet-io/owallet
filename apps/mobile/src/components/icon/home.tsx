import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

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
}> = ({ color = "none", size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M20.04 6.82L14.28 2.79C12.71 1.69 10.3 1.75 8.79 2.92L3.78 6.83C2.78 7.61 1.99 9.21 1.99 10.47V17.37C1.99 19.92 4.06 22 6.61 22H17.39C19.94 22 22.01 19.93 22.01 17.38V10.6C22.01 9.25 21.14 7.59 20.04 6.82ZM12.75 18C12.75 18.41 12.41 18.75 12 18.75C11.59 18.75 11.25 18.41 11.25 18V15C11.25 14.59 11.59 14.25 12 14.25C12.41 14.25 12.75 14.59 12.75 15V18Z"
        fill={color ?? "#1C1B4B"}
      />
    </Svg>
  );
};

export const HomeOutlineIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color = "none", size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M9.02 2.83999L3.63 7.03999C2.73 7.73999 2 9.22999 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.28999 21.19 7.73999 20.2 7.04999L14.02 2.71999C12.62 1.73999 10.37 1.78999 9.02 2.83999Z"
        stroke={color ?? "#5F5E77"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M12 17.99V14.99"
        stroke={color ?? "#5F5E77"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

// export const AddIcon: FunctionComponent<{
//   color?: string;
//   size?: number;
//   onPress?: () => void;
// }> = ({ color = 'none', size = 24 , onPress }) => {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} onPress={onPress}>
//       <Path
//         fill-rule="evenodd"
//         clip-rule="evenodd"
//         d="M0.583252 8.00004C0.583252 3.91916 3.91904 0.583374 7.99992 0.583374C12.0808 0.583374 15.4166 3.91916 15.4166 8.00004C15.4166 12.0809 12.0808 15.4167 7.99992 15.4167C3.91904 15.4167 0.583252 12.0809 0.583252 8.00004ZM7.99992 2.08337C4.74747 2.08337 2.08325 4.74759 2.08325 8.00004C2.08325 11.2525 4.74747 13.9167 7.99992 13.9167C11.2524 13.9167 13.9166 11.2525 13.9166 8.00004C13.9166 4.74759 11.2524 2.08337 7.99992 2.08337ZM4.58325 8.00003C4.58325 7.58582 4.91904 7.25003 5.33325 7.25003H7.24991V5.33337C7.24991 4.91916 7.58569 4.58337 7.99991 4.58337C8.41412 4.58337 8.74991 4.91916 8.74991 5.33337V7.25003H10.6666C11.0808 7.25003 11.4166 7.58582 11.4166 8.00003C11.4166 8.41424 11.0808 8.75003 10.6666 8.75003H8.74991V10.6667C8.74991 11.0809 8.41412 11.4167 7.99991 11.4167C7.58569 11.4167 7.24991 11.0809 7.24991 10.6667V8.75003H5.33325C4.91904 8.75003 4.58325 8.41424 4.58325 8.00003Z"
//         fill="#5F5E77"
//       />
//     </Svg>
//   );
// };
