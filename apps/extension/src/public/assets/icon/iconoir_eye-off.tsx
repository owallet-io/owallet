import React from "react";

export const EyeIconComponent = ({ color = "#979995", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 3L21 21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 10.677C10.1631 11.0585 9.98426 11.5541 10 12.0629C10.0158 12.5716 10.2249 13.0552 10.5849 13.4151C10.9448 13.7751 11.4284 13.9842 11.9371 14C12.4459 14.0157 12.9415 13.8369 13.323 13.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.362 7.561C5.68 8.74 4.279 10.42 3 12C4.889 14.991 8.282 18 12 18C13.55 18 15.043 17.477 16.395 16.65"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 6C16.008 6 18.701 9.158 21 12C20.6705 12.5208 20.3105 13.0216 19.922 13.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default EyeIconComponent;
