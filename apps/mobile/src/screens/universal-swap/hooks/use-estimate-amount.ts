import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import {
  BigDecimal,
  calculateMinReceive,
  CoinGeckoPrices,
  CW20_DECIMALS,
  network,
  toAmount,
  TokenItemType
} from '@oraichain/oraidex-common';
import { OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';
import { UniversalSwapHelper } from '@oraichain/oraidex-universal-swap';
import { ChainIdEnum, fetchTokenInfos, toDisplay } from '@owallet/common';
import { useStore } from '@src/stores';
import { isNegative } from '@src/utils/helper';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getRemoteDenom } from '../helpers';
import { useRelayerFeeToken, useTokenFee } from './use-relayer-fees';

export const SIMULATE_INIT_AMOUNT = 1;

export const getRouterConfig = (options?: {
  path?: string;
  protocols?: string[];
  dontAllowSwapAfter?: string[];
  maxSplits?: number;
  ignoreFee?: boolean;
}) => {
  return {
    url: 'https://osor.oraidex.io',
    path: options?.path ?? '/smart-router/alpha-router',
    protocols: options?.protocols ?? ['Oraidex', 'OraidexV3'],
    dontAllowSwapAfter: options?.dontAllowSwapAfter ?? ['Oraidex', 'OraidexV3'],
    maxSplits: options?.maxSplits,
    ignoreFee: options?.ignoreFee ?? false
  };
};

/**
 * Simulate token fee between fromToken & toToken
 * @param originalFromToken
 * @param originalToToken
 * @param fromToken
 * @param toToken
 * @param toToken
 * @param fromAmountToken
 * @param prices
 * @param userSlippage
 * @param setSwapAmount
 * @param handleErrorSwap
 * @param client
 * @param initAmount
 * @param simulateOption
 * @returns
 */
