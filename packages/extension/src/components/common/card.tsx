import React, { FunctionComponent, CSSProperties } from "react";

import style from "./style.module.scss";

export const Card: FunctionComponent<{
  type?: string;
  containerStyle?: CSSProperties;
}> = ({ type = "normal", containerStyle, ...props }) => {
  return (
    <div
      id="card"
      className={(style.card, type === "ink" ? style.bg : null)}
      style={containerStyle}
    >
      {props.children}
    </div>
  );
};
