import { ChainInfo } from "./chain-info";
// import { CoinPretty, PricePretty } from '@owallet/unit';
import { AppCurrency } from "./currency";

export interface IMultipleAsset {
  totalPriceBalance: string;
  dataTokens: ViewRawToken[];
  dataTokensByChain: Record<string, ViewTokenData>;
  isLoading?: boolean;
}

export interface ViewToken {
  //TODO: need check type for chain info
  chainInfo: ChainInfo;
  token: any;
  price: any | undefined;
  isFetching: boolean;
  error: any;
}

export interface RawToken {
  currency: AppCurrency;
  amount: string;
}

export interface RawChainInfo {
  chainId: string;
  chainName: string;
  chainImage: string;
}

export interface ViewRawToken {
  chainInfo: RawChainInfo;
  token: RawToken;
  price: string;
  type?: string;
}

export interface ViewTokenData {
  tokens: ViewRawToken[];
  totalBalance: string;
  chainInfo: RawChainInfo;
}

export interface ViewChainAddress {
  chainInfo: ChainInfo;
  address: string;
}
