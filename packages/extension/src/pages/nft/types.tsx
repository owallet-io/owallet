// contract address nft SOULBOUND_NFT
export const NftContract =
  "orai15g3lhqtsdhsjr2qzhtrc06jfshyuaegmf75rn5jf3ql3u8lc4l2sje4xpu";
export const RPC_ORAICHAIN = "https://rpc.orai.io";
export const Limit = 1;
export const StartAfter = "0";

export interface InfoNft {
  animation_url?: string;
  image?: string;
  image_data?: string;
  tokenId?: string;
  name?: string;
  description?: string;
  owner?: string;
  external_url?: string;
  youtube_url?: string;
  background_color?: string;
  attributes?: any;
  approvals?: Array<{}>;
  token_uri?: string;
}
