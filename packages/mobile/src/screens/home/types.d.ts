export interface SoulboundNftInfoResponse {
  extension: MetadataResponse;
  token_uri?: string | null;
}
export interface MetadataResponse {
  animation_url?: string | null;
  attributes?: Trait[] | null;
  background_color?: string | null;
  description?: string | null;
  dyn_attrs?: [string, string][] | null;
  external_url?: string | null;
  image?: string | null;
  image_data?: string | null;
  name?: string | null;
  youtube_url?: string | null;
}
