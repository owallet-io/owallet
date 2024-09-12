import { ChainIdEnum } from "@owallet/common";
import { Network as NetworkTatum } from "@tatumio/tatum";

export enum OasisNetwork {
  MAINNET = "oasis-mainnet",
  SAPPHIRE = "oasis-sapphire-mainnet",
  EMERALD = "oasis-emerald-mainnet",
}

export enum COSMOS_NETWORK {
  COSMOSHUB = "cosmoshub-4",
  OSMOSIS = "osmosis-1",
  INJECTIVE = "injective-1",
  ORAICHAIN = "Oraichain",
}

export type Network = NetworkTatum & OasisNetwork & COSMOS_NETWORK;
export const Network = { ...NetworkTatum, ...OasisNetwork, ...COSMOS_NETWORK };

export const MapChainIdToNetwork = {
  [ChainIdEnum.BNBChain]: Network.BINANCE_SMART_CHAIN,
  [ChainIdEnum.Ethereum]: Network.ETHEREUM,
  [ChainIdEnum.Bitcoin]: Network.BITCOIN,
  [ChainIdEnum.Oasis]: Network.MAINNET,
  [ChainIdEnum.OasisEmerald]: Network.EMERALD,
  [ChainIdEnum.OasisSapphire]: Network.SAPPHIRE,
  [ChainIdEnum.TRON]: Network.TRON,
  [ChainIdEnum.Oraichain]: Network.ORAICHAIN,
  [ChainIdEnum.Osmosis]: Network.OSMOSIS,
  [ChainIdEnum.CosmosHub]: Network.COSMOSHUB,
  [ChainIdEnum.Injective]: Network.INJECTIVE,
  // [ChainIdEnum.Neutaro]: Network.NEUTARO,
};
