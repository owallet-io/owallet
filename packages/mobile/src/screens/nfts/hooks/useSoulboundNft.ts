import { SoulboundNftInfoResponse } from '@src/screens/home/types';
import { useStore } from '@src/stores';

import React, { useEffect, useRef, useState } from 'react';
import * as cosmwasm from '@cosmjs/cosmwasm-stargate';
export const useSoulbound = (
  chainId,
  account,
  rpc
): {
  tokenIds: String[];
  soulboundNft: SoulboundNftInfoResponse[];
  isLoading: boolean;
} => {
  const [state, setState] = useState<{
    soulboundNft: SoulboundNftInfoResponse[];
    loading: boolean;
  }>({
    soulboundNft: [],
    loading: true
  });
const contractAddress = "orai15g3lhqtsdhsjr2qzhtrc06jfshyuaegmf75rn5jf3ql3u8lc4l2sje4xpu";
  const tokenIds = useRef([]);

  useEffect(() => {
    getAllToken();
  }, [chainId, rpc, account.bech32Address, account.evmosHexAddress]);
  const getAllToken = async () => {
    setState((state) => ({
      soulboundNft: [],
      loading: true
    }));
    const owallet = await account.getOWallet();

    if (!owallet) {
      throw new Error("Can't get the owallet API");
    }
    const wallet = owallet.getOfflineSigner(chainId);

    const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(
      rpc,
      wallet
    );

    let tokensInfoPromise: Promise<any>[] = [];
    try {
      const { tokens } = await client.queryContractSmart(
        contractAddress,
        {
          tokens: {
            limit: 10,
            owner: account.bech32Address.toString(),
            start_after: '0'
          }
        }
      );
      if (!tokens || !tokens?.length) {
        setState((state) => ({
          soulboundNft: [],
          loading: false
        }));
        tokenIds.current = [];
        throw new Error('NFT is empty');
      }
      tokenIds.current = tokens;
      for (let i = 0; i < tokens.length; i++) {
        const qsContract = client.queryContractSmart(
          contractAddress,
          {
            nft_info: {
              token_id: tokens[i]
            }
          }
        );
        tokensInfoPromise.push(qsContract);
      }
      if (!tokensInfoPromise?.length) {
        setState((state) => ({
          soulboundNft: [],
          loading: false
        }));
        tokenIds.current = [];
        throw new Error('NFT is empty');
      }
      const tokensInfo: SoulboundNftInfoResponse[] = await Promise.all(
        tokensInfoPromise
      );
      if (!tokensInfo?.length) {
        setState((state) => ({
          soulboundNft: [],
          loading: false
        }));
        throw new Error('NFT is empty');
      }
      setState((state) => ({
        soulboundNft: tokensInfo,
        loading: false
      }));
    } catch (error) {
      console.log('error: ', error);
      setState((state) => ({
        soulboundNft: [],
        loading: false
      }));
    }
  };
  return {
    tokenIds: tokenIds.current,
    soulboundNft: state.soulboundNft,
    isLoading: state.loading
  };
};
