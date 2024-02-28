import { getNetworkTypeByChainId, TRON_ID } from "@owallet/common";

export const generateMsgNft = (limit, address, startAfter) => {
  let obj: {
    limit?: number;
    owner: string;
    start_after?: string;
  } = {
    owner: "",
  };
  if (limit) obj.limit = limit;
  if (address) obj.owner = address;
  if (startAfter) obj.start_after = startAfter;
  return {
    tokens: {
      ...obj,
    },
  };
};

export const generateMsgInfoNft = (tokenId) => {
  return {
    nft_info: {
      token_id: tokenId,
    },
  };
};

export const generateMsgAllNft = (tokenId) => {
  return {
    all_nft_info: {
      token_id: tokenId,
    },
  };
};
