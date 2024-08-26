import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const AddIcon: FunctionComponent<{
  color: string;
  size: number;
  onPress?: () => void;
}> = ({ color, size = 24, onPress }) => {
  return (
    <Svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      style={{
        width: size,
        height: size,
      }}
    >
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.15625 8.5C0.15625 3.90901 3.90901 0.15625 8.5 0.15625C13.091 0.15625 16.8437 3.90901 16.8437 8.5C16.8437 13.091 13.091 16.8437 8.5 16.8437C3.90901 16.8437 0.15625 13.091 0.15625 8.5ZM8.5 1.84375C4.84099 1.84375 1.84375 4.84099 1.84375 8.5C1.84375 12.159 4.84099 15.1562 8.5 15.1562C12.159 15.1562 15.1562 12.159 15.1562 8.5C15.1562 4.84099 12.159 1.84375 8.5 1.84375Z"
        fill={color}
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.65625 8.49998C4.65625 8.03399 5.03401 7.65623 5.5 7.65623H11.5C11.966 7.65623 12.3438 8.03399 12.3438 8.49998C12.3438 8.96598 11.966 9.34373 11.5 9.34373H5.5C5.03401 9.34373 4.65625 8.96598 4.65625 8.49998Z"
        fill={color}
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.5 4.65625C8.96599 4.65625 9.34375 5.03401 9.34375 5.5V11.5C9.34375 11.966 8.96599 12.3438 8.5 12.3438C8.03401 12.3438 7.65625 11.966 7.65625 11.5V5.5C7.65625 5.03401 8.03401 4.65625 8.5 4.65625Z"
        fill={color}
      />
    </Svg>
  );
};
