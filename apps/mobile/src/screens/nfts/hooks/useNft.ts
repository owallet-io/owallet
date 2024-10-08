import {
  processDataOraiNft,
  processDataOraiTalisNft,
  processDataStargazeNft,
  TALIS_COLLECTIONS,
} from "./useNfts";
import {
  ChainIdEnum,
  convertIpfsToHttp,
  fetchRetry,
  unknownToken,
} from "@owallet/common";
import { IItemNft } from "../types/nft.types";
import { useQuery } from "@apollo/client";
import { useQuery as useFetchQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { Token } from "@src/graphql/queries";
import { urlAiRight } from "@src/common/constants";
import { ChainInfo } from "@owallet/types";
import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import { Cw721BaseQueryClient } from "@oraichain/common-contracts-sdk";

export const useNft = (
  chainInfo: ChainInfo,
  tokenId,
  contractAddress,
  ecosystem: string
): IItemNft | undefined => {
  const { chainId, stakeCurrency, currencies } = chainInfo;
  if (!tokenId || !contractAddress) return;
  const handleForOraichain = () => {
    const { data, refetch } = useFetchQuery({
      queryKey: ["nft-detail-orai", tokenId],
      queryFn: () => {
        return API.getNftOraichain(
          {
            tokenId: tokenId,
          },
          { baseURL: urlAiRight }
        );
      },
      ...{
        initialData: null,
      },
    });
    return processDataOraiNft(data?.data, currencies);
  };
  const handleForTalisOraichain = async () => {
    let client = await cosmwasm.CosmWasmClient.connect(chainInfo.rpc);
    const cw721 = new Cw721BaseQueryClient(client, contractAddress);
    const nft = await cw721.nftInfo({
      tokenId,
    });
    if (!nft && !nft.token_uri) return;
    const data = await fetchRetry(convertIpfsToHttp(nft.token_uri));
    return processDataOraiTalisNft(data, tokenId, contractAddress);
  };
  const handleForStargaze = () => {
    const { loading, error, data } = useQuery(Token, {
      variables: {
        collectionAddr: contractAddress,
        tokenId: tokenId,
      },
    });
    return processDataStargazeNft(data?.token, stakeCurrency);
  };
  const nft = {
    [ChainIdEnum.Oraichain]: {
      airight: handleForOraichain(),
      [TALIS_COLLECTIONS.HONORAIS]: handleForTalisOraichain(),
      [TALIS_COLLECTIONS.LAST_SAMORAIS]: handleForTalisOraichain(),
      [TALIS_COLLECTIONS.ORAI_WACHINES]: handleForTalisOraichain(),
      [TALIS_COLLECTIONS.RUGLEO_POORDS]: handleForTalisOraichain(),
      [TALIS_COLLECTIONS.KRANIA_ORCHA]: handleForTalisOraichain(),
    },
    [ChainIdEnum.Stargaze]: {
      stargaze: handleForStargaze(),
    },
  };

  return nft[chainId][ecosystem] || null;
};
