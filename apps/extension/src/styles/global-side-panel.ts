import { createGlobalStyle } from "styled-components";

export const SidePanelMaxWidth = "540px";
export const GlobalSidePanelStyle = createGlobalStyle`
  html {
    margin-left: auto;
    margin-right: auto;
    
    overflow: hidden;
  }
  
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  #app {
    width: 100%;
    max-width: ${SidePanelMaxWidth};
  }
`;
