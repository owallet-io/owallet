// contract address nft example
export const NftContract = 'orai1wa7ruhstx6x35td5kc60x69a49enw8f2rwlr8a7vn9kaw9tmgwqqt5llpe';

export const Limit = 1;
export const StartAfter = "0";

export interface InfoNft {
  animation_url?: string,
  image?: string,
  image_data?: string,
  tokenId?: string,
  name?: string,
  description?: string,
  owner?: string,
  external_url?: string,
  youtube_url?: string,
  background_color?: string,
  attributes?: any,
  approvals?: Array<{}>,
  token_uri?: string
}