const useEstimateAmount = (
  originalFromToken: TokenItemType,
  originalToToken: TokenItemType,
  fromToken: TokenItemType,
  toToken: TokenItemType,
  fromAmountToken: number,
  prices: CoinGeckoPrices<string>,
  userSlippage: number,
  client: SigningCosmWasmClient,
  setSwapAmount: Function,
  handleErrorSwap: Function,
  simulateOption?: {
    useAlphaSmartRoute?: boolean;
    useIbcWasm?: boolean;
    useAlphaIbcWasm?: boolean;
    isAvgSimulate?: boolean;
    path?: string;
    protocols?: string[];
    dontAllowSwapAfter?: string[];
    maxSplits?: number;
    ignoreFee?: boolean;
  }
) => {
  const { chainStore, priceStore } = useStore();
  const [amountLoading, setAmountLoading] = useState(false);
  const [isWarningSlippage, setIsWarningSlippage] = useState(false);
  const [impactWarning, setImpactWarning] = useState(0);
  const [toAmountTokenString, setToAmountToken] = useState('0');
  const [minimumReceive, setMininumReceive] = useState(0);
  const [routersSwapData, setRoutersSwapData] = useState(null);
  const [simulateData, setSimulateData] = useState(null);
  const [ratio, setRatio] = useState(null);

  const chainInfo = chainStore.getChain(ChainIdEnum.Oraichain);
  const [isAvgSimulate, setIsAvgSimulate] = useState({
    tokenFrom: originalFromToken.coinGeckoId,
    tokenTo: originalToToken.coinGeckoId,
    status: false
  });

  const {
    relayerFee,
    relayerFeeInOraiToAmount: relayerFeeToken,
    relayerFeeInOraiToDisplay: relayerFeeDisplay
  } = useRelayerFeeToken(originalFromToken, originalToToken, client);

  const remoteTokenDenomFrom = getRemoteDenom(originalFromToken);
  const remoteTokenDenomTo = getRemoteDenom(originalToToken);
  const fromTokenFee = useTokenFee(remoteTokenDenomFrom, client, fromToken.chainId, toToken.chainId);
  const toTokenFee = useTokenFee(remoteTokenDenomTo, client, fromToken.chainId, toToken.chainId);

  const fiat = priceStore.defaultVsCurrency;

  const price = priceStore.getPrice(chainInfo?.stakeCurrency?.coinGeckoId, fiat);

  const totalRelayerFee = Number(relayerFeeDisplay.toString()) * price;

  useEffect(() => {
    const { tokenFrom: currentFrom, tokenTo: currentTo, status: currentStatus } = isAvgSimulate;
    const { coinGeckoId: fromTokenId } = originalFromToken;
    const { coinGeckoId: toTokenId } = originalToToken;

    const shouldUpdate = currentFrom !== fromTokenId || currentTo !== toTokenId;

    if (shouldUpdate) {
      setIsAvgSimulate({
        tokenFrom: fromTokenId,
        tokenTo: toTokenId,
        status: false
      });
    }

    if (currentStatus || !ratio?.amount) return;

    setIsAvgSimulate({
      tokenFrom: fromTokenId,
      tokenTo: toTokenId,
      status: true
    });
  }, [ratio, originalFromToken, originalToToken]);

  const {
    data: [fromTokenInfoData, toTokenInfoData]
  } = useQuery({
    queryKey: ['token-infos', fromToken, toToken],
    queryFn: () => fetchTokenInfos([fromToken, toToken], client),
    initialData: []
  });

  const getRouterClient = () => new OraiswapRouterQueryClient(client, network.router);

  const getSimulateSwap = async (initAmount = fromAmountToken) => {
    setAmountLoading(true);
    if (client) {
      const routerClient = getRouterClient();

      try {
        const data = await UniversalSwapHelper.handleSimulateSwap({
          originalFromInfo: originalFromToken,
          originalToInfo: originalToToken,
          originalAmount: initAmount,
          routerClient,
          routerOption: {
            useAlphaIbcWasm: simulateOption?.useAlphaIbcWasm,
            useIbcWasm: simulateOption?.useIbcWasm
          },
          routerConfig: getRouterConfig(simulateOption)
        });
        setAmountLoading(false);
        setImpactWarning(0);
        return data;
      } catch (err) {
        console.error('Error in getSimulateSwap:', err);
        setAmountLoading(false);
      }
    }
  };

  function caculateImpactWarning(data, fromAmountToken, ratio, tokenInfos) {
    const { usdPriceShowFrom, usdPriceShowTo } = tokenInfos;

    let impactWarning = 0;
    if (Number(usdPriceShowFrom) && Number(usdPriceShowTo)) {
      // const calculateImpactPrice = new BigDecimal(usdPriceShowFrom).sub(usdPriceShowTo).toNumber();
      // if (isNegative(calculateImpactPrice)) return impactWarning;
      // return new BigDecimal(calculateImpactPrice).div(usdPriceShowFrom).mul(100).toNumber();
    }

    const isValidValue = value => value && value !== '';
    const isImpactPrice =
      isValidValue(fromAmountToken) &&
      isValidValue(data?.displayAmount) &&
      isValidValue(ratio?.amount) &&
      isValidValue(simulateData?.displayAmount) &&
      isValidValue(ratio?.displayAmount);

    if (isImpactPrice) {
      const calculateImpactPrice = new BigDecimal(data.displayAmount)
        .div(fromAmountToken)
        .div(data.displayAmount)
        .mul(100)
        .toNumber();

      if (calculateImpactPrice) impactWarning = calculateImpactPrice;
    }
    return impactWarning;
  }

  const calculateMinimumReceive = (
    data,
    fromAmountToken,
    ratio,
    fromTokenInfoData,
    userSlippage,
    originalFromToken
  ) => {
    const fromAmountTokenBalance =
      fromTokenInfoData &&
      toAmount(fromAmountToken, originalFromToken?.decimals || fromTokenInfoData?.decimals || CW20_DECIMALS);
    const isAverageRatio = ratio && ratio.amount;
    const minimumReceive =
      isAverageRatio && fromAmountTokenBalance
        ? calculateMinReceive(
            new BigDecimal(ratio.amount).div(1).toString(),
            fromAmountTokenBalance.toString(),
            userSlippage,
            originalFromToken.decimals
          )
        : '0';
    return minimumReceive;
  };

  const estimateAverageRatio = async () => {
    const data = await getSimulateSwap(1);
    setRatio(data);
  };

  const estimateSwapAmount = async () => {
    setAmountLoading(true);
    try {
      const data = await getSimulateSwap();

      const defaultRouterSwap = { amount: '0', displayAmount: 0, routes: [] };
      const routersSwapData =
        fromAmountToken && data ? { ...data, routes: data?.routes?.routes ?? [] } : defaultRouterSwap;

      const usdPriceShowFrom = (prices?.[originalFromToken?.coinGeckoId] * fromAmountToken).toFixed(6);
      const usdPriceShowTo = (prices?.[originalToToken?.coinGeckoId] * data?.displayAmount).toFixed(6);

      const impactWarning = caculateImpactWarning(data, fromAmountToken, ratio, { usdPriceShowFrom, usdPriceShowTo });

      setImpactWarning(impactWarning);
      setRoutersSwapData(routersSwapData);

      const minimumReceive = calculateMinimumReceive(
        data,
        fromAmountToken,
        ratio,
        fromTokenInfoData,
        userSlippage,
        originalFromToken
      );
      const isWarningSlippage = +minimumReceive > +data?.amount;

      const simulateDisplayAmount = data?.displayAmount || 0;
      const bridgeTokenFee =
        simulateDisplayAmount && (fromTokenFee || toTokenFee)
          ? new BigDecimal(simulateDisplayAmount)
              .mul(fromTokenFee)
              .add(new BigDecimal(simulateDisplayAmount).mul(toTokenFee))
              .div(100)
              .toNumber()
          : 0;

      const minimumReceiveDisplay = simulateDisplayAmount
        ? new BigDecimal(
            simulateDisplayAmount - (simulateDisplayAmount * userSlippage) / 100 - relayerFee - bridgeTokenFee
            //  - totalRelayerFee
          ).toNumber()
        : 0;

      setMininumReceive(minimumReceiveDisplay);
      if (data) {
        setIsWarningSlippage(isWarningSlippage);
        // setToAmountToken((Number(data.amount) - Number(totalRelayerFee)).toString());
        setToAmountToken(Number(data.amount).toString());
        // setSwapAmount([fromAmountToken, Number(data.displayAmount) - Number(totalRelayerFee)]);
        setSwapAmount([fromAmountToken, Number(data.displayAmount)]);

        setRatio({
          ...data,
          amount: Math.floor(Number(data.amount) / fromAmountToken),
          displayAmount: Number(data.displayAmount) / fromAmountToken
        });
      }
      setSimulateData(data);
      setAmountLoading(false);
    } catch (error) {
      console.error('Error in estimateSwapAmount:', error);
      setMininumReceive(0);
      setAmountLoading(false);
      handleErrorSwap(error?.message || error?.ex?.message);
    }
  };

  useEffect(() => {
    setMininumReceive(0);
    if (fromAmountToken > 0 && isAvgSimulate.status) {
      setSwapAmount([fromAmountToken, 0]);
      estimateSwapAmount();
    } else {
      setSwapAmount([0, 0]);
    }
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, fromAmountToken]);

  useEffect(() => {
    estimateAverageRatio();
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, client]);

  useEffect(() => {
    if (Number(fromAmountToken) <= 0) {
      setImpactWarning(0);
    }
  }, [fromAmountToken]);

  return {
    minimumReceive,
    isWarningSlippage,
    ratio,
    amountLoading,
    estimateAverageRatio,
    toAmountTokenString,
    relayerFeeAmount: totalRelayerFee.toFixed(6),
    relayerFeeToken,
    relayerFeeDisplay,
    impactWarning,
    routersSwapData,
    simulateData
  };
};

export default useEstimateAmount;
