import { TronWeb } from "@owallet/types";

export const getTronWebFromWindow: () => Promise<
  TronWeb | undefined
> = async () => {
  if (window.tronWeb) {
    return window.tronWeb;
  }

  if (document.readyState === "complete") {
    return window.tronWeb;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.tronWeb);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
