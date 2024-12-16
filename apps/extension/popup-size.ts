import { useLayoutEffect } from "react";
import { PopupWidth } from "./src/styles";

export const useMatchPopupSize = () => {
  useLayoutEffect(() => {
    const href = window.location.href;
    if (href.includes("?")) {
      try {
        if (window.visualViewport) {
          const layoutWidth = window.visualViewport.width;
          if (layoutWidth < PopupWidth) {
            document.documentElement.style.setProperty(
              "--popup-width",
              `${layoutWidth}px`
            );
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, []);
};
