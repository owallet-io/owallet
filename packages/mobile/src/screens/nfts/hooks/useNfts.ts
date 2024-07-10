import { OwnedTokens } from "./../../../graphql/queries/OwnerTokens";
import { ChainIdEnum, unknownToken } from "@owallet/common";
import { IItemNft } from "../types/nft.types";
import { useQuery } from "@apollo/client";
import { useQuery as useFetchQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { urlAiRight } from "@src/common/constants";
import { ChainInfo } from "@owallet/types";
import { AccountStore } from "@owallet/stores";
import { ChainStore } from "@src/stores/chain";
interface Nfts {
  chainInfo: ChainInfo;
  data: IItemNft[];
  count: number;
}
interface DataHandle {
  total: number;
  data: IItemNft[];
}
export const useNfts = (
  chainStore: ChainStore,
  accountStore: AccountStore<any>,
  isAllNetworks
): Nfts[] => {
  const chainInfoOrai = chainStore.getChain(ChainIdEnum.Oraichain);
  const chainInfoStargaze = chainStore.getChain(ChainIdEnum.Stargaze);
  const handleNftsForOraichain = (): DataHandle => {
    const { currencies } = chainInfoOrai;
    const account = accountStore.getAccount(ChainIdEnum.Oraichain);
    const address = account.bech32Address;
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
      return {
        total: 0,
        data: [],
      };
    }
    const nfts = (data?.data?.items || []).map((nft, index) =>
      processDataOraiNft(nft, currencies)
    );
    return {
      total: data?.data?.total || 0,
      data: nfts,
    };
  };

  const handleNftsForStargaze = (): DataHandle => {
    const { chainId, stakeCurrency } = chainInfoStargaze;
    const account = accountStore.getAccount(ChainIdEnum.Stargaze);
    const address = account.bech32Address;
    const { loading, error, data } = useQuery(OwnedTokens, {
      variables: {
        filterForSale: null,
        owner: address,
        limit: isAllNetworks || chainId === ChainIdEnum.Stargaze ? 4 : 0,
        filterByCollectionAddrs: null,
        sortBy: "ACQUIRED_DESC",
        offset: 0,
      },
      fetchPolicy: "cache-and-network",
    });
    if (error) {
      console.error("Error fetching NFTs from Stargaze:", error);
      return {
        total: 0,
        data: [],
      };
    }

    const nfts = (data?.tokens?.tokens || [])
      .filter((item, index) => item?.media?.type === "image")
      .map((nft, index) => processDataStargazeNft(nft, stakeCurrency));
    return {
      total: data?.tokens?.pageInfo?.total || 0,
      data: nfts || [],
    };
  };
  const nfts = {
    [ChainIdEnum.Oraichain]: handleNftsForOraichain(),
    [ChainIdEnum.Stargaze]: handleNftsForStargaze(),
  };
  return isAllNetworks
    ? [
        {
          chainInfo: chainInfoOrai,
          data: nfts[ChainIdEnum.Oraichain]?.data || [],
          count: nfts[ChainIdEnum.Oraichain]?.total,
        },
        {
          chainInfo: chainInfoStargaze,
          data: nfts[ChainIdEnum.Stargaze]?.data || [],
          count: nfts[ChainIdEnum.Stargaze]?.total,
        },
      ]
    : [
        {
          chainInfo: chainStore.current,
          data: nfts[chainStore.current.chainId]?.data || [],
          count: nfts[chainStore.current.chainId]?.total,
        },
      ];
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
