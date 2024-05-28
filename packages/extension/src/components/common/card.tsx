import React, { FunctionComponent, CSSProperties } from "react";

import style from "./style.module.scss";

export const Card: FunctionComponent<{
  type?: string;
  containerStyle?: CSSProperties;
}> = ({ type = "normal", containerStyle, ...props }) => {
  return (
    <div
      className={(style.card, type === "ink" ? style.bg : null)}
      style={containerStyle}
    >
      <div>
        <img />
      </div>
      {props.children}
    </div>
  );
};
