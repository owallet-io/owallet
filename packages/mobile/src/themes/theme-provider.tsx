import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { createContext, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores';
import { colors, lightColors } from '../themes/colors';

const MyDarkTheme = {
  dark: true,
  colors: {
    ...colors
  }
};
const MyDefaultTheme = {
  dark: false,
  colors: {
    ...lightColors
  }
};
const typeColorsTheme = () => MyDarkTheme;
export type TypeTheme = ReturnType<typeof typeColorsTheme>;

const ThemeContext = createContext(null);
const ThemeProvider = observer(({ children }) => {
  const { appInitStore } = useStore();
  const theme = appInitStore.getInitApp.theme;
  return (
    <ThemeContext.Provider
      value={theme == 'dark' ? MyDarkTheme : MyDefaultTheme}
    >
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={theme == 'dark' ? 'light-content' : 'dark-content'}
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
