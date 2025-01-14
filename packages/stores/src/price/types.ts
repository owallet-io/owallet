export type CoinGeckoSimplePrice = {
  [coinId: string]: {
    [vsCurrency: string]: number;
  };
};

export type CoinGeckoTerminalSimplePrice = {
  [coinId: string]: {
    [vsCurrency: string]: number;
  };
};

export interface CoinGeckoTerminalPrice {
  data: Daum[];
  included: Included[];
}

export interface Daum {
  id: string;
  type: string;
  attributes: Attributes;
  relationships: Relationships;
}

export interface Attributes {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  coingecko_coin_id?: string;
  total_supply: string;
  price_usd?: string;
  fdv_usd?: string;
  total_reserve_in_usd: string;
  volume_usd: VolumeUsd;
  market_cap_usd?: string;
}

export interface VolumeUsd {
  h24: string;
}

export interface Relationships {
  top_pools: TopPools;
}

export interface TopPools {
  data: Daum2[];
}

export interface Daum2 {
  id: string;
  type: string;
}

export interface Included {
  id: string;
  type: string;
  attributes: Attributes2;
  relationships: Relationships2;
}

export interface Attributes2 {
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  quote_token_price_usd: string;
  quote_token_price_native_currency: string;
  base_token_price_quote_token: string;
  quote_token_price_base_token: string;
  address: string;
  name: string;
  pool_created_at: string;
  fdv_usd: string;
  market_cap_usd?: string;
  price_change_percentage: PriceChangePercentage;
  transactions: Transactions;
  volume_usd: VolumeUsd2;
  reserve_in_usd: string;
}

export interface PriceChangePercentage {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
}

export interface Transactions {
  m5: M5;
  m15: M15;
  m30: M30;
  h1: H1;
  h24: H24;
}

export interface M5 {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

export interface M15 {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

export interface M30 {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

export interface H1 {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

export interface H24 {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

export interface VolumeUsd2 {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
}

export interface Relationships2 {
  base_token: BaseToken;
  quote_token: QuoteToken;
  dex: Dex;
}

export interface BaseToken {
  data: Data;
}

export interface Data {
  id: string;
  type: string;
}

export interface QuoteToken {
  data: Data2;
}

export interface Data2 {
  id: string;
  type: string;
}

export interface Dex {
  data: Data3;
}

export interface Data3 {
  id: string;
  type: string;
}
