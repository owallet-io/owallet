export type voidNode = () => React.ReactNode;
export type NodeElement = React.ReactNode | voidNode;
type TokenItem = {
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
  tokensData: TokenItem[];
}