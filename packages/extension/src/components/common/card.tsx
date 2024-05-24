import React, { FunctionComponent, CSSProperties } from "react";

import style from "./style.module.scss";

export const Card: FunctionComponent<{
  type: string;
  containerStyle?: CSSProperties;
}> = ({ type, containerStyle, ...props }) => {
  return (
    <div className={style.card} style={containerStyle}>
      {props.children}
    </div>
  );
};
