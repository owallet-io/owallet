import { OWTextProps } from '@src/components/text/ow-text';

export type voidNode = () => React.ReactNode;
export type NodeElement = React.ReactNode | voidNode;
type TokenÌno = {
  symbol: string;
  logo: string;
  name: string;
};
export type TypeTextAndCustomizeComponent = NodeElement | string;
export interface ISwapBox extends IInputSelectToken {
  feeValue: string;
  tokensData: TokenÌno[];
  currencyValue: string;
  balanceValue: string;
}

export interface IInputSelectToken {
  tokenActive: TokenÌno;
  amount: string;
}
