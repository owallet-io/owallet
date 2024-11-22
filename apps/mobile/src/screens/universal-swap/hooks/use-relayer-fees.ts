import { useEffect, useState } from 'react';
import {
  NetworkChainId,
  TokenItemType,
  network,
  oraichainTokens,
  toDisplay,
  toAmount,
  BigDecimal,
  ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX,
  ORAI_BRIDGE_EVM_DENOM_PREFIX,
  IBC_WASM_CONTRACT
} from '@oraichain/oraidex-common';
import { UniversalSwapHelper, isEvmNetworkNativeSwapSupported } from '@oraichain/oraidex-universal-swap';
import { ConfigResponse } from '@oraichain/common-contracts-sdk/build/CwIcs20Latest.types';
import { CwIcs20LatestQueryClient } from '@oraichain/common-contracts-sdk';
import { useQuery } from '@tanstack/react-query';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';

export async function fetchFeeConfig(client): Promise<ConfigResponse> {
  const ics20Contract = new CwIcs20LatestQueryClient(client, IBC_WASM_CONTRACT);
  try {
    return await ics20Contract.config();
  } catch (error) {
    console.log(`Error when query fee config using oracle: ${error}`);
    return;
  }
}

export function useTokenFee(
  remoteTokenDenom: string,
  client: SigningCosmWasmClient,
  fromChainId?: NetworkChainId,
  toChainId?: NetworkChainId
) {
  const [bridgeFee, setBridgeFee] = useState(0);

  const getBridgeFee = async () => {
    let fee = 0;
    if (!remoteTokenDenom) return;

    const feeConfigs = await fetchFeeConfig(client);
    if (feeConfigs) {
      // since we have supported evm swap, tokens that are on the same supported evm chain id
      // don't have any token fees (because they are not bridged to Oraichain)
      if (isEvmNetworkNativeSwapSupported(fromChainId) && fromChainId === toChainId) return;
      const { token_fees: tokenFees } = feeConfigs;

      const isNativeEth = remoteTokenDenom === 'eth';
      const isNativeBnb = remoteTokenDenom === 'bnb';
      const tokenFee = tokenFees.find(
        tokenFee =>
          tokenFee.token_denom === remoteTokenDenom ||
          (isNativeEth && tokenFee.token_denom.includes(ORAI_BRIDGE_EVM_ETH_DENOM_PREFIX)) ||
          (isNativeBnb && tokenFee.token_denom.includes(ORAI_BRIDGE_EVM_DENOM_PREFIX))
      );
      if (tokenFee) fee = (tokenFee.ratio.nominator / tokenFee.ratio.denominator) * 100;

      setBridgeFee(fee);
    }
  };

  useEffect(() => {
    getBridgeFee();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteTokenDenom]);
  return bridgeFee;
}

export const useRelayerFeeToken = (
  originalFromToken: TokenItemType,
  originalToToken: TokenItemType,
  client: SigningCosmWasmClient
) => {
  const [relayerFeeInOrai, setRelayerFeeInOrai] = useState(0);
  const [relayerFee, setRelayerFeeAmount] = useState(0);

  const fetchRelayerrFee = async () => {
    if (client) {
      try {
        const routerClient = new OraiswapRouterQueryClient(client, network.router);

        const oraiToken = oraichainTokens.find(token => token.coinGeckoId === 'oraichain-token');
        const data = await UniversalSwapHelper.handleSimulateSwap({
          originalFromInfo: oraiToken,
          originalToInfo: originalToToken,
          originalAmount: relayerFeeInOrai,
          routerClient
        });

        return data as any;
      } catch (err) {
        console.log('err getSimulateSwap', err);
      }
    }
  };

  const { data: relayerFeeAmount } = useQuery({
    queryKey: ['simulate-relayer-data', originalFromToken, originalToToken, relayerFeeInOrai],
    queryFn: () => fetchRelayerrFee(),
    ...{
      enabled: !!originalFromToken && !!originalToToken && relayerFeeInOrai > 0,
      initialData: []
    }
  });

  // get relayer fee in token, by simulate orai vs to token.
  useEffect(() => {
    if (relayerFeeAmount) setRelayerFeeAmount(new BigDecimal(relayerFeeAmount?.displayAmount || 0).toNumber());
  }, [relayerFeeAmount]);

  const getRelayerFee = async () => {
    if (!originalFromToken || !originalToToken) return;
    const feeConfigs = await fetchFeeConfig(client);
    if (feeConfigs) {
      if (
        isEvmNetworkNativeSwapSupported(originalFromToken.chainId) &&
        originalFromToken.chainId === originalToToken.chainId
      ) {
        setRelayerFeeAmount(0);
        setRelayerFeeInOrai(0);
        return;
      }
      const { relayer_fees: relayerFees } = feeConfigs;
      const relayerFeeInOrai = relayerFees.reduce((acc, cur) => {
        const isFromToPrefix = cur.prefix === originalFromToken.prefix || cur.prefix === originalToToken.prefix;
        if (isFromToPrefix) return +cur.amount + acc;
        return acc;
      }, 0);

      if (!relayerFeeInOrai) {
        setRelayerFeeAmount(0);
        setRelayerFeeInOrai(0);
        return;
      }
      setRelayerFeeInOrai(toDisplay(relayerFeeInOrai.toString()));
    }
  };

  // get relayer fee in ORAI
  useEffect(() => {
    getRelayerFee();
  }, [originalFromToken, originalToToken]);

  return {
    relayerFee,
    relayerFeeInOraiToDisplay: relayerFeeInOrai,
    relayerFeeInOraiToAmount: toAmount(relayerFeeInOrai)
  };
};
