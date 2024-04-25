import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import { InteractionManager, RefreshControl, View } from "react-native";
import { useStore } from "../../stores";
import { SwapBox } from "./components/SwapBox";
import { OWButton } from "@src/components/button";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { BalanceText } from "./components/BalanceText";
import { SelectNetworkModal, SelectTokenModal, SlippageModal } from "./modals/";
import {
  getTokenInfos,
  handleSaveHistory,
  HISTORY_STATUS,
  showToast,
  _keyExtract,
} from "@src/utils/helper";
import {
  DEFAULT_SLIPPAGE,
  GAS_ESTIMATION_SWAP_DEFAULT,
  ORAI,
  toDisplay,
  getBase58Address,
} from "@owallet/common";
import {
  TokenItemType,
  NetworkChainId,
  oraichainNetwork,
  toAmount,
  network,
  Networks,
  TRON_DENOM,
  BigDecimal,
  toSubAmount,
  oraichainTokens,
  getTokenOnOraichain,
  tokenMap,
} from "@oraichain/oraidex-common";
import { openLink } from "../../utils/helper";
import { feeEstimate, getTransferTokenFee } from "@owallet/common";
import {
  // handleSimulateSwap,
  // filterNonPoolEvmTokens,
  SwapDirection,
  // UniversalSwapHelper
} from "@oraichain/oraidex-universal-swap";
import { fetchTokenInfos, ChainIdEnum } from "@owallet/common";
import { calculateMinReceive } from "@oraichain/oraidex-common";
import {
  isEvmNetworkNativeSwapSupported,
  isEvmSwappable,
  isSupportedNoPoolSwapEvm,
  UniversalSwapData,
  UniversalSwapHandler,
} from "@oraichain/oraidex-universal-swap";
import { SwapCosmosWallet, SwapEvmWallet } from "./wallet";
import { styling } from "./styles";
import { BalanceType, MAX, balances } from "./types";
import { OraiswapRouterQueryClient } from "@oraichain/oraidex-contracts-sdk";
import {
  useLoadTokens,
  useCoinGeckoPrices,
  useClient,
  useRelayerFee,
  useTaxRate,
  useSwapFee,
} from "@owallet/hooks";
import { getTransactionUrl, handleErrorSwap, floatToPercent } from "./helpers";
import { useQuery } from "@tanstack/react-query";
import { Mixpanel } from "mixpanel-react-native";
import { API } from "@src/common/api";
// import { filterNonPoolEvmTokens } from "./handler/src/helper";
import { metrics } from "@src/themes";
import {
  // UniversalSwapHandler,
  UniversalSwapHelper,
} from "./handler/src";
const mixpanel = globalThis.mixpanel as Mixpanel;

const RELAYER_DECIMAL = 6; // TODO: hardcode decimal relayerFee

