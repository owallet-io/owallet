import { AppCurrency } from "@owallet/types";

export interface TokenInfo {
  // Hex encoded
  // Tokens are handled globally, not per account.
  // But secret20 must be tied to the account because of the viewing key;
  // The logic gets a bit messy because of secret20.
  // For cw20, associatedAccountAddress should not be included.
  associatedAccountAddress?: string;
  currency: AppCurrency;
}
