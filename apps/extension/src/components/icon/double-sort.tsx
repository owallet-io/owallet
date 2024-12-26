import React, { FunctionComponent } from "react";
import { IconProps } from "./types";

export const DoubleSortIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
  color,
}) => {
  return (
    <svg
      width={width ?? "20"}
      height={height ?? "20"}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 15.9244L5.875 11.7994L7.05417 10.6211L10.0008 13.5669L12.9467 10.6211L14.125 11.7994L10 15.9244Z"
        fill={color ?? "#83838A"}
      />
      <path
        d="M10 4.06971L14.125 8.19471L12.9458 9.37305L9.99917 6.42721L7.05333 9.37305L5.875 8.19471L10 4.06971Z"
        fill={color ?? "#83838A"}
      />
    </svg>
  );
};
