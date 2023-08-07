import { OWTextProps } from '@src/components/text/ow-text';
import { ImageProps } from 'react-native';

export type voidNode = () => React.ReactNode;
export type NodeElement = React.ReactNode | voidNode;
export type TokenInfo = {
  symbol: string;
  logo: ImageProps['source'];
  network: string;
};
export type TypeTextAndCustomizeComponent = NodeElement | string;
export interface ISwapBox extends IInputSelectToken {
  feeValue: string;
  tokensData: TokenInfo[];
  currencyValue: string;
  balanceValue: string;
}

export interface IInputSelectToken {
  tokenActive: TokenInfo;
  amount: string;
  onAmount: (txt?: string) => void;
}
