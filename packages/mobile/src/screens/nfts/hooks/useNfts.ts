import { OwnedTokens } from "./../../../graphql/queries/OwnerTokens";
import { ChainIdEnum, unknownToken } from "@owallet/common";
import { IItemNft } from "../types/nft.types";
import { useQuery } from "@apollo/client";
import { useQuery as useFetchQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { urlAiRight } from "@src/common/constants";
import { ChainInfo } from "@owallet/types";
export const useNfts = (
  chainInfo: ChainInfo,
  address,
  isAllNetworks
): IItemNft[] => {
  const { chainId, stakeCurrency, currencies } = chainInfo;
  const handleNftsForOraichain = () => {
    const { data, refetch, error } = useFetchQuery({
      queryKey: ["nft-orai", address],
      queryFn: () => {
        return API.getNftsOraichain(
          {
            address,
            size: 4,
          },
          { baseURL: urlAiRight }
        );
      },
      ...{
        initialData: null,
      },
    });
    if (error) {
      console.error("Error fetching NFTs from Oraichain:", error);
      return [];
    }
    const nfts = (data?.data?.items || []).map((nft, index) =>
      processDataOraiNft(nft, currencies)
    );
    return nfts;
  };
  const handleNftsForStargaze = () => {
    const { loading, error, data } = useQuery(OwnedTokens, {
      variables: {
        filterForSale: null,
        owner: address,
        limit: isAllNetworks || chainId === ChainIdEnum.Stargaze ? 4 : 0,
        filterByCollectionAddrs: null,
        sortBy: "ACQUIRED_DESC",
      },
      fetchPolicy: "cache-and-network",
    });
    if (error) {
      console.error("Error fetching NFTs from Stargaze:", error);
      return [];
    }
    const nfts = (data?.tokens?.tokens || [])
      .filter((item, index) => item?.media?.type === "image")
      .map((nft, index) => processDataStargazeNft(nft, stakeCurrency));
    return nfts;
  };
  const nfts = {
    [ChainIdEnum.Oraichain]: handleNftsForOraichain(),
    [ChainIdEnum.Stargaze]: handleNftsForStargaze(),
  };
  return nfts[chainId] || [];
};

export const processDataStargazeNft = (item, stakeCurrency) => {
  if (!item) return;
  const tokenInfo = stakeCurrency || unknownToken;
  const url = "https://www.stargaze.zone/m";
  return {
    floorPrice: item?.collection?.floorPrice || "0",
    name: item?.name,
    tokenId: item?.tokenId,
    url: item?.media?.url,
    tokenInfo,
    contractAddress: item?.collection?.contractAddress,
    network: ChainIdEnum.Stargaze,
    creatorImage: item?.media?.url,
    version: null,
    description: item?.description || "",
    explorer: `${url}/${item?.collection?.contractAddress}/${item?.tokenId}`,
  } as IItemNft;
};

export const processDataOraiNft = (nft, currencies) => {
  if (!nft) return;
  const tokenInfo = nft?.offer
    ? currencies.find(
        (item, index) =>
          item?.coinDenom?.toUpperCase() === nft?.offer?.denom?.toUpperCase()
      )
    : unknownToken;
  const url = "https://airight.io/artwork";
  return {
    floorPrice: nft?.offer?.amount || "0",
    name: `${nft?.name || ""} #${nft?.id}`,
    tokenId: nft?.id,
    url: nft?.url,
    tokenInfo,
    contractAddress: nft?.tokenContract,
    network: ChainIdEnum.Oraichain,
    creatorImage: nft?.creatorProvider?.picture,
    version: nft?.version === 2 ? "1155" : "721",
    description: nft?.description,
    explorer: `${url}/${nft?.id}`,
  } as IItemNft;
};
