export type Result = {
  id: number;
  jsonrpc: string;
  result: string;
};

export type Erc20ContractTokenInfo = {
  decimals: number;
  name: string;
  symbol: string;
  total_supply: string;
};
