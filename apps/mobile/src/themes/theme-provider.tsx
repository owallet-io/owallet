import { StatusBar, StyleSheet, Text, View } from "react-native";
import React, { createContext, useContext } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import {
  colors,
  injectiveColors,
  lightColors,
  osmosisColors,
} from "../themes/colors";
import { DarkModeImagesTheme, LightModeImagesTheme } from "./mode-images";

const MyDarkTheme = {
  dark: true,
  colors: {
    ...colors,
  },
  images: {
    ...DarkModeImagesTheme,
  },
};

const OsmosisTheme = {
  dark: true,
  colors: {
    ...osmosisColors,
  },
  images: {
    ...DarkModeImagesTheme,
  },
};

const InjectiveTheme = {
  dark: true,
  colors: {
    ...injectiveColors,
  },
  images: {
    ...DarkModeImagesTheme,
  },
};

const MyDefaultTheme = {
  dark: false,
  colors: {
    ...lightColors,
  },
  images: {
    ...LightModeImagesTheme,
  },
};
const typeColorsTheme = () => MyDarkTheme;
export type TypeTheme = ReturnType<typeof typeColorsTheme>;

const ThemeContext = createContext(null);
const ThemeProvider = observer(({ children }) => {
  const { appInitStore } = useStore();
  const theme = appInitStore.getInitApp.theme;
  const walletTheme = appInitStore.getInitApp.wallet;

  let mainTheme = MyDefaultTheme;

  if (theme === "dark") {
    if (walletTheme === "osmosis") {
      mainTheme = OsmosisTheme;
    } else if (walletTheme === "injective") {
      mainTheme = InjectiveTheme;
    } else {
      mainTheme = MyDarkTheme;
    }
  }

  return (
    <ThemeContext.Provider value={mainTheme}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={theme == "dark" ? "light-content" : "dark-content"}
      />
      {children}
    </ThemeContext.Provider>
  );
});

export const useTheme = () => {
  const theme = useContext<TypeTheme>(ThemeContext);
  return theme;
};

export default ThemeProvider;
