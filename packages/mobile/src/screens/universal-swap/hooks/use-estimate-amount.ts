import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  BigDecimal,
  calculateMinReceive,
  ChainIdEnum,
  network,
  oraichainTokens,
  toAmount,
  toDisplay,
  TokenItemType,
} from "@oraichain/oraidex-common";
import { OraiswapRouterQueryClient } from "@oraichain/oraidex-contracts-sdk";
import { handleSimulateSwap } from "@oraichain/oraidex-universal-swap";
import { fetchTokenInfos } from "@owallet/common";
import { useRelayerFee } from "@owallet/hooks";
import { useStore } from "@src/stores";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

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
  handleErrorSwap: Function
) => {
  const { accountStore } = useStore();
  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const [amountLoading, setAmountLoading] = useState(false);
  const [isWarningSlippage, setIsWarningSlippage] = useState(false);
  const [impactWarning, setImpactWarning] = useState(0);
  const [toAmountTokenString, setToAmountToken] = useState("0");
  const [minimumReceive, setMininumReceive] = useState(0);
  const [relayerFeeAmount, setRelayerFeeAmount] = useState<number>(0);
  const [routersSwapData, setRoutersSwapData] = useState<any>(null);
  const [simulateData, setSimulateData] = useState<any>(null);

  const [ratio, setRatio] = useState(null);
  const isFromBTC = originalFromToken.coinGeckoId === "bitcoin";

  const INIT_SIMULATE_NOUGHT_POINT_OH_ONE_AMOUNT = 0.00001;

  let INIT_AMOUNT = 1;
  if (isFromBTC) INIT_AMOUNT = INIT_SIMULATE_NOUGHT_POINT_OH_ONE_AMOUNT;

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
    if (client) {
      const routerClient = new OraiswapRouterQueryClient(
        client,
        network.router
      );
      let simulateAmount = INIT_AMOUNT;
      if (fromAmountToken > 0) {
        simulateAmount = fromAmountToken;
      }

      try {
        const data = await handleSimulateSwap({
          originalFromInfo: originalFromToken,
          originalToInfo: originalToToken,
          originalAmount: initAmount ?? simulateAmount,
          routerClient,
          useSmartRoute: true,
        });

        setAmountLoading(false);

        return data;
      } catch (err) {
        console.log("err getSimulateSwap", err);
      }
    }
  };

  const relayerFee = useRelayerFee(accountOrai);

  const relayerFeeToken = useMemo(() => {
    return relayerFee.reduce((acc, cur) => {
      if (
        originalFromToken?.chainId !== originalToToken?.chainId &&
        (cur.prefix === originalFromToken?.prefix ||
          cur.prefix === originalToToken?.prefix)
      ) {
        return +cur?.amount + acc;
      }
      return acc;
    }, 0);
  }, [relayerFee, originalFromToken, originalToToken]);

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
        // @ts-ignore
        originalFromInfo: oraiToken,
        originalToInfo: originalToToken,
        originalAmount: toDisplay(relayerFeeToken.toString()),
        routerClient,
        useSmartRoute: true,
      });

      setRelayerFeeAmount(data?.displayAmount);
    } else {
      setRelayerFeeAmount(0);
    }
  };

  useEffect(() => {
    convertRelayerFee();
  }, [relayerFeeToken, originalFromToken, originalToToken]);

  const estimateAverageRatio = async () => {
    const data = await getSimulateSwap(INIT_AMOUNT);

    setRatio(data);
  };

  const estimateSwapAmount = async (fromAmountBalance) => {
    setAmountLoading(true);
    try {
      const data = await getSimulateSwap();
      const minimumReceive = Number(
        data?.displayAmount -
          (data?.displayAmount * userSlippage) / 100 -
          relayerFeeAmount
      );

      const defaultRouterSwap = {
        amount: "0",
        displayAmount: 0,
        routes: [],
      };
      let routersSwapData = defaultRouterSwap;

      const fromTochainIdIsOraichain =
        originalFromToken.chainId === "Oraichain" &&
        originalToToken.chainId === "Oraichain";
      if (fromAmountToken && data && fromTochainIdIsOraichain) {
        routersSwapData = {
          ...data,
          //@ts-ignore
          routes: data?.routes ?? [],
        };
      }

      const isImpactPrice = fromAmountToken && data?.amount && ratio?.amount;
      let impactWarning = 0;
      if (isImpactPrice && fromTochainIdIsOraichain) {
        const caculateImpactPrice = new BigDecimal(data.amount)
          .div(toAmount(fromAmountToken, originalFromToken.decimals))
          .div(ratio.displayAmount)
          .mul(100)
          .toNumber();
        impactWarning = 100 - caculateImpactPrice;
      }

      console.log("impactWarning", impactWarning, data?.amount, ratio?.amount);

      setImpactWarning(impactWarning);
      setRoutersSwapData(routersSwapData);

      const fromAmountTokenBalance =
        fromTokenInfoData &&
        toAmount(fromAmountToken, fromTokenInfoData!.decimals);
      const warningMinimumReceive =
        ratio && ratio.amount
          ? calculateMinReceive(
              // @ts-ignore
              Math.trunc(new BigDecimal(ratio.amount) / INIT_AMOUNT).toString(),
              fromAmountTokenBalance.toString(),
              userSlippage,
              originalFromToken.decimals
            )
          : "0";

      setMininumReceive(Number(minimumReceive.toFixed(6)));
      if (data) {
        const isWarningSlippage = +warningMinimumReceive > +data.amount;

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
  ]);

  useEffect(() => {
    estimateAverageRatio();
  }, [
    originalFromToken,
    toTokenInfoData,
    fromTokenInfoData,
    originalToToken,
    client,
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
    INIT_AMOUNT,
    impactWarning,
    routersSwapData,
    simulateData,
  };
};
