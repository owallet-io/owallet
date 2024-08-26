import {
  DarkModeColorsTheme,
  LightModeColorsTheme,
  colorsCode,
} from "./mode-colors";

export const colors = {
  ...colorsCode,
  ...DarkModeColorsTheme,
};

export const lightColors = {
  ...colorsCode,
  ...LightModeColorsTheme,
};
