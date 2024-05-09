import { ImageProps } from "react-native";
import { TokenItemType } from "@oraichain/oraidex-common";

export type voidNode = () => React.ReactNode;
export type NodeElement = React.ReactNode | voidNode;
export type TokenInfo = {
  symbol: string;
  logo: ImageProps["source"];
  network: string;
  available?: string;
  networkLogo?: ImageProps["source"];
};
export type TypeTextAndCustomizeComponent = NodeElement | string;
export interface ISwapBox extends IInputSelectToken {
  tokenFee?: number;
  currencyValue?: string;
  balanceValue: string | number;
  tokenActive: TokenItemType;
  editable?: boolean;
  type?: string;
}

export interface IInputSelectToken {
  tokenActive: TokenItemType;
  amount?: string;
  editable?: boolean;
  onChangeAmount?: (txt: any) => void;
  onOpenTokenModal: (ev: any) => void;
}

export type BalanceType = {
  id: string;
  value: string;
};

const ONE_QUARTER = "25";
const HALF = "50";
const THREE_QUARTERS = "75";
export const MAX = "100";
export const interpolateURL = "https://static.orai.io/interpolate.html";
export const oraidexURL = "https://oraidex.io";

export const balances: BalanceType[] = [
  {
    id: "1",
    value: ONE_QUARTER,
  },
  { id: "2", value: HALF },
  { id: "3", value: THREE_QUARTERS },
  { id: "4", value: MAX },
];
