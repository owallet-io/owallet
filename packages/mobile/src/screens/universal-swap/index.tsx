import React, { FunctionComponent, useEffect, useState } from "react";
import { Text } from "@src/components/text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../../stores";
import { SwapBox } from "./components/SwapBox";
import { OWButton } from "@src/components/button";
import { SelectNetworkModal, SelectTokenModal } from "./modals/";
import {
  getTokenInfos,
  maskedNumber,
  shortenAddress,
  showToast,
} from "@src/utils/helper";
import {
  DEFAULT_SLIPPAGE,
  GAS_ESTIMATION_SWAP_DEFAULT,
  ORAI,
  toDisplay,
  getBase58Address,
} from "@owallet/common";
import {
  oraichainNetwork,
  toAmount,
  Networks,
  TRON_DENOM,
  BigDecimal,
  toSubAmount,
  getTokenOnOraichain,
  tokenMap,
  chainInfos,
  TokenItemType,
  getTokensFromNetwork,
} from "@oraichain/oraidex-common";
import { openLink } from "../../utils/helper";
import { feeEstimate } from "@owallet/common";
import { ChainIdEnum } from "@owallet/common";
import {
  isEvmNetworkNativeSwapSupported,
  isEvmSwappable,
  isSupportedNoPoolSwapEvm,
  UniversalSwapData,
  UniversalSwapHandler,
} from "@oraichain/oraidex-universal-swap";
import { SwapCosmosWallet, SwapEvmWallet } from "./wallet";
import { styling } from "./styles";
import { MAX } from "./types";
import {
  useLoadTokens,
  useCoinGeckoPrices,
  useClient,
  useTaxRate,
  useSwapFee,
} from "@owallet/hooks";
import {
  getTransactionUrl,
  handleErrorSwap,
  floatToPercent,
  handleSaveTokenInfos,
  getSpecialCoingecko,
} from "./helpers";
import { Mixpanel } from "mixpanel-react-native";
import { metrics } from "@src/themes";
import { useTokenFee } from "./hooks/use-token-fee";
import { useFilterToken } from "./hooks/use-filter-token";
import { useEstimateAmount } from "./hooks/use-estimate-amount";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWCard from "@src/components/card/ow-card";
import { Toggle } from "@src/components/toggle";
import { SendToModal } from "./modals/SendToModal";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { PriceSettingModal } from "./modals/PriceSettingModal";
import { flatten } from "lodash";
import ByteBrew from "react-native-bytebrew-sdk";

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
  const styles = styling(colors);
  const { data: prices } = useCoinGeckoPrices();
  const [refreshDate, setRefreshDate] = React.useState(Date.now());
  ByteBrew.NewCustomEvent(`Universal Swap Screen`);
  useEffect(() => {
    appInitStore.updatePrices(prices);
  }, [prices]);

  const [counter, setCounter] = useState(0);
  const theme = appInitStore.getInitApp.theme;

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountKawaiiCosmos = accountStore.getAccount(ChainIdEnum.KawaiiCosmos);

  const [sendToAddress, setSendToAddress] = useState(null);
  const [priceSettingModal, setPriceSettingModal] = useState(false);
  const [userSlippage, setUserSlippage] = useState(DEFAULT_SLIPPAGE);
  const [swapLoading, setSwapLoading] = useState(false);

  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [searchTokenName, setSearchTokenName] = useState("");
  const [fromNetworkOpen, setFromNetworkOpen] = useState(false);
  const [fromNetwork, setFromNetwork] = useState("Oraichain");
  const [toNetworkOpen, setToNetworkOpen] = useState(false);
  const [toNetwork, setToNetwork] = useState("Oraichain");

  const [[fromTokenDenom, toTokenDenom], setSwapTokens] = useState<
    [string, string]
  >(["orai", "usdt"]);

  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([0, 0]);

  const [toggle, setToggle] = useState(false);

  const client = useClient(accountOrai);

  const taxRate = useTaxRate(accountOrai);

  const onChangeFromAmount = (amount: string | undefined) => {
    if (!amount) return setSwapAmount([0, toAmountToken]);
    setSwapAmount([parseFloat(amount), toAmountToken]);
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

  const { fee, isDependOnNetwork } = useSwapFee({
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

  const { fromTokenFee, toTokenFee } = useTokenFee(
    originalFromToken,
    originalToToken,
    fromToken,
    toToken,
    client
  );
  const { filteredFromTokens, filteredToTokens } = useFilterToken(
    originalFromToken,
    originalToToken,
    searchTokenName,
    fromToken,
    toToken,
    fromTokenDenom,
    toTokenDenom
  );

  const {
    minimumReceive,
    isWarningSlippage,
    ratio,
    amountLoading,
    estimateAverageRatio,
    relayerFeeAmount,
    relayerFeeToken,
    INIT_AMOUNT,
    impactWarning,
    routersSwapData,
    simulateData,
  } = useEstimateAmount(
    originalFromToken,
    originalToToken,
    fromToken,
    toToken,
    fromAmountToken,
    userSlippage,
    client,
    setSwapAmount,
    handleErrorSwap
  );

  const simulateDisplayAmount =
    simulateData && simulateData.displayAmount ? simulateData.displayAmount : 0;

  const bridgeTokenFee =
    simulateDisplayAmount && (fromTokenFee || toTokenFee)
      ? new BigDecimal(new BigDecimal(simulateDisplayAmount).mul(fromTokenFee))
          .add(new BigDecimal(simulateDisplayAmount).mul(toTokenFee))
          .div(100)
          .toNumber()
      : 0;

  const estSwapFee = new BigDecimal(simulateDisplayAmount || 0)
    .mul(fee || 0)
    .toNumber();

  const totalFeeEst =
    new BigDecimal(bridgeTokenFee || 0)
      .add(relayerFeeAmount || 0)
      .add(estSwapFee)
      .toNumber() || 0;

  const [selectFromTokenModal, setSelectFromTokenModal] = useState(false);
  const [selectToTokenModal, setSelectToTokenModal] = useState(false);
  const [sendToModal, setSendToModal] = useState(false);

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async (
    params: {
      orai?: string;
      eth?: string;
      tron?: string;
      kwt?: string;
      tokenReload?: Array<any>;
    },
    customChainInfos?: Array<any>
  ) => {
    const { orai, eth, tron, kwt, tokenReload } = params;
    let loadTokenParams = {};
    try {
      const cwStargate = {
        account: accountOrai,
        chainId: ChainIdEnum.Oraichain,
        rpc: oraichainNetwork.rpc,
      };

      // other chains, oraichain
      const otherChainTokens = flatten(
        customChainInfos
          .filter((chainInfo) => chainInfo.chainId !== "Oraichain")
          .map(getTokensFromNetwork)
      );
      const oraichainTokens: TokenItemType[] =
        getTokensFromNetwork(oraichainNetwork);

      const tokens = [otherChainTokens, oraichainTokens];
      const flattenTokens = flatten(tokens);

      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: orai ?? accountOrai.bech32Address,
        metamaskAddress: eth ?? null,
        kwtAddress: kwt ?? accountKawaiiCosmos.bech32Address,
        tronAddress: tron ?? null,
        cwStargate,
        tokenReload: tokenReload?.length > 0 ? tokenReload : null,
        customChainInfos: flattenTokens,
      };

      loadTokenAmounts(loadTokenParams);
      universalSwapStore.clearTokenReload();
    } catch (error) {
      setLoadingRefresh(false);
      console.log("error loadTokenAmounts", error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: "danger",
      });
    }
  };

  const onFetchAmount = (tokenReload?: Array<any>) => {
    universalSwapStore.clearAmounts();
    universalSwapStore.setLoaded(false);
    const customChainInfos = chainInfos;
    if (accountOrai.isNanoLedger) {
      if (Object.keys(keyRingStore?.keyRingLedgerAddresses).length > 0) {
        setTimeout(() => {
          handleFetchAmounts(
            {
              orai: accountOrai.bech32Address,
              eth: keyRingStore.keyRingLedgerAddresses.eth ?? null,
              tron: keyRingStore.keyRingLedgerAddresses.trx ?? null,
              kwt: accountKawaiiCosmos.bech32Address,
              tokenReload: tokenReload?.length > 0 ? tokenReload : null,
            },
            customChainInfos
          );
        }, 800);
      }
    } else if (
      accountOrai.bech32Address &&
      accountEth.evmosHexAddress &&
      accountTron.evmosHexAddress &&
      accountKawaiiCosmos.bech32Address
    ) {
      setTimeout(() => {
        handleFetchAmounts(
          {
            orai: accountOrai.bech32Address,
            eth: accountEth.evmosHexAddress,
            tron: getBase58Address(accountTron.evmosHexAddress),
            kwt: accountKawaiiCosmos.bech32Address,
          },
          customChainInfos
        );
      }, 1000);
    }
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

    const isCustomRecipient = sendToAddress && sendToAddress !== "";

    let amountsBalance = universalSwapStore.getAmount;
    let simulateAmount = ratio.amount;

    const { isSpecialFromCoingecko } = getSpecialCoingecko(
      originalFromToken.coinGeckoId,
      originalToToken.coinGeckoId
    );

    if (isSpecialFromCoingecko && originalFromToken.chainId === "Oraichain") {
      const tokenInfo = getTokenOnOraichain(originalFromToken.coinGeckoId);
      const IBC_DECIMALS = 18;
      const fromTokenInOrai = getTokenOnOraichain(
        tokenInfo.coinGeckoId,
        IBC_DECIMALS
      );
      const [nativeAmount, cw20Amount] = await Promise.all([
        client.getBalance(accountOrai.bech32Address, fromTokenInOrai.denom),
        client.queryContractSmart(tokenInfo.contractAddress, {
          balance: {
            address: accountOrai.bech32Address,
          },
        }),
      ]);

      amountsBalance = {
        [fromTokenInOrai.denom]: nativeAmount?.amount,
        [originalFromToken.denom]: cw20Amount.balance,
      };
    }

    if (
      (originalToToken.chainId === "injective-1" &&
        originalToToken.coinGeckoId === "injective-protocol") ||
      originalToToken.chainId === "kawaii_6886-1"
    ) {
      simulateAmount = toAmount(
        ratio.displayAmount,
        originalToToken.decimals
      ).toString();
    }

    const tokenFromNetwork = chainStore.getChain(
      originalFromToken.chainId
    ).chainName;

    const tokenToNetwork = chainStore.getChain(
      originalToToken.chainId
    ).chainName;
    ByteBrew.NewCustomEvent(
      `Universal Swap`,
      `fromToken=${originalFromToken.name};toToken=${originalToToken.name};fromNetwork=${tokenFromNetwork};toNetwork=${tokenToNetwork};`
    );
    const logEvent = {
      address: accountOrai.bech32Address,
      fromToken: originalFromToken.name,
      fromAmount: `${fromAmountToken}`,
      toToken: originalToToken.name,
      toAmount: `${toAmountToken}`,
      tokenFromNetwork,
      tokenToNetwork,
    };

    try {
      const cosmosWallet = new SwapCosmosWallet(client);

      const isTron = Number(originalFromToken.chainId) === Networks.tron;

      const evmWallet = new SwapEvmWallet(isTron);

      const relayerFee = relayerFeeToken && {
        relayerAmount: relayerFeeToken.toString(),
        relayerDecimals: RELAYER_DECIMAL,
      };

      const universalSwapData: UniversalSwapData = {
        sender: {
          cosmos: cosmosAddress,
          evm: evmAddress,
          tron: tronAddress,
        },
        originalFromToken: originalFromToken,
        originalToToken: originalToToken,
        simulateAmount,
        amounts: amountsBalance,
        simulatePrice:
          ratio?.amount &&
          // @ts-ignore
          Math.trunc(new BigDecimal(ratio.amount) / INIT_AMOUNT).toString(),
        userSlippage: userSlippage,
        fromAmount: fromAmountToken,
        relayerFee,
        smartRoutes: routersSwapData?.routeSwapOps,
      };

      const compileSwapData = isCustomRecipient
        ? {
            ...universalSwapData,
            recipientAddress: sendToAddress,
          }
        : universalSwapData;

      const universalSwapHandler = new UniversalSwapHandler(
        {
          ...compileSwapData,
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

        setSwapLoading(false);
        setCounter(0);
        showToast({
          message: "Successful transaction. View on scan",
          type: "success",
          onPress: async () => {
            const chainInfo = chainStore.getChain(originalFromToken.chainId);

            if (chainInfo.raw.txExplorer && transactionHash) {
              await openLink(
                getTransactionUrl(originalFromToken.chainId, transactionHash)
              );
            }
          },
        });
        await onFetchAmount([originalFromToken, originalToToken]);
        const tokens = getTokenInfos({
          tokens: universalSwapStore.getAmount,
          prices: appInitStore.getInitApp.prices,
          networkFilter: appInitStore.getInitApp.isAllNetworks
            ? ""
            : chainStore.current.chainId,
        });
        if (tokens.length > 0) {
          handleSaveTokenInfos(accountOrai.bech32Address, tokens);
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

        if (differenceInSeconds > 10) {
          universalSwapStore.setLoaded(false);
          onFetchAmount();
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
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
    setSwapTokens([toTokenDenom, fromTokenDenom]);
    setSwapAmount([0, 0]);
  };

  const handleActiveAmount = (value) => {
    onMaxFromAmount((fromTokenBalance * BigInt(value)) / BigInt(MAX), value);
  };

  const handleSendToAddress = (address) => {
    setSendToAddress(address);
  };

  const handleSelectFromNetwork = (network) => {
    if (network) {
      const listFromToken = filteredFromTokens.filter(
        (t) => t.chainId === network
      );

      if (listFromToken.length > 0) {
        setFromNetwork(network);
        setSwapTokens([listFromToken[0].denom, toTokenDenom]);
        setSwapAmount([0, 0]);
      } else {
        handleErrorSwap("There is no token to swap!");
        setFromNetwork(ChainIdEnum.Oraichain);
      }
    }
  };

  const handleSelectToNetwork = (network) => {
    if (network) {
      const listToToken = filteredToTokens.filter((t) => t.chainId === network);
      if (listToToken.length > 0) {
        setToNetwork(network);
        setSwapTokens([fromTokenDenom, listToToken[0].denom]);
        setSwapAmount([0, 0]);
      } else {
        handleErrorSwap("There is no token to swap!");
        setToNetwork(ChainIdEnum.Oraichain);
      }
    }
  };

  useEffect(() => {
    if (sendToAddress && sendToAddress !== "") {
      setToggle(true);
    } else {
      setToggle(false);
    }
  }, [sendToAddress, sendToModal]);

  const renderSmartRoutes = () => {
    if (fromAmountToken > 0 && routersSwapData?.routes.length > 0) {
      return (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text color={colors["neutral-text-title"]} weight="500" size={15}>
              Smart Route
            </Text>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: colors["highlight-surface-subtle"],
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  marginRight: 8,
                }}
              >
                <OWIcon
                  name="tdesignwindy"
                  color={colors["highlight-text-title"]}
                  size={14}
                />
                <Text
                  color={colors["highlight-text-title"]}
                  weight="600"
                  size={12}
                >
                  {" "}
                  FASTEST
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: colors["primary-surface-subtle"],
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}
              >
                <Text
                  color={colors["primary-text-action"]}
                  weight="600"
                  size={12}
                >
                  BEST RETURN
                </Text>
              </View>
            </View>
          </View>
        </>
      );
    }
  };

  return (
    <PageWithBottom
      style={{ paddingTop: 16 }}
      bottomGroup={
        <OWButton
          label="Swap"
          style={[
            styles.bottomBtn,
            {
              width: metrics.screenWidth - 32,
            },
          ]}
          textStyle={styles.txtBtnSend}
          disabled={amountLoading || swapLoading}
          loading={swapLoading}
          onPress={handleSubmit}
        />
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loadingRefresh} onRefresh={onRefresh} />
        }
      >
        <PriceSettingModal
          close={() => {
            setPriceSettingModal(false);
          }}
          //@ts-ignore
          currentSlippage={userSlippage}
          impactWarning={impactWarning}
          routersSwapData={routersSwapData}
          fromAmountToken={fromAmountToken}
          minimumReceive={
            (maskedNumber(minimumReceive) || "0") + " " + toToken.name
          }
          swapFee={
            !isDependOnNetwork
              ? estSwapFee
                ? `${maskedNumber(estSwapFee) + " " + toToken.name}`
                : 0
              : 0
          }
          bridgeFee={
            bridgeTokenFee
              ? `${maskedNumber(bridgeTokenFee) + " " + toToken.name}`
              : 0
          }
          tokenFee={
            (!fromTokenFee && !toTokenFee) ||
            (fromTokenFee === 0 && toTokenFee === 0)
              ? null
              : `${Number(taxRate) * 100}%`
          }
          relayerFee={
            !!relayerFeeToken &&
            `${toDisplay(
              relayerFeeToken.toString(),
              RELAYER_DECIMAL
            )} ORAI ≈ ${maskedNumber(relayerFeeAmount)} ${originalToToken.name}`
          }
          ratio={`1 ${originalFromToken.name} ≈ ${
            ratio
              ? maskedNumber(Number(ratio.displayAmount / INIT_AMOUNT))
              : "0"
          } ${originalToToken.name}`}
          isOpen={priceSettingModal}
          setUserSlippage={setUserSlippage}
        />
        <SelectTokenModal
          bottomSheetModalConfig={{
            snapPoints: ["50%", "90%"],
            index: 1,
          }}
          activeToken={originalFromToken}
          prices={prices}
          data={filteredFromTokens}
          close={() => {
            setSelectFromTokenModal(false);
          }}
          selectedChainFilter={fromNetwork}
          setToken={(denom) => {
            setSwapTokens([denom, toTokenDenom]);
            setSwapAmount([0, 0]);
          }}
          setSearchTokenName={setSearchTokenName}
          isOpen={selectFromTokenModal}
        />
        <SelectTokenModal
          bottomSheetModalConfig={{
            snapPoints: ["50%", "90%"],
            index: 1,
          }}
          activeToken={originalToToken}
          prices={prices}
          data={filteredToTokens}
          selectedChainFilter={toNetwork}
          close={() => {
            setSelectToTokenModal(false);
          }}
          setToken={(denom) => {
            setSwapTokens([fromTokenDenom, denom]);
            setSwapAmount([0, 0]);
          }}
          setSearchTokenName={setSearchTokenName}
          isOpen={selectToTokenModal}
        />
        <SelectNetworkModal
          tokenList={filteredFromTokens}
          close={() => {
            setFromNetworkOpen(false);
          }}
          selectedChainFilter={fromNetwork}
          setChainFilter={handleSelectFromNetwork}
          isOpen={fromNetworkOpen}
        />
        <SelectNetworkModal
          tokenList={filteredToTokens}
          close={() => {
            setToNetworkOpen(false);
          }}
          selectedChainFilter={toNetwork}
          setChainFilter={handleSelectToNetwork}
          isOpen={toNetworkOpen}
        />
        <SendToModal
          close={() => {
            setSendToModal(false);
          }}
          isOpen={sendToModal}
          //@ts-ignore
          handleSendToAddress={handleSendToAddress}
          handleToggle={setToggle}
        />
        <View style={{ padding: 16, paddingTop: 0 }}>
          <View>
            <SwapBox
              network={fromNetwork}
              amount={fromAmountToken?.toString() ?? "0"}
              balanceValue={toDisplay(
                fromTokenBalance,
                originalFromToken?.decimals
              )}
              onChangeAmount={onChangeFromAmount}
              tokenActive={originalFromToken}
              onOpenTokenModal={() => setSelectFromTokenModal(true)}
              onOpenNetworkModal={setFromNetworkOpen}
              tokenFee={fromTokenFee}
              onSelectAmount={handleActiveAmount}
              type={"from"}
              disabled={amountLoading || swapLoading}
              editable={!amountLoading && !swapLoading}
            />
            <SwapBox
              network={toNetwork}
              amount={toAmountToken.toString() ?? "0"}
              balanceValue={toDisplay(
                toTokenBalance,
                originalToToken?.decimals
              )}
              tokenActive={originalToToken}
              onOpenTokenModal={() => setSelectToTokenModal(true)}
              editable={false}
              tokenFee={toTokenFee}
              onOpenNetworkModal={setToNetworkOpen}
              type={"to"}
            />

            <TouchableOpacity
              onPress={handleReverseDirection}
              style={styles.containerBtnCenter}
            >
              <OWIcon
                name="tdesignarrow-up-down-1"
                size={16}
                color={colors["neutral-text-title"]}
              />
            </TouchableOpacity>
          </View>

          <OWCard
            type="normal"
            style={{
              marginVertical: 16,
              marginTop: 16,
              borderColor: colors["neutral-border-bold"],
              borderWidth: 2,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setPriceSettingModal(true);
              }}
            >
              {renderSmartRoutes()}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginVertical: 10,
                }}
              >
                <Text>Rate</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPriceSettingModal(true);
                  }}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Text weight="600" color={colors["primary-text-action"]}>
                    {`1 ${originalFromToken.name} ≈ ${
                      ratio
                        ? maskedNumber(
                            Number(ratio.displayAmount / INIT_AMOUNT)
                          )
                        : "0"
                    } ${originalToToken.name}`}{" "}
                  </Text>
                  <OWIcon
                    name="setting-outline"
                    color={colors["primary-text-action"]}
                    size={20}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.borderline} />
              {!swapLoading &&
              (!fromAmountToken || !toAmountToken) &&
              fromToken.denom === TRON_DENOM ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginVertical: 10,
                  }}
                >
                  <Text>Minimum Amount</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text weight="600" color={colors["primary-text-action"]}>
                      {(fromToken.minAmountSwap || "0") + " " + fromToken.name}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.borderline} />
              <View style={{ marginVertical: 10 }}>
                <Text style={{ lineHeight: 24 }}>
                  Min. Received:{" "}
                  <Text weight="600">
                    {(maskedNumber(minimumReceive) || "0") + " " + toToken.name}
                  </Text>
                  {fromAmountToken > 0 ? (
                    <React.Fragment>
                      <Text weight="600" size={18}>
                        {"  •  "}
                      </Text>
                      Est. Fee:{" "}
                      <Text weight="600">
                        {maskedNumber(totalFeeEst)} {originalToToken.name}
                      </Text>
                    </React.Fragment>
                  ) : null}
                </Text>
              </View>

              {minimumReceive < 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text color={colors["danger"]}>
                    Current swap amount is too small
                  </Text>
                </View>
              )}

              {!fromTokenFee && !toTokenFee && isWarningSlippage && (
                <View style={{ marginTop: 10 }}>
                  <Text color={colors["danger"]}>
                    Current slippage exceed configuration!
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </OWCard>

          <OWCard type="normal">
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text color={colors["neutral-text-title"]}>
                Send to another wallet
              </Text>
              <Toggle
                on={toggle}
                onChange={(value) => {
                  setToggle(value);
                  if (value) {
                    setSendToModal(true);
                  } else {
                    setSendToAddress("");
                  }
                }}
              />
            </View>
            {sendToAddress ? (
              <View style={{ paddingTop: 6 }}>
                <Text
                  size={16}
                  weight="500"
                  color={colors["neutral-text-title"]}
                >
                  {shortenAddress(sendToAddress)}
                </Text>
              </View>
            ) : null}
          </OWCard>
          <View
            style={{
              flexDirection: "row",
              alignSelf: "center",
              alignItems: "center",
            }}
          >
            <Text color={colors["neutral-text-body2"]}>Powered by{"  "}</Text>
            <OWIcon
              type="images"
              size={80}
              source={
                theme === "dark"
                  ? require("../../assets/image/obridge-light.png")
                  : require("../../assets/image/obridge.png")
              }
            />
          </View>
        </View>
      </ScrollView>
    </PageWithBottom>
  );
});
