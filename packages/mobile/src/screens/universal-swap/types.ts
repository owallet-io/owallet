import { OWTextProps } from '@src/components/text/ow-text';
import { ImageProps } from 'react-native';

export type voidNode = () => React.ReactNode;
export type NodeElement = React.ReactNode | voidNode;
export type TokenInfo = {
  symbol: string;
  logo: ImageProps['source'];
  network: string;
  available?: string;
  networkLogo?:ImageProps['source'];
};
export type TypeTextAndCustomizeComponent = NodeElement | string;
export interface ISwapBox extends IInputSelectToken {
  feeValue: string;
  currencyValue: string;
  balanceValue: string;
}

export interface IInputSelectToken {
  tokenActive: TokenInfo;
  amount: string;
  onAmount: (txt?: string) => void;
  onOpenTokenModal: (ev: any) => void;
}
