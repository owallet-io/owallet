import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  BigDecimal,
  calculateMinReceive,
  CW20_DECIMALS,
  network,
  toAmount,
  TokenItemType,
} from "@oraichain/oraidex-common";
import { OraiswapRouterQueryClient } from "@oraichain/oraidex-contracts-sdk";
import { handleSimulateSwap } from "@oraichain/oraidex-universal-swap";
import { fetchTokenInfos } from "@owallet/common";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getRemoteDenom } from "../helpers";
import { useRelayerFeeToken, useTokenFee } from "./use-relayer-fees";

/**
 * Simulate token fee between fromToken & toToken
 * @param originalFromToken
 * @param originalToToken
 * @param fromToken
 * @param toToken
 * @param toToken
 * @param fromAmountToken
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
  userSlippage: number,
  client: SigningCosmWasmClient,
  setSwapAmount: Function,
  handleErrorSwap: Function,
  simulateOption?: {
    useAlphaSmartRoute?: boolean;
  },
  isAIRoute?: boolean
) => {
  const [amountLoading, setAmountLoading] = useState(false);
  const [isWarningSlippage, setIsWarningSlippage] = useState(false);
  const [impactWarning, setImpactWarning] = useState(0);
  const [toAmountTokenString, setToAmountToken] = useState("0");
  const [minimumReceive, setMininumReceive] = useState(0);
  const [routersSwapData, setRoutersSwapData] = useState(null);
  const [simulateData, setSimulateData] = useState(null);
  const [ratio, setRatio] = useState(null);

  const {
    data: [fromTokenInfoData, toTokenInfoData],
  } = useQuery({
    queryKey: ["token-infos", fromToken, toToken],
    queryFn: () => fetchTokenInfos([fromToken, toToken], client),
    initialData: [],
  });

  const getRouterClient = () =>
    new OraiswapRouterQueryClient(client, network.router);

  const getSimulateSwap = async (initAmount = fromAmountToken) => {
    setAmountLoading(true);
    if (client) {
      const routerClient = getRouterClient();
      try {
        const data = await handleSimulateSwap({
          originalFromInfo: originalFromToken,
          originalToInfo: originalToToken,
          originalAmount: initAmount,
          routerClient,
          routerOption: {
            useAlphaSmartRoute: simulateOption?.useAlphaSmartRoute,
          },
          optionRouter: {
            url: "https://osor.oraidex.io",
            path: "/smart-router/alpha-router",
          },
        });
        setAmountLoading(false);
        return data;
      } catch (err) {
        console.error("Error in getSimulateSwap:", err);
        setAmountLoading(false);
      }
    }
  };

  const calculateImpactWarning = (data, fromAmountToken, ratio) => {
    if (fromAmountToken && data?.displayAmount && ratio?.amount) {
      const calculateImpactPrice = new BigDecimal(data.displayAmount)
        .div(fromAmountToken)
        .div(ratio.displayAmount)
        .mul(100)
        .toNumber();
      return 100 - calculateImpactPrice;
    }
    return 0;
  };

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
      toAmount(
        fromAmountToken,
        originalFromToken?.decimals ||
          fromTokenInfoData?.decimals ||
          CW20_DECIMALS
      );
    const isAverageRatio = ratio && ratio.amount;
    const minimumReceive =
      isAverageRatio && fromAmountTokenBalance
        ? calculateMinReceive(
            new BigDecimal(ratio.amount).div(1).toString(),
            fromAmountTokenBalance.toString(),
            userSlippage,
            originalFromToken.decimals
          )
        : "0";
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
      const defaultRouterSwap = { amount: "0", displayAmount: 0, routes: [] };
      const routersSwapData =
        fromAmountToken && data
          ? { ...data, routes: data?.routes?.routes ?? [] }
          : defaultRouterSwap;

      const impactWarning = calculateImpactWarning(
        data,
        fromAmountToken,
        ratio
      );
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
            simulateDisplayAmount -
              (simulateDisplayAmount * userSlippage) / 100 -
              relayerFee -
              bridgeTokenFee
          ).toNumber()
        : 0;

      setMininumReceive(minimumReceiveDisplay);
      if (data) {
        setIsWarningSlippage(isWarningSlippage);
        setToAmountToken(data.amount);
        setSwapAmount([fromAmountToken, Number(data.displayAmount)]);
      }
      setSimulateData(data);
      setAmountLoading(false);
    } catch (error) {
      console.error("Error in estimateSwapAmount:", error);
      setMininumReceive(0);
      setAmountLoading(false);
      handleErrorSwap(error?.message || error?.ex?.message);
    }
  };

  const {
    relayerFee,
    relayerFeeInOraiToAmount: relayerFeeToken,
    relayerFeeInOraiToDisplay: relayerFeeDisplay,
  } = useRelayerFeeToken(originalFromToken, originalToToken, client);

  const remoteTokenDenomFrom = getRemoteDenom(originalFromToken);
  const remoteTokenDenomTo = getRemoteDenom(originalToToken);
  const fromTokenFee = useTokenFee(
    remoteTokenDenomFrom,
    client,
    fromToken.chainId,
    toToken.chainId
  );
  const toTokenFee = useTokenFee(
    remoteTokenDenomTo,
    client,
    fromToken.chainId,
    toToken.chainId
  );

  useEffect(() => {
    setMininumReceive(0);
    if (fromAmountToken > 0) {
      setSwapAmount([fromAmountToken, 0]);
      estimateSwapAmount();
    } else {
      setSwapAmount([0, 0]);
    }
  }, [
    originalFromToken,
    toTokenInfoData,
    fromTokenInfoData,
    originalToToken,
    fromAmountToken,
    isAIRoute,
  ]);

  useEffect(() => {
    estimateAverageRatio();
  }, [
    originalFromToken,
    toTokenInfoData,
    fromTokenInfoData,
    originalToToken,
    client,
    isAIRoute,
  ]);

  return {
    minimumReceive,
    isWarningSlippage,
    ratio,
    amountLoading,
    estimateAverageRatio,
    toAmountTokenString,
    relayerFeeAmount: relayerFeeDisplay,
    relayerFeeToken,
    relayerFeeDisplay,
    impactWarning,
    routersSwapData,
    simulateData,
  };
};

export default useEstimateAmount;
