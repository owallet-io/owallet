import { AppCurrency } from "../currency";

export interface ISimulateSignTron {
  amount: string;
  recipient: string;
  currency: AppCurrency;
  from: string;
  memo?: string;
}
