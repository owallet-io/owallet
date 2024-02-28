import { Bitcoin } from "@owallet/types";

export const getBitcoinFromWindow: () => Promise<
  Bitcoin | undefined
> = async () => {
  if (window.bitcoin) {
    return window.bitcoin;
  }

  if (document.readyState === "complete") {
    return window.bitcoin;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.bitcoin);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
