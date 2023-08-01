import { OWTextProps } from '@src/components/text/ow-text';

export type voidNode = () => React.ReactNode;
export type NodeElement = React.ReactNode | voidNode;
type TokenÌno = {
  symbol: string;
  logo: string;
  name: string;
};
export type TypeTextAndCustomizeComponent = NodeElement | string;
export interface ISwapBox {
  titleLeft: string;
  titleRight?: TypeTextAndCustomizeComponent;
  labelInputLeft: string;
  labelInputRight?: TypeTextAndCustomizeComponent;
  feeLabel?: TypeTextAndCustomizeComponent;
  feeValue?: string;
  tokensData: TokenÌno[];
}

export interface IInputSelectToken {
  TokenÌno?: TokenÌno;
  amount: string;
  amountCurrency: string;
}
