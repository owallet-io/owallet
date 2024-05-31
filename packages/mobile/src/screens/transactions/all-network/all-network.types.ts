export interface TxsAllNetwork {
  data: AllNetworkItemTx[];
  totalRecord: number;
}

export interface AllNetworkItemTx {
  uniqKey: string;
  network: string;
  height: string;
  txhash: string;
  status: number;
  timestamp: number;
  transactionType: string;
  userAddress: string;
  fromAddress: string;
  toAddress: string;
  amount: string[];
  fee: string[];
  tokenInfos: TokenInfo[];
  energyUsage: string;
  netFee: string;
  explorer: string;
}

export interface TokenInfo {
  uniqueKey: string;
  network: string;
  abbr: string;
  contractAddress?: string;
  contractAddressLower?: string;
  decimal: number;
  imgUrl: string;
  name: string;
  tokenId?: number;
  denom: string;
  coingeckoId: string;
  tokenType?: string;
}

export interface ResDetailAllTx {
  uniqKey: string;
  network: string;
  height: string;
  txhash: string;
  status: number;
  timestamp: number;
  transactionType: string;
  userAddress: string;
  fromAddress: string;
  toAddress: string;
  amount: string[];
  fee: string[];
  tokenInfos: TokenInfo[];
  energyUsage: string;
  netFee: string;
  explorer: string;
}
