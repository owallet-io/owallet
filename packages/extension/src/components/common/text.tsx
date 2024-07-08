import React, { CSSProperties, FunctionComponent } from "react";
import style from "./style.module.scss";

export const Text: FunctionComponent<{
  color?: string;
  size?: number;
  weight?: string;
  containerStyle?: CSSProperties;
}> = ({ color, size, weight, containerStyle, ...props }) => {
  const textStyle = {
    fontSize: size ?? 14,
    fontWeight: weight ?? 300,
    color: color ?? null,
  };

  return (
    <span
      className={style.text}
      style={{ ...textStyle, ...containerStyle }}
      {...props}
    >
      {props.children}
    </span>
  );
};
