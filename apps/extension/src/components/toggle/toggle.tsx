import React, { FunctionComponent } from "react";
import { ToggleProps } from "./types";
import Switch from "react-switch";
import { ColorPalette } from "../../styles";
import { useTheme } from "styled-components";

export const Toggle: FunctionComponent<ToggleProps> = ({
  isOpen,
  setIsOpen,
  disabled,
  height,
  width,
}) => {
  const theme = useTheme();

  return (
    <Switch
      onColor={
        disabled
          ? theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-500"]
          : isOpen
          ? ColorPalette["purple-400"]
          : theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-400"]
      }
      uncheckedIcon={false}
      checkedIcon={false}
      height={height ?? 20}
      width={width ?? 35}
      onChange={() => (setIsOpen && !disabled ? setIsOpen(!isOpen) : null)}
      checked={isOpen}
    />
  );
};
