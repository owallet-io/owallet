import { CoinGeckoPriceStore, CoinPrimitive } from "@owallet/stores";
import { AppCurrency } from "@owallet/types";
import { CoinUtils } from "@owallet/unit";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Hypher from "hypher";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import english from "hyphenation.en-us";
export const getPrice = (
  amount: CoinPrimitive,
  currencies: AppCurrency[],
  priceStore: CoinGeckoPriceStore
) => {
  if (!amount || !currencies || !priceStore) return "$0";
  const coin = CoinUtils.convertCoinPrimitiveToCoinPretty(
    currencies,
    amount.denom?.toLowerCase(),
    amount.amount
  );

  const totalPrice = priceStore.calculatePrice(coin);
  return totalPrice?.toString();
};

const h = new Hypher(english);
export const hyphen = (text: string): string => {
  return h.hyphenateText(text);
};
export function clearDecimals(dec: string): string {
  if (!dec.includes(".")) {
    return dec;
  }

  for (let i = dec.length - 1; i >= 0; i--) {
    if (dec[i] === "0") {
      dec = dec.slice(0, dec.length - 1);
    } else {
      break;
    }
  }
  if (dec.length > 0 && dec[dec.length - 1] === ".") {
    dec = dec.slice(0, dec.length - 1);
  }

  return dec;
}
