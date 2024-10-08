import {
  DarkModeColorsTheme,
  LightModeColorsTheme,
  OsmosisModeColorsTheme,
  InjectiveColorsTheme,
  colorsCode,
} from "./mode-colors";

export const colors = {
  ...colorsCode,
  ...DarkModeColorsTheme,
};

export const osmosisColors = {
  ...colorsCode,
  ...OsmosisModeColorsTheme,
};

export const injectiveColors = {
  ...colorsCode,
  ...InjectiveColorsTheme,
};

export const lightColors = {
  ...colorsCode,
  ...LightModeColorsTheme,
};
