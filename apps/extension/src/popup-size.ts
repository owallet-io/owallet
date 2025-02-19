import { useLayoutEffect } from "react";
import { PopupWidth } from "./styles";
import * as queryString from "querystring";

export const useMatchPopupSize = () => {
  useLayoutEffect(() => {
    const href = window.location.href;
    if (href.includes("?")) {
      try {
        const query = queryString.parse(href.split("?")[1]);
        if (query["interaction"] === "true") {
          if (window.visualViewport) {
            const layoutWidth = window.visualViewport.width;
            if (layoutWidth < PopupWidth) {
              document.documentElement.style.setProperty(
                "--popup-width",
                `${layoutWidth}px`
              );
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, []);
};
