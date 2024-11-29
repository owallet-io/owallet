import { Solana } from "@owallet/types";

export const getSolanaFromWindow: () => Promise<
  Solana | undefined
> = async () => {
  if (window.owalletSolana) {
    return window.owalletSolana;
  }

  if (document.readyState === "complete") {
    return window.owalletSolana;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.owalletSolana);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
