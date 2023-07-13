
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
} => {
  const [soulboundNft, setSoulboundNft] = useState<SoulboundNftInfoResponse[]>(
    []
  );
  const tokenIds = useRef([]);
  
  useEffect(() => {
    getAllToken();
  }, [chainId, rpc, account.bech32Address, account.evmosHexAddress]);
  const getAllToken = async () => {
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
        'orai1wa7ruhstx6x35td5kc60x69a49enw8f2rwlr8a7vn9kaw9tmgwqqt5llpe',
        {
          tokens: {
            limit: 10,
            owner: account.bech32Address.toString(),
            start_after: '0'
          }
        }
      );
      if (!tokens || !tokens?.length) {
        setSoulboundNft([]);
        tokenIds.current = [];
        throw new Error('NFT is empty');
      }
      tokenIds.current = tokens;
      for (let i = 0; i < tokens.length; i++) {
        const qsContract = client.queryContractSmart(
          'orai1wa7ruhstx6x35td5kc60x69a49enw8f2rwlr8a7vn9kaw9tmgwqqt5llpe',
          {
            nft_info: {
              token_id: tokens[i]
            }
          }
        );
        tokensInfoPromise.push(qsContract);
      }
      if (!tokensInfoPromise?.length) {
        setSoulboundNft([]);
        tokenIds.current = [];
        throw new Error('NFT is empty');
      }
      const tokensInfo: SoulboundNftInfoResponse[] = await Promise.all(
        tokensInfoPromise
      );
      if (!tokensInfo?.length) {
        setSoulboundNft([]);
        throw new Error('NFT is empty');
      }
      setSoulboundNft(tokensInfo);
    } catch (error) {
      console.log('error: ', error);
      setSoulboundNft([]);
    }
  };
  return {
    tokenIds: tokenIds.current,
    soulboundNft
  };
};
