import { ChainIdEnum } from "@owallet/common";

import { AppCurrency } from "@owallet/types";
export interface IItemNft {
  floorPrice: string;
  name: string;
  tokenId: string;
  url: string;
  tokenInfo: AppCurrency;
  contractAddress: string;
  network: ChainIdEnum;
  creatorImage: string;
  version: "721" | "1155";
  description: string;
}
