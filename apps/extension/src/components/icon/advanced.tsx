import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const AdvancedIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 17 18"
      fill="none"
    >
      <path
        d="M8.50004 0.597412L16.9167 4.10408L8.50004 7.61075L0.083374 4.10408L8.50004 0.597412ZM4.41671 4.10408L8.50004 5.80491L12.5834 4.10408L8.50004 2.40241L4.41671 4.10408ZM0.166707 7.31658L8.50004 10.9066L16.8334 7.31658V9.13408L8.83004 12.5791L8.50004 12.7207L8.17087 12.5791L0.166707 9.13491V7.31825V7.31658ZM0.166707 12.3166L8.50004 15.9066L16.8334 12.3166V14.1341L8.83087 17.5791L8.50004 17.7207L8.17087 17.5791L0.166707 14.1349V12.3182V12.3166Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
