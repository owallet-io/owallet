import { OwnedTokens } from "./../../../graphql/queries/OwnerTokens";
import { ChainIdEnum, unknownToken } from "@owallet/common";
import { IItemNft } from "../types/nft.types";

import { useQuery } from "@apollo/client";
import { useQuery as useFetchQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { urlAiRight } from "@src/common/constants";
import { ChainStore } from "@owallet/stores";
import { ChainInfo } from "@owallet/types";
export const useNfts = (
  chainInfo: ChainInfo,
  address,
  isAllNetworks
): IItemNft[] => {
  const { chainId, stakeCurrency, currencies } = chainInfo;
  if (chainId === ChainIdEnum.Oraichain) {
    const { data, refetch } = useFetchQuery({
      queryKey: ["nft-orai", address],
      queryFn: () => {
        return API.getNftsOraichain(
          {
            address,
          },
          { baseURL: urlAiRight }
        );
      },
      ...{
        initialData: null,
      },
    });
    const nfts = (data?.data?.items || []).map((nft, index) =>
      processDataOraiNft(nft, currencies)
    );
    return nfts;
  }
  const { loading, error, data } = useQuery(OwnedTokens, {
    variables: {
      filterForSale: null,
      owner: address,
      limit: isAllNetworks || chainId === ChainIdEnum.Stargaze ? 50 : 0,
      filterByCollectionAddrs: null,
      sortBy: "ACQUIRED_DESC",
    },
    fetchPolicy: "cache-and-network",
  });
  const nfts = (data?.tokens?.tokens || [])
    .filter((item, index) => item?.media?.type === "image")
    .map((nft, index) => processDataStargazeNft(nft, stakeCurrency));
  return nfts;
};

export const processDataStargazeNft = (item, stakeCurrency) => {
  const tokenInfo = stakeCurrency || unknownToken;
  return {
    floorPrice: item?.collection?.floorPrice || "0",
    name: item?.name,
    tokenId: item?.tokenId,
    url: item?.media?.url,
    tokenInfo,
    contractAddress: item?.collection?.contractAddress,
    network: ChainIdEnum.Stargaze,
    creatorImage: item?.media?.url,
    version: "721",
    description: "",
  } as IItemNft;
};

export const processDataOraiNft = (nft, currencies) => {
  const tokenInfo = nft?.offer
    ? currencies.find(
        (item, index) =>
          item?.coinDenom?.toUpperCase() === nft?.offer?.denom?.toUpperCase()
      )
    : unknownToken;
  return {
    floorPrice: nft?.offer?.amount || "0",
    name: `${nft?.name || ""} #${nft?.id}`,
    tokenId: nft?.tokenId,
    url: nft?.url,
    tokenInfo,
    contractAddress: nft?.tokenContract,
    network: ChainIdEnum.Oraichain,
    creatorImage: nft?.creatorProvider?.picture,
    version: nft?.version === 2 ? "1155" : "721",
    description: nft?.description,
  } as IItemNft;
};
