import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const BuyIcon: FunctionComponent<{
  width?: number | string;
  height?: number | string;
}> = ({ width = 24, height = 24 }) => {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 20 20">
      <Path
        d="M16.5 6.375C16.5 9.0675 14.3175 11.25 11.625 11.25C11.4975 11.25 11.3625 11.2425 11.235 11.235C11.0475 8.85751 9.14249 6.95249 6.76499 6.76499C6.75749 6.63749 6.75 6.5025 6.75 6.375C6.75 3.6825 8.9325 1.5 11.625 1.5C14.3175 1.5 16.5 3.6825 16.5 6.375Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M11.25 11.625C11.25 14.3175 9.0675 16.5 6.375 16.5C3.6825 16.5 1.5 14.3175 1.5 11.625C1.5 8.9325 3.6825 6.75 6.375 6.75C6.5025 6.75 6.63749 6.75749 6.76499 6.76499C9.14249 6.95249 11.0475 8.85751 11.235 11.235C11.2425 11.3625 11.25 11.4975 11.25 11.625Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M6.375 9.83688L6.375 13.4131"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <Path
        d="M8.16309 11.625H4.58687"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </Svg>
  );
};

export const DepositIcon: FunctionComponent<{
  width?: number | string;
  height?: number | string;
}> = ({ width = 24, height = 24 }) => {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 20 20">
      <Path
        d="M6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V6.75C16.5 3 15 1.5 11.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M7.9425 10.005H11.1225V6.82501"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M11.1225 10.005L6.8775 5.76001"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M4.5 12.3825C7.4175 13.3575 10.5825 13.3575 13.5 12.3825"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export const SendDashboardIcon: FunctionComponent<{
  width?: number | string;
  height?: number | string;
}> = ({ width = 24, height = 24 }) => {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 20 20">
      <Path
        d="M6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V6.75C16.5 3 15 1.5 11.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M7.9425 5.76001H11.1225V8.94751"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M11.1225 5.76001L6.8775 10.005"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M4.5 12.3825C7.4175 13.3575 10.5825 13.3575 13.5 12.3825"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};