export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const {
    accountStore,
    universalSwapStore,
    chainStore,
    appInitStore,
    keyRingStore,
  } = useStore();
  const { colors } = useTheme();
  const { data: prices } = useCoinGeckoPrices();
  const [refreshDate, setRefreshDate] = React.useState(Date.now());
  // const [isPending, startTransition] = useTransition();

  useEffect(() => {
    appInitStore.updatePrices(prices);
  }, [prices]);
  const [counter, setCounter] = useState(0);

  const chainInfo = chainStore.getChain(ChainIdEnum.Oraichain);

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountKawaiiCosmos = accountStore.getAccount(ChainIdEnum.KawaiiCosmos);

  const [isSlippageModal, setIsSlippageModal] = useState(false);
  const [minimumReceive, setMininumReceive] = useState(0);
  const [userSlippage, setUserSlippage] = useState(DEFAULT_SLIPPAGE);
  const [swapLoading, setSwapLoading] = useState(false);
  const [amountLoading, setAmountLoading] = useState(false);
  const [isWarningSlippage, setIsWarningSlippage] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [searchTokenName, setSearchTokenName] = useState("");
  const [filteredToTokens, setFilteredToTokens] = useState(
    [] as TokenItemType[]
  );
  const [filteredFromTokens, setFilteredFromTokens] = useState(
    [] as TokenItemType[]
  );
  const [selectedChainFilter, setChainFilter] = useState(null);

  const [[fromTokenDenom, toTokenDenom], setSwapTokens] = useState<
    [string, string]
  >(["orai", "usdt"]);

  const [fromTokenFee, setFromTokenFee] = useState<number>(0);
  const [toTokenFee, setToTokenFee] = useState<number>(0);
  const [relayerFeeAmount, setRelayerFeeAmount] = useState<number>(0);

  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([0, 0]);
  const [toAmountTokenString, setToAmountToken] = useState("0");

  const [ratio, setRatio] = useState(null);

  const [balanceActive, setBalanceActive] = useState<BalanceType>(null);

  const client = useClient(accountOrai);

  const relayerFee = useRelayerFee(accountOrai);
  const taxRate = useTaxRate(accountOrai);

  const onChangeFromAmount = (amount: string | undefined) => {
    if (!amount) return setSwapAmount([0, toAmountToken]);
    setSwapAmount([parseFloat(amount), toAmountToken]);
    setBalanceActive(null);
  };

  // get token on oraichain to simulate swap amount.
  const originalFromToken = tokenMap[fromTokenDenom];
  const originalToToken = tokenMap[toTokenDenom];

  const subAmountFrom = toSubAmount(
    universalSwapStore.getAmount,
    originalFromToken
  );
  const subAmountTo = toSubAmount(
    universalSwapStore.getAmount,
    originalToToken
  );
  const fromTokenBalance = originalFromToken
    ? BigInt(universalSwapStore.getAmount?.[originalFromToken.denom] ?? "0") +
      subAmountFrom
    : BigInt(0);

  const toTokenBalance = originalToToken
    ? BigInt(universalSwapStore.getAmount?.[originalToToken.denom] ?? "0") +
      subAmountTo
    : BigInt(0);

  const onMaxFromAmount = (amount: bigint, type: string) => {
    const displayAmount = toDisplay(amount, originalFromToken?.decimals);
    let finalAmount = displayAmount;

    // hardcode fee when swap token orai
    if (fromTokenDenom === ORAI) {
      const estimatedFee = feeEstimate(
        originalFromToken,
        GAS_ESTIMATION_SWAP_DEFAULT
      );
      const fromTokenBalanceDisplay = toDisplay(
        fromTokenBalance,
        originalFromToken?.decimals
      );
      if (type === MAX) {
        finalAmount =
          estimatedFee > displayAmount ? 0 : displayAmount - estimatedFee;
      } else {
        finalAmount =
          estimatedFee > fromTokenBalanceDisplay - displayAmount
            ? 0
            : displayAmount;
      }
    }
    setSwapAmount([finalAmount, toAmountToken]);
  };

  const isEvmSwap = isEvmSwappable({
    fromChainId: originalFromToken.chainId,
    toChainId: originalToToken.chainId,
    fromContractAddr: originalFromToken.contractAddress,
    toContractAddr: originalToToken.contractAddress,
  });
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

  const { fee } = useSwapFee({
    fromToken: originalFromToken,
    toToken: originalToToken,
  });

  // if evm swappable then no need to get token on oraichain because we can swap on evm. Otherwise, get token on oraichain. If cannot find => fallback to original token
  const fromToken = isEvmSwap
    ? tokenMap[fromTokenDenom]
    : getTokenOnOraichain(tokenMap[fromTokenDenom].coinGeckoId) ??
      tokenMap[fromTokenDenom];

  const toToken = isEvmSwap
    ? tokenMap[toTokenDenom]
    : getTokenOnOraichain(tokenMap[toTokenDenom].coinGeckoId) ??
      tokenMap[toTokenDenom];

  const getTokenFee = async (
    remoteTokenDenom: string,
    fromChainId: NetworkChainId,
    toChainId: NetworkChainId,
    type: "from" | "to"
  ) => {
    // since we have supported evm swap, tokens that are on the same supported evm chain id don't have any token fees (because they are not bridged to Oraichain)
    if (
      isEvmNetworkNativeSwapSupported(fromChainId) &&
      fromChainId === toChainId
    )
      return;
    if (remoteTokenDenom) {
      let tokenFee = 0;
      const ratio = await getTransferTokenFee({ remoteTokenDenom, client });

      if (ratio) {
        tokenFee = (ratio.nominator / ratio.denominator) * 100;
      }

      if (type === "from") {
        setFromTokenFee(tokenFee);
      } else {
        setToTokenFee(tokenFee);
      }
    }
  };

  useEffect(() => {
    getTokenFee(
      originalToToken.prefix + originalToToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      "to"
    );
  }, [originalToToken, fromToken, toToken, originalToToken, client]);

  useEffect(() => {
    getTokenFee(
      originalFromToken.prefix + originalFromToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      "from"
    );
  }, [originalToToken, fromToken, toToken, originalToToken, client]);

  const {
    data: [fromTokenInfoData, toTokenInfoData],
  } = useQuery({
    queryKey: ["token-infos", fromToken, toToken],
    queryFn: () => fetchTokenInfos([fromToken!, toToken!], client),
    ...{
      initialData: [],
    },
  });

  const [isSelectFromTokenModal, setIsSelectFromTokenModal] = useState(false);
  const [isSelectToTokenModal, setIsSelectToTokenModal] = useState(false);
  const [isNetworkModal, setIsNetworkModal] = useState(false);
  const styles = styling(colors);

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async (params: {
    orai?: string;
    eth?: string;
    tron?: string;
    kwt?: string;
    tokenReload?: Array<any>;
  }) => {
    const { orai, eth, tron, kwt, tokenReload } = params;
    let loadTokenParams = {};
    try {
      const cwStargate = {
        account: accountOrai,
        chainId: ChainIdEnum.Oraichain,
        rpc: oraichainNetwork.rpc,
      };
      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: orai ?? accountOrai.bech32Address,
        metamaskAddress: eth ?? null,
        kwtAddress: kwt ?? accountKawaiiCosmos.bech32Address,
        tronAddress: tron ?? null,
        cwStargate,
        tokenReload: tokenReload?.length > 0 ? tokenReload : null,
      };

      loadTokenAmounts(loadTokenParams);
      universalSwapStore.clearTokenReload();
    } catch (error) {
      console.log("error loadTokenAmounts", error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: "danger",
      });
    }
  };

  const onFetchAmount = (
    timeoutId: NodeJS.Timeout,
    tokenReload?: Array<any>
  ) => {
    universalSwapStore.clearAmounts();
    universalSwapStore.setLoaded(false);
    if (accountOrai.isNanoLedger) {
      if (Object.keys(keyRingStore.keyRingLedgerAddresses).length > 0) {
        timeoutId = setTimeout(() => {
          handleFetchAmounts({
            orai: accountOrai.bech32Address,
            eth: keyRingStore.keyRingLedgerAddresses.eth ?? null,
            tron: keyRingStore.keyRingLedgerAddresses.trx ?? null,
            kwt: accountKawaiiCosmos.bech32Address,
            tokenReload: tokenReload?.length > 0 ? tokenReload : null,
          });
        }, 800);
      }
    } else if (
      accountOrai.bech32Address &&
      accountEth.evmosHexAddress &&
      accountTron.evmosHexAddress &&
      accountKawaiiCosmos.bech32Address
    ) {
      timeoutId = setTimeout(() => {
        handleFetchAmounts({
          orai: accountOrai.bech32Address,
          eth: accountEth.evmosHexAddress,
          tron: getBase58Address(accountTron.evmosHexAddress),
          kwt: accountKawaiiCosmos.bech32Address,
        });
      }, 1000);
    }
  };

  // useEffect(() => {
  //   let timeoutId: NodeJS.Timeout;

  //   InteractionManager.runAfterInteractions(() => {
  //     startTransition(() => {
  //       onFetchAmount(timeoutId);
  //     });
  //   });
  //   // Clean up the timeout if the component unmounts or the dependency changes
  //   return () => {
  //     if (timeoutId) clearTimeout(timeoutId);
  //   };
  // }, [accountOrai.bech32Address]);

  useEffect(() => {
    const filteredToTokens = UniversalSwapHelper.filterNonPoolEvmTokens(
      originalFromToken.chainId,
      originalFromToken.coinGeckoId,
      originalFromToken.denom,
      searchTokenName,
      SwapDirection.To
      // universalSwapStore.getAmount
    );

    setFilteredToTokens(filteredToTokens);

    const filteredFromTokens = UniversalSwapHelper.filterNonPoolEvmTokens(
      originalToToken.chainId,
      originalToToken.coinGeckoId,
      originalToToken.denom,
      searchTokenName,
      SwapDirection.From
      // universalSwapStore.getAmount
    );

    setFilteredFromTokens(filteredFromTokens);

    // TODO: need to automatically update from / to token to the correct swappable one when clicking the swap button
  }, [fromToken, toToken, toTokenDenom, fromTokenDenom]);

  // TODO: use this constant so we can temporary simulate for all pair (specifically AIRI/USDC, ORAIX/USDC), update later after migrate contract
  const isFromAiriToUsdc =
    originalFromToken.coinGeckoId === "airight" &&
    originalToToken.coinGeckoId === "usd-coin";
  const isFromOraixToUsdc =
    originalFromToken.coinGeckoId === "oraidex" &&
    originalToToken.coinGeckoId === "usd-coin";
  const isFromUsdc = originalFromToken.coinGeckoId === "usd-coin";

  const INIT_SIMULATE_AIRI_TO_USDC = 1000;
  const INIT_SIMULATE_FROM_USDC = 10;
  const INIT_AMOUNT =
    isFromAiriToUsdc || isFromOraixToUsdc
      ? INIT_SIMULATE_AIRI_TO_USDC
      : isFromUsdc
      ? INIT_SIMULATE_FROM_USDC
      : 1;

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

      const data = await UniversalSwapHelper.handleSimulateSwap({
        originalFromInfo: originalFromToken,
        originalToInfo: originalToToken,
        originalAmount: initAmount ?? simulateAmount,
        routerClient,
        useSmartRoute: true,
      });

      setAmountLoading(false);

      return data;
    }
  };

  const convertRelayerFee = async () => {
    if (client && relayerFeeToken) {
      const routerClient = new OraiswapRouterQueryClient(
        client,
        network.router
      );
      const oraiToken = oraichainTokens.find(
        (token) => token.coinGeckoId === "oraichain-token"
      );

      const data = await UniversalSwapHelper.handleSimulateSwap({
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
      estimateSwapAmount(fromAmountToken);
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

  const handleBalanceActive = (item: BalanceType) => {
    setBalanceActive(item);
  };

  const handleSaveTokenInfos = async (tokenInfos) => {
    await API.saveTokenInfos(
      {
        address: accountOrai.bech32Address,
        tokesInfos: tokenInfos,
      },
      {
        baseURL: "https://staging.owallet.dev/",
      }
    );
  };

  const handleSubmit = async () => {
    setSwapLoading(true);
    if (fromAmountToken <= 0) {
      showToast({
        message: "From amount should be higher than 0!",
        type: "danger",
      });
      setSwapLoading(false);
      return;
    }

    let evmAddress, tronAddress, cosmosAddress;
    if (
      accountOrai.isNanoLedger &&
      keyRingStore?.keyRingLedgerAddresses?.cosmos
    ) {
      cosmosAddress = keyRingStore.keyRingLedgerAddresses.cosmos;
    } else {
      if (originalFromToken.cosmosBased) {
        cosmosAddress = accountStore.getAccount(
          originalFromToken.chainId
        ).bech32Address;
      } else {
        cosmosAddress = accountOrai.bech32Address;
      }
    }

    if (accountEth.isNanoLedger && keyRingStore?.keyRingLedgerAddresses?.eth) {
      evmAddress = keyRingStore.keyRingLedgerAddresses.eth;
    } else {
      evmAddress = accountEth.evmosHexAddress;
    }

    if (accountTron.isNanoLedger && keyRingStore?.keyRingLedgerAddresses?.trx) {
      tronAddress = keyRingStore.keyRingLedgerAddresses.trx;
    } else {
      if (accountTron) {
        tronAddress = getBase58Address(accountTron.evmosHexAddress);
      }
    }

    const fromNetwork = chainStore.getChain(
      originalFromToken.chainId
    ).chainName;

    const toNetwork = chainStore.getChain(originalToToken.chainId).chainName;

    const logEvent = {
      address: accountOrai.bech32Address,
      fromToken: originalFromToken.name,
      fromAmount: `${fromAmountToken}`,
      toToken: originalToToken.name,
      toAmount: `${toAmountToken}`,
      fromNetwork,
      toNetwork,
    };

    try {
      const cosmosWallet = new SwapCosmosWallet(client);

      const isTron = Number(originalFromToken.chainId) === Networks.tron;

      const evmWallet = new SwapEvmWallet(isTron);

      const relayerFee = relayerFeeToken && {
        relayerAmount: relayerFeeToken.toString(),
        relayerDecimals: RELAYER_DECIMAL,
      };
      const smartRoutes = await UniversalSwapHelper.simulateSwapUsingSmartRoute(
        {
          fromInfo: originalFromToken,
          toInfo: originalToToken,
          amount: toAmount(
            fromAmountToken,
            originalToToken.decimals
          ).toString(),
        }
      );

      console.log("smartRoutes", smartRoutes);

      const universalSwapData: UniversalSwapData = {
        sender: {
          cosmos: cosmosAddress,
          evm: evmAddress,
          tron: tronAddress,
        },
        originalFromToken: originalFromToken,
        originalToToken: originalToToken,
        simulateAmount: toAmountTokenString,
        simulatePrice:
          ratio?.amount &&
          // @ts-ignore
          Math.trunc(new BigDecimal(ratio.amount) / INIT_AMOUNT).toString(),
        userSlippage: userSlippage,
        fromAmount: fromAmountToken,
        relayerFee,
        smartRoutes: smartRoutes.routes,
      };

      console.log("universalSwapData", universalSwapData);

      const universalSwapHandler = new UniversalSwapHandler(
        {
          ...universalSwapData,
        },
        {
          cosmosWallet,
          //@ts-ignore
          evmWallet,
        }
      );

      const result = await universalSwapHandler.processUniversalSwap();

      if (result) {
        const { transactionHash } = result;
        try {
          const historyInfos = {
            fromAddress: accountOrai.bech32Address,
            toAddress: accountOrai.bech32Address,
            hash: transactionHash,
            memo: "",
            fromAmount: fromAmountToken,
            toAmount: toAmountToken,
            value: toAmountToken,
            fee: (toAmountToken - minimumReceive).toFixed(6),
            type: HISTORY_STATUS.SWAP,
            fromToken: {
              asset: originalFromToken.name,
              chainId: originalFromToken.chainId,
            },
            toToken: {
              asset: originalToToken.name,
              chainId: originalToToken.chainId,
            },
            status: "SUCCESS",
          };

          const res = await handleSaveHistory(
            accountOrai.bech32Address,
            historyInfos
          );
        } catch (err) {
          console.log("err on handleSaveHistory", err);
        }

        setSwapLoading(false);
        setCounter(0);
        showToast({
          message: "Successful transaction. View on scan",
          type: "success",
          onPress: async () => {
            if (chainInfo.raw.txExplorer && transactionHash) {
              await openLink(
                getTransactionUrl(originalFromToken.chainId, transactionHash)
              );
            }
          },
        });
        let timeoutId: NodeJS.Timeout;
        await onFetchAmount(timeoutId, [originalFromToken, originalToToken]);
        const tokens = getTokenInfos({
          tokens: universalSwapStore.getAmount,
          prices: appInitStore.getInitApp.prices,
          networkFilter: appInitStore.getInitApp.isAllNetworks
            ? ""
            : chainStore.current.chainId,
        });
        if (tokens.length > 0) {
          handleSaveTokenInfos(tokens);
        }
      }
    } catch (error) {
      console.log("error handleSubmit", error);
      if (
        error.message.includes("of undefined") ||
        error.message.includes("Rejected")
      ) {
        handleErrorSwap(error?.message ?? error?.ex?.message);
        setSwapLoading(false);
        return;
      }
      //Somehow, when invoking the "handleSubmit" function with injective, it often returns a 403 status error along with other errors. Therefore, we need to implement a retry mechanism where we try invoking "handleSubmit" multiple times until it succeeds.
      if (
        error.message.includes("Bad status on response") ||
        error.message.includes("403") ||
        originalFromToken.chainId === ChainIdEnum.Injective
      ) {
        if (counter < 4) {
          await handleSubmit();
          setSwapLoading(false);
        } else {
          handleErrorSwap(error?.message ?? error?.ex?.message);
          setCounter(0);
          setSwapLoading(false);
        }
        return;
      } else {
        handleErrorSwap(error?.message ?? error?.ex?.message);
        setSwapLoading(false);
      }
      // handleErrorSwap(error?.message ?? error?.ex?.message);
    } finally {
      if (mixpanel) {
        mixpanel.track("Universal Swap Owallet", logEvent);
      }
      setSwapLoading(false);
      setSwapAmount([0, 0]);
    }
  };

  const onRefresh = async () => {
    setLoadingRefresh(true);
    const currentDate = Date.now();
    const differenceInMilliseconds = Math.abs(currentDate - refreshDate);
    const differenceInSeconds = differenceInMilliseconds / 1000;
    if (differenceInSeconds > 10) {
      if (
        accountOrai.bech32Address &&
        accountEth.evmosHexAddress &&
        accountTron.evmosHexAddress &&
        accountKawaiiCosmos.bech32Address
      ) {
        const currentDate = Date.now();
        const differenceInMilliseconds = Math.abs(currentDate - refreshDate);
        const differenceInSeconds = differenceInMilliseconds / 1000;
        let timeoutId: NodeJS.Timeout;
        if (differenceInSeconds > 10) {
          universalSwapStore.setLoaded(false);
          onFetchAmount(timeoutId);
          setRefreshDate(Date.now());
        } else {
          console.log("The dates are 10 seconds or less apart.");
        }
      }
    } else {
      console.log("The dates are 10 seconds or less apart.");
    }
    await estimateAverageRatio();
    setLoadingRefresh(false);
  };

  const handleReverseDirection = () => {
    if (
      isSupportedNoPoolSwapEvm(fromToken.coinGeckoId) &&
      !isEvmNetworkNativeSwapSupported(toToken.chainId)
    )
      return;
    setSwapTokens([toTokenDenom, fromTokenDenom]);
    setSwapAmount([0, 0]);
    setBalanceActive(null);
  };

  const handleActiveAmount = (item) => {
    handleBalanceActive(item);
    onMaxFromAmount(
      (fromTokenBalance * BigInt(item.value)) / BigInt(MAX),
      item.value
    );
  };

  const renderSwapFee = () => {
    if (fee) {
      return (
        <View style={styles.itemBottom}>
          <BalanceText>Swapp Fee</BalanceText>
          <BalanceText>{floatToPercent(fee) + "%"}</BalanceText>
        </View>
      );
    }
  };

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={colors["plain-background"]}
      style={[styles.container, styles.pt30]}
      contentContainerStyle={{ paddingBottom: metrics.screenHeight / 8 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loadingRefresh} onRefresh={onRefresh} />
      }
    >
      <SlippageModal
        close={() => {
          setIsSlippageModal(false);
        }}
        //@ts-ignore
        currentSlippage={userSlippage}
        isOpen={isSlippageModal}
        setUserSlippage={setUserSlippage}
      />
      <SelectTokenModal
        bottomSheetModalConfig={{
          snapPoints: ["50%", "90%"],
          index: 1,
        }}
        prices={prices}
        data={filteredFromTokens.sort((a, b) => {
          // @ts-ignore
          return b.value - a.value;
        })}
        close={() => {
          setIsSelectFromTokenModal(false);
          setChainFilter(null);
        }}
        onNetworkModal={() => {
          setIsNetworkModal(true);
        }}
        selectedChainFilter={selectedChainFilter}
        setToken={(denom) => {
          setSwapTokens([denom, toTokenDenom]);
          setSwapAmount([0, 0]);
          setBalanceActive(null);
        }}
        setSearchTokenName={setSearchTokenName}
        isOpen={isSelectFromTokenModal}
      />
      <SelectTokenModal
        bottomSheetModalConfig={{
          snapPoints: ["50%", "90%"],
          index: 1,
        }}
        prices={prices}
        data={filteredToTokens.sort((a, b) => {
          // @ts-ignore
          return b.value - a.value;
        })}
        selectedChainFilter={selectedChainFilter}
        close={() => {
          setIsSelectToTokenModal(false);
          setChainFilter(null);
        }}
        onNetworkModal={() => {
          setIsNetworkModal(true);
        }}
        setToken={(denom) => {
          setSwapTokens([fromTokenDenom, denom]);
          setSwapAmount([0, 0]);
          setBalanceActive(null);
        }}
        setSearchTokenName={setSearchTokenName}
        isOpen={isSelectToTokenModal}
      />
      <SelectNetworkModal
        close={() => {
          setIsNetworkModal(false);
        }}
        selectedChainFilter={selectedChainFilter}
        setChainFilter={setChainFilter}
        isOpen={isNetworkModal}
      />
      <View>
        <View style={styles.boxTop}>
          <Text color={colors["text-title-login"]} variant="h3" weight="700">
            Universal Swap
          </Text>
          <View style={styles.buttonGroup}>
            <OWButtonIcon
              fullWidth={false}
              style={[styles.btnTitleRight]}
              sizeIcon={24}
              colorIcon={"#7C8397"}
              name="round_refresh"
              onPress={onRefresh}
            />
            <OWButtonIcon
              fullWidth={false}
              style={[styles.btnTitleRight]}
              sizeIcon={24}
              colorIcon={"#7C8397"}
              name="setting-bold"
              onPress={() => {
                setIsSlippageModal(true);
              }}
            />
          </View>
        </View>

        <View>
          <View>
            <SwapBox
              amount={fromAmountToken?.toString() ?? "0"}
              balanceValue={toDisplay(
                fromTokenBalance,
                originalFromToken?.decimals
              )}
              onChangeAmount={onChangeFromAmount}
              tokenActive={originalFromToken}
              onOpenTokenModal={() => setIsSelectFromTokenModal(true)}
              tokenFee={fromTokenFee}
            />
            <SwapBox
              amount={toAmountToken.toString() ?? "0"}
              balanceValue={toDisplay(
                toTokenBalance,
                originalToToken?.decimals
              )}
              tokenActive={originalToToken}
              onOpenTokenModal={() => setIsSelectToTokenModal(true)}
              editable={false}
              tokenFee={toTokenFee}
            />

            <View style={styles.containerBtnCenter}>
              <OWButtonIcon
                fullWidth={false}
                name="arrow_down_2"
                circle
                style={styles.btnSwapBox}
                colorIcon={"#7C8397"}
                sizeIcon={24}
                onPress={handleReverseDirection}
              />
            </View>
          </View>
        </View>
        <View style={styles.containerBtnBalance}>
          {balances.map((item, index) => {
            return (
              <OWButton
                key={item.id ?? index}
                size="small"
                disabled={amountLoading || swapLoading}
                style={
                  balanceActive?.id === item.id
                    ? styles.btnBalanceActive
                    : styles.btnBalanceInactive
                }
                textStyle={
                  balanceActive?.id === item.id
                    ? styles.textBtnBalanceAtive
                    : styles.textBtnBalanceInActive
                }
                label={`${item.value}%`}
                fullWidth={false}
                onPress={() => handleActiveAmount(item)}
              />
            );
          })}
        </View>
        <OWButton
          label="Swap"
          style={styles.btnSwap}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
            color: colors["neutral-text-action-on-dark-bg"],
          }}
          disabled={amountLoading || swapLoading}
          loading={swapLoading}
          onPress={handleSubmit}
        />
        <View style={styles.containerInfoToken}>
          <View style={styles.itemBottom}>
            <BalanceText>Quote</BalanceText>
            <BalanceText>
              {`1 ${originalFromToken.name} ≈ ${
                ratio
                  ? Number((ratio.displayAmount / INIT_AMOUNT).toFixed(6))
                  : "0"
              } ${originalToToken.name}`}
            </BalanceText>
          </View>
          {!swapLoading &&
          (!fromAmountToken || !toAmountToken) &&
          fromToken.denom === TRON_DENOM ? (
            <View style={styles.itemBottom}>
              <BalanceText>Minimum Amount</BalanceText>
              <BalanceText>
                {(fromToken.minAmountSwap || "0") + " " + fromToken.name}
              </BalanceText>
            </View>
          ) : null}

          <View style={styles.itemBottom}>
            <BalanceText>Minimum Received</BalanceText>
            <BalanceText>
              {(minimumReceive || "0") + " " + toToken.name}
            </BalanceText>
          </View>
          {(!fromTokenFee && !toTokenFee) ||
          (fromTokenFee === 0 && toTokenFee === 0) ? null : (
            <View style={styles.itemBottom}>
              <BalanceText>Token fee</BalanceText>
              <BalanceText>{Number(taxRate) * 100}%</BalanceText>
            </View>
          )}
          {!!relayerFeeToken && (
            <View style={styles.itemBottom}>
              <BalanceText>Relayer Fee</BalanceText>
              <BalanceText>
                {toDisplay(relayerFeeToken.toString(), RELAYER_DECIMAL)} ORAI ≈{" "}
                {relayerFeeAmount} {originalToToken.name}
              </BalanceText>
            </View>
          )}
          {renderSwapFee()}
          {minimumReceive < 0 && (
            <View style={styles.itemBottom}>
              <BalanceText color={colors["danger"]}>
                Current swap amount is too small
              </BalanceText>
            </View>
          )}
          {!fromTokenFee && !toTokenFee && isWarningSlippage && (
            <View style={styles.itemBottom}>
              <BalanceText color={colors["danger"]}>
                Current slippage exceed configuration!
              </BalanceText>
            </View>
          )}
          <View style={styles.itemBottom}>
            <BalanceText>Slippage</BalanceText>
            <BalanceText>{userSlippage}%</BalanceText>
          </View>
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});
