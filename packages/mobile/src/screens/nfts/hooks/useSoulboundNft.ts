import React from "react";
import { SoulboundNftInfoResponse } from "@src/screens/home/types";
import { CWStargate } from "@src/common/cw-stargate";
const contractAddress =
  "orai15g3lhqtsdhsjr2qzhtrc06jfshyuaegmf75rn5jf3ql3u8lc4l2sje4xpu";

export const useSoulbound = (
  chainId,
  account,
  rpc
): {
  tokenIds: String[];
  soulboundNft: SoulboundNftInfoResponse[];
  isLoading: boolean;
} => {
  const [state, setState] = React.useState<{
    soulboundNft: SoulboundNftInfoResponse[];
    loading: boolean;
  }>({
    soulboundNft: [],
    loading: true,
  });

  const tokenIds = React.useRef([]);

  const init = async () => {
    try {
      const client = await CWStargate.init(account, chainId, rpc);
      const tokensInfo = await getTokensInfoFromContract(
        client,
        // 'orai1ntdmh848kktumfw5tx8l2semwkxa5s7e5rs03x'
        account.bech32Address
      );

      setState({
        soulboundNft: tokensInfo,
        loading: false,
      });
    } catch (error) {
      setState({
        soulboundNft: [],
        loading: false,
      });
      tokenIds.current = [];
    }
  };
  React.useEffect(() => {
    setState({
      soulboundNft: [],
      loading: true,
    });
    init();
  }, [chainId, rpc, account.bech32Address, account.evmosHexAddress]);

  return {
    tokenIds: tokenIds.current,
    soulboundNft: state.soulboundNft,
    isLoading: state.loading,
  };
};
export const getTokens = async (client, accountAddress) => {
  const { tokens } = await client.queryContractSmart(contractAddress, {
    tokens: {
      limit: 10,
      owner: accountAddress,
      start_after: "0",
    },
  });
  if (!tokens || !tokens?.length) {
    throw new Error("NFT is empty");
  }
  return tokens;
};
export const getTokensInfoFromContract = async (client, accountAddress) => {
  const tokens = await getTokens(client, accountAddress);
  let tokensInfoPromise: Promise<any>[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const qsContract = await client.queryContractSmart(contractAddress, {
      nft_info: {
        token_id: tokens[i],
      },
    });
    tokensInfoPromise.push(qsContract);
  }
  if (!tokensInfoPromise?.length) {
    throw new Error("NFT is empty");
  }
  const tokensInfo: SoulboundNftInfoResponse[] = await Promise.all(
    tokensInfoPromise
  );
  if (!tokensInfo?.length) {
    throw new Error("NFT is empty");
  }
  return tokensInfo;
};
