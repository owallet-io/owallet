import { Solana } from "@owallet/types";

export const getSolanaFromWindow: () => Promise<
  Solana | undefined
> = async () => {
  if (window.solana) {
    return window.solana;
  }

  if (document.readyState === "complete") {
    return window.solana;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.solana);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
