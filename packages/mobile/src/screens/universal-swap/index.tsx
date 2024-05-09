import React, { FunctionComponent, useEffect, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
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
import OWButtonIcon from "@src/components/button/ow-button-icon";
import { BalanceText } from "./components/BalanceText";
import { SelectNetworkModal, SelectTokenModal, SlippageModal } from "./modals/";
import {
  getTokenInfos,
  handleSaveHistory,
  HISTORY_STATUS,
  maskedNumber,
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
  oraichainNetwork,
  toAmount,
  Networks,
  TRON_DENOM,
  BigDecimal,
  toSubAmount,
  getTokenOnOraichain,
  tokenMap,
  flattenTokens,
  flattenTokensWithIcon,
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
  UniversalSwapHelper,
} from "@oraichain/oraidex-universal-swap";
import { SwapCosmosWallet, SwapEvmWallet } from "./wallet";
import { styling } from "./styles";
import { BalanceType, MAX, balances } from "./types";
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
  getPairInfo,
} from "./helpers";
import { Mixpanel } from "mixpanel-react-native";
import { metrics } from "@src/themes";
import { useTokenFee } from "./hooks/use-token-fee";
import { useFilterToken } from "./hooks/use-filter-token";
import { useEstimateAmount } from "./hooks/use-estimate-amount";
import { ProgressBar } from "@src/components/progress-bar";
import FastImage from "react-native-fast-image";
import { PageWithBottom } from "@src/components/page/page-with-bottom";
import OWCard from "@src/components/card/ow-card";
import { Toggle } from "@src/components/toggle";
import { SendToModal } from "./modals/SendToModal";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { PriceSettingModal } from "./modals/PriceSettingModal";
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

  useEffect(() => {
    appInitStore.updatePrices(prices);
  }, [prices]);
  const [counter, setCounter] = useState(0);
  const theme = appInitStore.getInitApp.theme;

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountKawaiiCosmos = accountStore.getAccount(ChainIdEnum.KawaiiCosmos);

  const [isSlippageModal, setIsSlippageModal] = useState(false);
  const [priceSettingModal, setPriceSettingModal] = useState(false);
  const [userSlippage, setUserSlippage] = useState(DEFAULT_SLIPPAGE);
  const [swapLoading, setSwapLoading] = useState(false);

  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [searchTokenName, setSearchTokenName] = useState("");

  const [selectedChainFilter, setChainFilter] = useState(null);

  const [[fromTokenDenom, toTokenDenom], setSwapTokens] = useState<
    [string, string]
  >(["orai", "usdt"]);

  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([0, 0]);

  const [balanceActive, setBalanceActive] = useState<BalanceType>(null);

  const [toggle, setToggle] = useState(false);

  const client = useClient(accountOrai);

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
    toAmountTokenString,
    relayerFeeAmount,
    relayerFeeToken,
    INIT_AMOUNT,
    impactWarning,
    routersSwapData,
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

  const [selectFromTokenModal, setSelectFromTokenModal] = useState(false);
  const [selectToTokenModal, setSelectToTokenModal] = useState(false);
  const [networkModal, setNetworkModal] = useState(false);
  const [sendToModal, setSendToModal] = useState(false);

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
    if (accountOrai.isNanoLedger) {
      if (Object.keys(keyRingStore.keyRingLedgerAddresses).length > 0) {
        setTimeout(() => {
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
      setTimeout(() => {
        handleFetchAmounts({
          orai: accountOrai.bech32Address,
          eth: accountEth.evmosHexAddress,
          tron: getBase58Address(accountTron.evmosHexAddress),
          kwt: accountKawaiiCosmos.bech32Address,
        });
      }, 1000);
    }
  };

  // TODO: use this constant so we can temporary simulate for all pair (specifically AIRI/USDC, ORAIX/USDC), update later after migrate contract

  const handleBalanceActive = (item: BalanceType) => {
    setBalanceActive(item);
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
        smartRoutes: routersSwapData?.routeSwapOps,
      };

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

          await handleSaveHistory(accountOrai.bech32Address, historyInfos);
        } catch (err) {
          console.log("err on handleSaveHistory", err);
        }

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
    <PageWithBottom
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
        <PriceSettingModal
          close={() => {
            setPriceSettingModal(false);
          }}
          //@ts-ignore
          currentSlippage={userSlippage}
          isOpen={priceSettingModal}
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
            setSelectFromTokenModal(false);
            setChainFilter(null);
          }}
          onNetworkModal={() => {
            setNetworkModal(true);
          }}
          selectedChainFilter={selectedChainFilter}
          setToken={(denom) => {
            setSwapTokens([denom, toTokenDenom]);
            setSwapAmount([0, 0]);
            setBalanceActive(null);
          }}
          setSearchTokenName={setSearchTokenName}
          isOpen={selectFromTokenModal}
        />
        <SelectTokenModal
          bottomSheetModalConfig={{
            snapPoints: ["50%", "90%"],
            index: 1,
          }}
          prices={prices}
          data={filteredToTokens.sort((a, b) => {
            //@ts-ignore
            return b.value - a.value;
          })}
          selectedChainFilter={selectedChainFilter}
          close={() => {
            setSelectToTokenModal(false);
            setChainFilter(null);
          }}
          onNetworkModal={() => {
            setNetworkModal(true);
          }}
          setToken={(denom) => {
            setSwapTokens([fromTokenDenom, denom]);
            setSwapAmount([0, 0]);
            setBalanceActive(null);
          }}
          setSearchTokenName={setSearchTokenName}
          isOpen={selectToTokenModal}
        />
        <SelectNetworkModal
          close={() => {
            setNetworkModal(false);
          }}
          selectedChainFilter={selectedChainFilter}
          setChainFilter={setChainFilter}
          isOpen={networkModal}
        />
        <SendToModal
          close={() => {
            setSendToModal(false);
          }}
          //@ts-ignore
          currentSlippage={userSlippage}
          isOpen={sendToModal}
          setUserSlippage={setUserSlippage}
        />
        <View style={{ padding: 16, paddingTop: 0 }}>
          {/* <View style={styles.boxTop}>
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
          </View> */}

          {/* <View>
            <View>
              <SwapBox
                amount={fromAmountToken?.toString() ?? "0"}
                balanceValue={toDisplay(fromTokenBalance, originalFromToken?.decimals)}
                onChangeAmount={onChangeFromAmount}
                tokenActive={originalFromToken}
                onOpenTokenModal={() => setIsSelectFromTokenModal(true)}
                tokenFee={fromTokenFee}
              />
              <SwapBox
                amount={toAmountToken.toString() ?? "0"}
                balanceValue={toDisplay(toTokenBalance, originalToToken?.decimals)}
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
          </View> */}
          {/* <View style={styles.containerBtnBalance}>
            {balances.map((item, index) => {
              return (
                <OWButton
                  key={item.id ?? index}
                  size="small"
                  disabled={amountLoading || swapLoading}
                  style={balanceActive?.id === item.id ? styles.btnBalanceActive : styles.btnBalanceInactive}
                  textStyle={balanceActive?.id === item.id ? styles.textBtnBalanceAtive : styles.textBtnBalanceInActive}
                  label={`${item.value}%`}
                  fullWidth={false}
                  onPress={() => handleActiveAmount(item)}
                />
              );
            })}
          </View> */}
          {/* <View>
            {routersSwapData?.routes.map((route, ind) => {
              const volumn = Number((+route.returnAmount / +routersSwapData?.amount) * 100).toFixed(0);
              return (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 20
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      zIndex: -999,
                      alignSelf: "center"
                    }}
                  >
                    <ProgressBar
                      progress={100}
                      styles={{
                        width: metrics.screenWidth - 32,
                        height: 6,
                        backgroundColor: colors["gray-250"]
                      }}
                      progressColor={colors["green-active"]}
                    />
                  </View>
                  <View
                    style={{
                      backgroundColor: colors["plain-background"],
                      padding: 4
                    }}
                  >
                    <Text>{volumn}%</Text>
                  </View>
                  {route.paths.map((path, i, acc) => {
                    const { TokenInIcon, TokenOutIcon } = getPairInfo(
                      path,
                      flattenTokens,
                      flattenTokensWithIcon,
                      theme === "light"
                    );

                    return (
                      <View style={{ flexDirection: "row" }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 40,
                            marginLeft: 20,
                            backgroundColor: colors["neutral-icon-on-dark"],
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <FastImage
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 40
                            }}
                            source={{
                              uri: TokenOutIcon
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                        </View>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 40,
                            position: "absolute",
                            backgroundColor: colors["neutral-icon-on-dark"],
                            right: 20,
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <FastImage
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 40
                            }}
                            source={{
                              uri: TokenInIcon
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                        </View>
                      </View>
                    );
                  })}
                  <View
                    style={{
                      backgroundColor: colors["plain-background"],
                      padding: 4
                    }}
                  >
                    <Text>{volumn}%</Text>
                  </View>
                </View>
              );
            })}
            {impactWarning ? (
              <BalanceText
                color={
                  Number(impactWarning) > 5
                    ? Number(impactWarning) > 10
                      ? colors["error-text-body"]
                      : colors["warning-text-body"]
                    : colors["neutral-text-body"]
                }
              >
                Price Impact: ≈ {maskedNumber(impactWarning)}%
              </BalanceText>
            ) : null}
          </View> */}

          {/* <View style={styles.containerInfoToken}>
            <View style={styles.itemBottom}>
              <BalanceText>Quote</BalanceText>
              <BalanceText>
                {`1 ${originalFromToken.name} ≈ ${
                  ratio ? Number((ratio.displayAmount / INIT_AMOUNT).toFixed(6)) : "0"
                } ${originalToToken.name}`}
              </BalanceText>
            </View>
            {!swapLoading && (!fromAmountToken || !toAmountToken) && fromToken.denom === TRON_DENOM ? (
              <View style={styles.itemBottom}>
                <BalanceText>Minimum Amount</BalanceText>
                <BalanceText>{(fromToken.minAmountSwap || "0") + " " + fromToken.name}</BalanceText>
              </View>
            ) : null}

            <View style={styles.itemBottom}>
              <BalanceText>Minimum Received</BalanceText>
              <BalanceText>{(minimumReceive || "0") + " " + toToken.name}</BalanceText>
            </View>
            {(!fromTokenFee && !toTokenFee) || (fromTokenFee === 0 && toTokenFee === 0) ? null : (
              <View style={styles.itemBottom}>
                <BalanceText>Token fee</BalanceText>
                <BalanceText>{Number(taxRate) * 100}%</BalanceText>
              </View>
            )}
            {!!relayerFeeToken && (
              <View style={styles.itemBottom}>
                <BalanceText>Relayer Fee</BalanceText>
                <BalanceText>
                  {toDisplay(relayerFeeToken.toString(), RELAYER_DECIMAL)} ORAI ≈ {relayerFeeAmount}{" "}
                  {originalToToken.name}
                </BalanceText>
              </View>
            )}
            {renderSwapFee()}
            {minimumReceive < 0 && (
              <View style={styles.itemBottom}>
                <BalanceText color={colors["danger"]}>Current swap amount is too small</BalanceText>
              </View>
            )}
            {!fromTokenFee && !toTokenFee && isWarningSlippage && (
              <View style={styles.itemBottom}>
                <BalanceText color={colors["danger"]}>Current slippage exceed configuration!</BalanceText>
              </View>
            )}
            <View style={styles.itemBottom}>
              <BalanceText>Slippage</BalanceText>
              <BalanceText>{userSlippage}%</BalanceText>
            </View>
          </View> */}
          <OWCard
            type="normal"
            style={{
              marginVertical: 16,
              borderColor: colors["neutral-border-bold"],
              borderWidth: 2,
            }}
          >
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
                  1 USDT = 0.08715 ORAI{" "}
                </Text>
                <OWIcon
                  name="setting-outline"
                  color={colors["primary-text-action"]}
                  size={20}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.borderline} />
            <View style={{ marginVertical: 10 }}>
              <Text>
                Min. Received: <Text weight="600">0.08715 ORAI</Text>
                {"  •  "}Est. Fee: <Text weight="600">0 ORAI</Text>
              </Text>
            </View>
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
                  console.log("value", value);

                  if (value) {
                    setSendToModal(true);
                  }
                }}
              />
            </View>
          </OWCard>
        </View>
      </ScrollView>
    </PageWithBottom>
  );
});
