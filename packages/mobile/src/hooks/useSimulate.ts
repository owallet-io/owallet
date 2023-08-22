import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { TokenItemType } from '@src/screens/universal-swap/config/bridgeTokens';
import { handleSimulateSwap } from '@src/screens/universal-swap/helper';
import { toAmount, toDisplay } from '@src/screens/universal-swap/libs/utils';
import { TokenInfo } from '@src/screens/universal-swap/types/token';
import { useEffect, useState } from 'react';
import { CWStargateType } from './use-load-tokens';
import { CWStargate } from '@src/common/cw-stargate';

/**
 * Simulate ratio between fromToken & toToken
 * @param cwStargate
 * @param fromTokenInfoData
 * @param toTokenInfoData
 * @param initAmount
 * @returns
 */
export const useSimulate = (
  cwStargate: CWStargateType,
  fromTokenInfoData: TokenInfo,
  toTokenInfoData: TokenInfo,
  originalFromTokenInfo: TokenItemType,
  originalToTokenInfo: TokenItemType,
  initAmount?: number
) => {
  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([
    initAmount || 0,
    0
  ]);

  const [simulateData, setSimulateData] = useState<any>();

  const getSimulateSwap = async () => {
    const client = await CWStargate.init(
      cwStargate.account,
      cwStargate.chainId,
      cwStargate.rpc
    );
    const data = await handleSimulateSwap(
      {
        fromInfo: fromTokenInfoData!,
        toInfo: toTokenInfoData!,
        originalFromInfo: originalFromTokenInfo,
        originalToInfo: originalToTokenInfo,
        amount: toAmount(
          fromAmountToken,
          fromTokenInfoData!.decimals
        ).toString()
      },
      client
    );
    setSimulateData(data);
  };

  useEffect(() => {
    getSimulateSwap();
  }, []);

  useEffect(() => {
    setSwapAmount([
      fromAmountToken,
      toDisplay(
        simulateData?.amount,
        fromTokenInfoData?.decimals,
        toTokenInfoData?.decimals
      )
    ]);
  }, [simulateData, fromAmountToken, fromTokenInfoData, toTokenInfoData]);

  return { simulateData, fromAmountToken, toAmountToken, setSwapAmount };
};
