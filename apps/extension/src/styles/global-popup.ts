import { createGlobalStyle } from "styled-components";

// Max: 800
const initialWidth = 360;
// Max: 600
const initialHeight = 600;

export const PopupWidth = Math.min(initialWidth, 800);
export const PopupHeight = Math.min(initialHeight, 600);

export const GlobalPopupStyle = createGlobalStyle`
  :root {
    --popup-width: ${PopupWidth}px;
    --popup-height: ${PopupHeight}px;
  }
  
  html {
    width: var(--popup-width);
    min-height: var(--popup-height);

    margin-left: auto;
    margin-right: auto;
    
    overflow: hidden;
  }
  
  body {
    min-height: var(--popup-height);
    
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  #app {
    width: var(--popup-width);
  }
`;
