import React, { FunctionComponent } from "react";

import style from "./style.module.scss";

export const Text: FunctionComponent<{ color; size; weight }> = ({
  color,
  size,
  weight,
  ...props
}) => {
  const textStyle = {
    fontSize: size ?? null,
    fontWeight: weight ?? null,
    color: color ?? null,
  };

  return (
    <div>
      <p className={style.text} style={{ ...textStyle }}>
        {props.children}
      </p>
    </div>
  );
};
