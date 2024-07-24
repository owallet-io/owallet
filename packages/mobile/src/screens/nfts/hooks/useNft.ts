import { processDataOraiNft, processDataStargazeNft } from "./useNfts";
import { ChainIdEnum, unknownToken } from "@owallet/common";
import { IItemNft } from "../types/nft.types";
import { useQuery } from "@apollo/client";
import { useQuery as useFetchQuery } from "@tanstack/react-query";
import { API } from "@src/common/api";
import { Token } from "@src/graphql/queries";
import { urlAiRight } from "@src/common/constants";
import { ChainInfo } from "@owallet/types";
export const useNft = (
  chainInfo: ChainInfo,
  tokenId,
  contractAddress
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
    [ChainIdEnum.Oraichain]: handleForOraichain(),
    [ChainIdEnum.Stargaze]: handleForStargaze(),
  };

  return nft[chainId] || null;
};
