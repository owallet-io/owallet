import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  BigDecimal,
  calculateMinReceive,
  CW20_DECIMALS,
  network,
  oraichainTokens,
  toAmount,
  toDisplay,
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
export const useEstimateAmount = (
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
  const [relayerFeeAmount, setRelayerFeeAmount] = useState<number>(0);
  const [routersSwapData, setRoutersSwapData] = useState<any>(null);
  const [simulateData, setSimulateData] = useState<any>(null);

  const [ratio, setRatio] = useState(null);

  const {
    data: [fromTokenInfoData, toTokenInfoData],
  } = useQuery({
    queryKey: ["token-infos", fromToken, toToken],
    queryFn: () => fetchTokenInfos([fromToken!, toToken!], client),
    ...{
      initialData: [],
    },
  });

  const getSimulateSwap = async (initAmount?) => {
    setAmountLoading(true);
    if (client) {
      const routerClient = new OraiswapRouterQueryClient(
        client,
        network.router
      );

      try {
        const data = await handleSimulateSwap({
          originalFromInfo: originalFromToken,
          originalToInfo: originalToToken,
          originalAmount: initAmount ?? fromAmountToken,
          routerClient,
          routerOption: {
            useAlphaSmartRoute: simulateOption?.useAlphaSmartRoute,
          },
          urlRouter: {
            url: "https://router.oraidex.io",
            path: "/smart-router/alpha-router",
          },
        });

        setAmountLoading(false);

        return data;
      } catch (err) {
        console.log("err getSimulateSwap", err);
      }
    }
  };

  const { relayerFee, relayerFeeInOraiToAmount: relayerFeeToken } =
    useRelayerFeeToken(originalFromToken, originalToToken, client);
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

  const isFromBTC = originalFromToken.coinGeckoId === "bitcoin";
  const INIT_SIMULATE_NOUGHT_POINT_OH_ONE_AMOUNT = 0.00001;
  let INIT_AMOUNT = 1;
  if (isFromBTC) INIT_AMOUNT = INIT_SIMULATE_NOUGHT_POINT_OH_ONE_AMOUNT;

  const convertRelayerFee = async () => {
    if (client && relayerFeeToken) {
      const routerClient = new OraiswapRouterQueryClient(
        client,
        network.router
      );
      const oraiToken = oraichainTokens.find(
        (token) => token.coinGeckoId === "oraichain-token"
      );

      const data = await handleSimulateSwap({
        originalFromInfo: oraiToken,
        originalToInfo: originalToToken,
        originalAmount: toDisplay(relayerFeeToken.toString()),
        routerClient,
        routerOption: {
          useAlphaSmartRoute: simulateOption?.useAlphaSmartRoute,
        },
        urlRouter: {
          url: "https://router.oraidex.io",
          path: "/smart-router/alpha-router",
        },
      });

      setRelayerFeeAmount(data?.displayAmount);
    } else {
      setRelayerFeeAmount(0);
    }
  };

  useEffect(() => {
    convertRelayerFee();
  }, [relayerFeeToken, originalFromToken, originalToToken, isAIRoute]);

  const estimateAverageRatio = async () => {
    const data = await getSimulateSwap(1);

    setRatio(data);
  };

  const estimateSwapAmount = async (fromAmountBalance) => {
    setAmountLoading(true);
    try {
      const data = await getSimulateSwap();

      const defaultRouterSwap = {
        amount: "0",
        displayAmount: 0,
        routes: [],
      };
      let routersSwapData = defaultRouterSwap;
      if (fromAmountToken && data) {
        routersSwapData = {
          ...data,
          //@ts-ignore
          routes: data?.routes?.routes ?? [],
        };
      }

      const isImpactPrice =
        !!fromAmountToken && !!data?.displayAmount && !!ratio?.amount;
      let impactWarning = 0;
      if (
        isImpactPrice &&
        data?.displayAmount &&
        ratio?.displayAmount &&
        simulateOption.useAlphaSmartRoute &&
        data
      ) {
        const calculateImpactPrice = new BigDecimal(data.displayAmount)
          .div(fromAmountToken)
          .div(ratio.displayAmount)
          .mul(100)
          .toNumber();

        if (calculateImpactPrice) impactWarning = 100 - calculateImpactPrice;
      }

      setImpactWarning(impactWarning);
      setRoutersSwapData(routersSwapData);

      const fromAmountTokenBalance =
        fromTokenInfoData &&
        toAmount(
          fromAmountToken,
          originalFromToken?.decimals ||
            fromTokenInfoData?.decimals ||
            CW20_DECIMALS
        );

      const isAverageRatio = ratio && ratio.amount;
      const isSimulateDataDisplay = data && data.displayAmount;
      const minimumReceive =
        isAverageRatio && fromAmountTokenBalance
          ? calculateMinReceive(
              new BigDecimal(ratio.amount).div(INIT_AMOUNT).toString(),
              fromAmountTokenBalance.toString(),
              userSlippage,
              originalFromToken.decimals
            )
          : "0";

      const isWarningSlippage = +minimumReceive > +data?.amount;
      const simulateDisplayAmount =
        data && data.displayAmount ? data.displayAmount : 0;
      const bridgeTokenFee =
        simulateDisplayAmount && (fromTokenFee || toTokenFee)
          ? new BigDecimal(
              new BigDecimal(simulateDisplayAmount).mul(fromTokenFee)
            )
              .add(new BigDecimal(simulateDisplayAmount).mul(toTokenFee))
              .div(100)
              .toNumber()
          : 0;

      const minimumReceiveDisplay = isSimulateDataDisplay
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
        setSwapAmount([fromAmountBalance, Number(data.displayAmount)]);
      }
      setSimulateData(data);
      setAmountLoading(false);
    } catch (error) {
      console.log("error", error);
      setMininumReceive(0);
      setAmountLoading(false);
      handleErrorSwap(error?.message ?? error?.ex?.message);
    }
  };

  useEffect(() => {
    setMininumReceive(0);
    if (fromAmountToken > 0) {
      setSwapAmount([fromAmountToken, 0]);
      estimateSwapAmount(fromAmountToken);
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
    relayerFeeAmount,
    relayerFeeToken,
    impactWarning,
    routersSwapData,
    simulateData,
  };
};
