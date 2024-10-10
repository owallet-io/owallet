import { AppCurrency } from "@owallet/types";

export interface TokenInfo {
  associatedAccountAddress?: string;
  currency: AppCurrency;
}
