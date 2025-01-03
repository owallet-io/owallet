import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const ManageListIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
    >
      <path
        d="M2.99996 5.00325H2.16663V3.33325H3.83663V5.00325H2.99996ZM2.99996 10.8366H2.16663V9.16658H3.83663V10.8366H2.99996ZM2.16663 16.6699H3.83663V14.9999H2.16663V16.6699ZM7.16663 3.33325H6.33329V4.99992H18.8333V3.33325H7.16663ZM6.33329 9.16658H18.8333V10.8333H6.33329V9.16658ZM7.16663 14.9999H6.33329V16.6666H18.8333V14.9999H7.16663Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
