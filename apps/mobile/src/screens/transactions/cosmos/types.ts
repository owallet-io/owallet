export interface ResTxsCosmos {
  data: CosmosItem[];
  totaRecord: number;
}

export interface CosmosItem {
  uniqKey: string;
  height: string;
  txhash: string;
  code: number;
  timestamp: number;
  gasWanted: string;
  gasUsed: string;
  chainId: string;
  msgType: string;
  userAddress: string;
  fromAddress: string;
  toAddress: string;
  amount: Amount[];
  fee: Fee[];
  tokenInfos: TokenInfo[];
}

export interface Amount {
  denom: string;
  amount: string;
}

export interface Fee {
  denom: string;
  amount: string;
}

export interface TokenInfo {
  uniqueKey: string;
  network: string;
  abbr: string; //symbol
  contractAddress: string;
  contractAddressLower: string;
  decimal: number;
  imgUrl: string;
  name: string;
  tokenId: number;
  denom: string; // this is coin minimum denom
  coingeckoId: string;
  tokenType: string;
}
