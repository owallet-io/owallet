import { createGlobalStyle } from "styled-components";
import { normalize } from "styled-normalize";
import { ColorPalette } from "./colors";

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  
  html {
    // TODO: Change the scheme according to theme after theme feature is implemented.
    color-scheme: ${(props) =>
      props.theme.mode === "light" ? "light" : "dark"};
  }
  
  html, body {
    font-family: 'Space Grotesk', sans-serif;
    -webkit-font-smoothing: antialiased;
   
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette.white};
    background: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["light-gradient"]
        : ColorPalette["gray-700"]};

    &[data-white-background="true"] {
      background: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette.white
          : ColorPalette["gray-700"]};
    }
  }
  
  pre {
    font-family: 'Space Grotesk', sans-serif;
    -webkit-font-smoothing: antialiased;
    font-weight: 400;
    font-size: 0.8125rem;
    color: ${ColorPalette["gray-200"]};
  }

  // Set border-box as default for convenience.
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  
  * {
    font-feature-settings: "calt" 0
  }
`;
