import React, { FunctionComponent, CSSProperties } from "react";

export const RadioButton: FunctionComponent<{
  checked: boolean;
  onChange: (e?) => void;
  containerStyle?: CSSProperties;
}> = ({ checked, onChange, containerStyle, ...props }) => {
  return (
    <div style={containerStyle}>
      {checked ? (
        <img src={require("assets/icon/radio.svg")} />
      ) : (
        <img src={require("assets/icon/radio-uncheck.svg")} />
      )}
    </div>
  );
};
