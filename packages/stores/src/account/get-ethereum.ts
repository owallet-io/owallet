import { Ethereum } from "@owallet/types";

export const getEthereumFromWindow: () => Promise<
  Ethereum | undefined
> = async () => {
  if (window.ethereum) {
    return window.ethereum;
  }

  if (document.readyState === "complete") {
    return window.ethereum;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.ethereum);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
