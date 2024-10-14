import { createGlobalStyle } from "styled-components";
import { normalize } from "styled-normalize";

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  
  
  html {
    // TODO: Change the scheme according to theme after theme feature is implemented.
    color-scheme:  'light' ;
  }
  
  html, body {
   
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
