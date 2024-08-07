import { OwnedTokens } from "./../../../graphql/queries/OwnerTokens";
import {
  ChainIdEnum,
  convertIpfsToHttp,
  fetchRetry,
  TALIS_NFT_CONTRACT,
  unknownToken,
} from "@owallet/common";
import { IItemNft } from "../types/nft.types";
import { useQuery } from "@apollo/client";
import { useQuery as useFetchQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { urlAiRight } from "@src/common/constants";
import { ChainInfo } from "@owallet/types";
import { AccountStore } from "@owallet/stores";
import { ChainStore } from "@src/stores/chain";
// import { useClient } from "@owallet/hooks";
import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import {
  Cw721BaseQueryClient,
  MulticallQueryClient,
} from "@oraichain/common-contracts-sdk";
import { useEffect, useState } from "react";
export enum TALIS_COLLECTIONS {
  HONORAIS = "HONORAIS",
  LAST_SAMORAIS = "LAST_SAMORAIS",
  ORAI_WACHINES = "ORAI_WACHINES",
}
export enum ECOSYSTEM_NFT_CHAIN {
  TALIS = "TALIS",
  AIRIGHT = "AIRIGHT",
  STARGAZE = "STARGAZE",
}
export const LIMIT_TALIS_CW721 = 1000;
export interface ITalisCW721 {
  title: string;
  description: string;
  background: string;
  accessories: string;
  weapon: string;
  body: string;
  clothes: string;
  energy_core: string;
  mouth: string;
  eyes: string;
  head: string;
  str: string;
  dex: string;
  int: string;
  luck: string;
  media: string;
  tags: any[];
}
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

  const handleNftsForTalis = (contractAddress): DataHandle => {
    const account = accountStore.getAccount(ChainIdEnum.Oraichain);
    const address = account.bech32Address;

    const [data, setData] = useState<IItemNft[]>();
    const [totalNfts, setTotalNfts] = useState<number>(0);

    useEffect(() => {
      if (!address) return;
      fetchData();
      return () => {};
    }, [address]);
    const fetchData = async () => {
      let client = await cosmwasm.CosmWasmClient.connect(chainInfoOrai.rpc);
      const cw721 = new Cw721BaseQueryClient(client, contractAddress);
      const nfts = await cw721.tokens({
        owner: address,
        limit: 4,
        startAfter: "0",
      });
      const maxNfts = await cw721.tokens({
        owner: address,
        limit: LIMIT_TALIS_CW721,
        startAfter: "0",
      });
      //@ts-ignore
      const total = maxNfts && maxNfts.ids && maxNfts.ids.length;
      setTotalNfts(total);
      //@ts-ignore
      const tokenIds = nfts && nfts.ids;
      const tokensDecoded = (
        await Promise.allSettled(
          tokenIds.map((tokenId) =>
            cw721.nftInfo({
              tokenId: tokenId,
            })
          )
        )
      )
        .filter((result) => result.status === "fulfilled")
        .map((result) => fetchRetry(convertIpfsToHttp(result.value.token_uri)));
      const tokens = (await Promise.allSettled(tokensDecoded))
        .filter((result) => result.status === "fulfilled")
        .map((result, index) =>
          processDataOraiTalisNft(
            result.value,
            tokenIds?.[index || 0],
            contractAddress
          )
        );
      console.log(tokens, "tokens");
      setData(tokens);
    };

    return {
      total: totalNfts || 0,
      data: data,
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
        limit: 4,
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
    [TALIS_COLLECTIONS.HONORAIS]: handleNftsForTalis(
      TALIS_NFT_CONTRACT.Honorais
    ),
    [TALIS_COLLECTIONS.LAST_SAMORAIS]: handleNftsForTalis(
      TALIS_NFT_CONTRACT.LastSamorais
    ),
    [TALIS_COLLECTIONS.ORAI_WACHINES]: handleNftsForTalis(
      TALIS_NFT_CONTRACT.OraiWachines
    ),
    [ECOSYSTEM_NFT_CHAIN.AIRIGHT]: handleNftsForOraichain(),
    [ECOSYSTEM_NFT_CHAIN.STARGAZE]: handleNftsForStargaze(),
  };
  const mapTitle = {
    [ECOSYSTEM_NFT_CHAIN.TALIS]: "Talis",
    [ECOSYSTEM_NFT_CHAIN.AIRIGHT]: "Airight",
    [ECOSYSTEM_NFT_CHAIN.STARGAZE]: "Stargaze",
  };
  const allChainNfts = {
    [ChainIdEnum.Oraichain]: [
      {
        chainInfo: chainInfoOrai,
        title: mapTitle[ECOSYSTEM_NFT_CHAIN.TALIS],
        data: nfts[TALIS_COLLECTIONS.HONORAIS]?.data || [],
        count: nfts[TALIS_COLLECTIONS.HONORAIS]?.total,
      },
      {
        chainInfo: chainInfoOrai,
        title: mapTitle[ECOSYSTEM_NFT_CHAIN.TALIS],
        data: nfts[TALIS_COLLECTIONS.LAST_SAMORAIS]?.data || [],
        count: nfts[TALIS_COLLECTIONS.LAST_SAMORAIS]?.total,
      },
      {
        chainInfo: chainInfoOrai,
        title: mapTitle[ECOSYSTEM_NFT_CHAIN.TALIS],
        data: nfts[TALIS_COLLECTIONS.ORAI_WACHINES]?.data || [],
        count: nfts[TALIS_COLLECTIONS.ORAI_WACHINES]?.total,
      },
      {
        chainInfo: chainInfoOrai,
        title: mapTitle[ECOSYSTEM_NFT_CHAIN.AIRIGHT],
        data: nfts[ECOSYSTEM_NFT_CHAIN.AIRIGHT]?.data || [],
        count: nfts[ECOSYSTEM_NFT_CHAIN.AIRIGHT]?.total,
      },
    ],
    [ChainIdEnum.Stargaze]: [
      {
        chainInfo: chainInfoStargaze,
        title: mapTitle[ECOSYSTEM_NFT_CHAIN.STARGAZE],
        data: nfts[ECOSYSTEM_NFT_CHAIN.STARGAZE]?.data || [],
        count: nfts[ECOSYSTEM_NFT_CHAIN.STARGAZE]?.total,
      },
    ],
  };
  return isAllNetworks
    ? Object.values(allChainNfts).flat()
    : allChainNfts[chainStore.current.chainId];
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
    ecosystem: "stargaze",
  } as IItemNft;
};
export const processDataOraiTalisNft = (
  nft: ITalisCW721,
  tokenId,
  contractAddress
) => {
  if (!nft) return;
  // const url = "https://airight.io/artwork";
  return {
    floorPrice: "0",
    name: `${nft?.title || ""}`,
    tokenId: tokenId || "",
    url: convertIpfsToHttp(nft?.media),
    tokenInfo: unknownToken,
    contractAddress: contractAddress,
    network: ChainIdEnum.Oraichain,
    creatorImage: convertIpfsToHttp(nft?.media),
    version: "721",
    description: nft?.description,
    explorer: "https://orai.talis.art",
    ecosystem: "talis",
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
    url: nft?.picture || nft?.url,
    tokenInfo,
    contractAddress: nft?.tokenContract,
    network: ChainIdEnum.Oraichain,
    creatorImage: nft?.creatorProvider?.picture,
    version: nft?.version === 2 ? "1155" : "721",
    description: nft?.description,
    explorer: `${url}/${nft?.id}`,
    ecosystem: "airight",
  } as IItemNft;
};
