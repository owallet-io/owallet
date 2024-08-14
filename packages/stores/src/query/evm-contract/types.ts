export type Erc20ContractBalance = {
  balance: string;
};

export type Erc20ContractTokenInfo = {
  decimals: number;
  name: string;
  symbol: string;
  total_supply: string;
  token_info_response?: {
    decimals: number;
    name: string;
    symbol: string;
    total_supply: string;
  };
};
