import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { RefreshControl, View } from 'react-native';
import { useStore } from '../../stores';
import { SwapBox } from './components/SwapBox';
import { OWButton } from '@src/components/button';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { BalanceText } from './components/BalanceText';
import { SelectNetworkModal, SelectTokenModal, SlippageModal } from './modals/';
import { getTokenInfos, showToast } from '@src/utils/helper';
import {
  DEFAULT_SLIPPAGE,
  GAS_ESTIMATION_SWAP_DEFAULT,
  ORAI,
  toDisplay,
  getBase58Address,
  getAddress,
  delay
} from '@owallet/common';
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
  oraichainTokens
} from '@oraichain/oraidex-common';
import { openLink } from '../../utils/helper';
import { SwapDirection, feeEstimate, getTransferTokenFee } from '@owallet/common';
import { handleSimulateSwap, filterNonPoolEvmTokens } from '@oraichain/oraidex-universal-swap';
import { fetchTokenInfos, ChainIdEnum, tokenMap } from '@owallet/common';
import { calculateMinReceive, getTokenOnOraichain } from '@oraichain/oraidex-common';
import {
  isEvmNetworkNativeSwapSupported,
  isEvmSwappable,
  isSupportedNoPoolSwapEvm,
  UniversalSwapData,
  UniversalSwapHandler
} from '@oraichain/oraidex-universal-swap';
import { SwapCosmosWallet, SwapEvmWallet } from './wallet';
import { styling } from './styles';
import { BalanceType, MAX, balances } from './types';
import { OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';
import { useLoadTokens, useCoinGeckoPrices, useClient, useRelayerFee, useTaxRate } from '@owallet/hooks';
import { getTransactionUrl, handleErrorSwap } from './helpers';
import { useIsFocused } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

const RELAYER_DECIMAL = 6; // TODO: hardcode decimal relayerFee

export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const { accountStore, universalSwapStore, chainStore, appInitStore } = useStore();
  const { colors } = useTheme();
  const { data: prices } = useCoinGeckoPrices();

  useEffect(() => {
    appInitStore.updatePrices(prices);
  }, [prices]);

  const chainInfo = chainStore.getChain(ChainIdEnum.Oraichain);

  let accounts = {};

  Object.keys(ChainIdEnum).map(key => {
    let defaultAddress = accountStore.getAccount(ChainIdEnum[key]).bech32Address;
    if (ChainIdEnum[key] === ChainIdEnum.TRON) {
      accounts[ChainIdEnum[key]] = getBase58Address(accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress);
    } else if (defaultAddress.startsWith('evmos')) {
      accounts[ChainIdEnum[key]] = accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress;
    } else {
      accounts[ChainIdEnum[key]] = defaultAddress;
    }
  });

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  const [isSlippageModal, setIsSlippageModal] = useState(false);
  const [minimumReceive, setMininumReceive] = useState(0);
  const [userSlippage, setUserSlippage] = useState(DEFAULT_SLIPPAGE);
  const [swapLoading, setSwapLoading] = useState(false);
  const [amountLoading, setAmountLoading] = useState(false);
  const [isWarningSlippage, setIsWarningSlippage] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [searchTokenName, setSearchTokenName] = useState('');
  const [filteredToTokens, setFilteredToTokens] = useState([] as TokenItemType[]);
  const [filteredFromTokens, setFilteredFromTokens] = useState([] as TokenItemType[]);
  const [selectedChainFilter, setChainFilter] = useState(null);

  const [[fromTokenDenom, toTokenDenom], setSwapTokens] = useState<[string, string]>(['orai', 'usdt']);

  const [fromTokenFee, setFromTokenFee] = useState<number>(0);
  const [toTokenFee, setToTokenFee] = useState<number>(0);
  const [relayerFeeAmount, setRelayerFeeAmount] = useState<number>(0);

  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([0, 0]);
  const [toAmountTokenString, setToAmountToken] = useState('0');

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

  const onMaxFromAmount = (amount: bigint, type: string) => {
    const displayAmount = toDisplay(amount, originalFromToken?.decimals);
    let finalAmount = displayAmount;

    // hardcode fee when swap token orai
    if (fromTokenDenom === ORAI) {
      const estimatedFee = feeEstimate(originalFromToken, GAS_ESTIMATION_SWAP_DEFAULT);
      const fromTokenBalanceDisplay = toDisplay(fromTokenBalance, originalFromToken?.decimals);
      if (type === MAX) {
        finalAmount = estimatedFee > displayAmount ? 0 : displayAmount - estimatedFee;
      } else {
        finalAmount = estimatedFee > fromTokenBalanceDisplay - displayAmount ? 0 : displayAmount;
      }
    }
    setSwapAmount([finalAmount, toAmountToken]);
  };

  // get token on oraichain to simulate swap amount.
  const originalFromToken = tokenMap[fromTokenDenom];
  const originalToToken = tokenMap[toTokenDenom];
  const isEvmSwap = isEvmSwappable({
    fromChainId: originalFromToken.chainId,
    toChainId: originalToToken.chainId,
    fromContractAddr: originalFromToken.contractAddress,
    toContractAddr: originalToToken.contractAddress
  });

  const relayerFeeToken = useMemo(() => {
    return relayerFee.reduce((acc, cur) => {
      if (
        originalFromToken?.chainId !== originalToToken?.chainId &&
        (cur.prefix === originalFromToken?.prefix || cur.prefix === originalToToken?.prefix)
      ) {
        return +cur.amount + acc;
      }
      return acc;
    }, 0);
  }, [relayerFee, originalFromToken, originalToToken]);

  // if evm swappable then no need to get token on oraichain because we can swap on evm. Otherwise, get token on oraichain. If cannot find => fallback to original token
  const fromToken = isEvmSwap
    ? tokenMap[fromTokenDenom]
    : getTokenOnOraichain(tokenMap[fromTokenDenom].coinGeckoId) ?? tokenMap[fromTokenDenom];
  const toToken = isEvmSwap
    ? tokenMap[toTokenDenom]
    : getTokenOnOraichain(tokenMap[toTokenDenom].coinGeckoId) ?? tokenMap[toTokenDenom];

  const getTokenFee = async (
    remoteTokenDenom: string,
    fromChainId: NetworkChainId,
    toChainId: NetworkChainId,
    type: 'from' | 'to'
  ) => {
    // since we have supported evm swap, tokens that are on the same supported evm chain id don't have any token fees (because they are not bridged to Oraichain)
    if (isEvmNetworkNativeSwapSupported(fromChainId) && fromChainId === toChainId) return;
    if (remoteTokenDenom) {
      let tokenFee = 0;
      const ratio = await getTransferTokenFee({ remoteTokenDenom, client });

      if (ratio) {
        tokenFee = (ratio.nominator / ratio.denominator) * 100;
      }

      if (type === 'from') {
        setFromTokenFee(tokenFee);
      } else {
        setToTokenFee(tokenFee);
      }
    }
  };

  useEffect(() => {
    getTokenFee(originalToToken.prefix + originalToToken.contractAddress, fromToken.chainId, toToken.chainId, 'to');
  }, [originalToToken, fromToken, toToken, originalToToken, client]);

  useEffect(() => {
    getTokenFee(
      originalFromToken.prefix + originalFromToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      'from'
    );
  }, [originalToToken, fromToken, toToken, originalToToken, client]);

  const {
    data: [fromTokenInfoData, toTokenInfoData]
  } = useQuery({
    queryKey: ['token-infos', fromToken, toToken],
    queryFn: () => fetchTokenInfos([fromToken!, toToken!], client),
    ...{
      initialData: []
    }
  });

  // const isFocused = useIsFocused();

  const [isSelectFromTokenModal, setIsSelectFromTokenModal] = useState(false);
  const [isSelectToTokenModal, setIsSelectToTokenModal] = useState(false);
  const [isNetworkModal, setIsNetworkModal] = useState(false);
  const styles = styling(colors);

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async accounts => {
    let loadTokenParams = {};
    try {
      if (
        accounts?.[ChainIdEnum.TRON] &&
        accounts?.[ChainIdEnum.Ethereum] &&
        accountOrai.bech32Address &&
        accounts?.[ChainIdEnum.Oraichain] &&
        accounts?.[ChainIdEnum.Injective]
      ) {
        const cwStargate = {
          account: accountOrai,
          chainId: ChainIdEnum.Oraichain,
          rpc: oraichainNetwork.rpc
        };
        loadTokenParams = {
          ...loadTokenParams,
          oraiAddress: accounts[ChainIdEnum.Oraichain],
          cwStargate
        };
        loadTokenParams = {
          ...loadTokenParams,
          metamaskAddress: accounts[ChainIdEnum.Ethereum]
        };
        loadTokenParams = {
          ...loadTokenParams,
          kwtAddress: getAddress(accounts[ChainIdEnum.Injective], 'oraie')
        };
        loadTokenParams = {
          ...loadTokenParams,
          tronAddress: accounts[ChainIdEnum.TRON]
        };
        loadTokenAmounts(loadTokenParams);
      }
    } catch (error) {
      console.log('error loadTokenAmounts', error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: 'danger'
      });
    }
  };

  const delayedFunction = useCallback(async () => {
    await delay(3000);
    Object.keys(ChainIdEnum).map(key => {
      let defaultAddress = accountStore.getAccount(ChainIdEnum[key]).bech32Address;
      if (ChainIdEnum[key] === ChainIdEnum.TRON) {
        accounts[ChainIdEnum[key]] = getBase58Address(accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress);
      } else if (defaultAddress.startsWith('evmos')) {
        accounts[ChainIdEnum[key]] = accountStore.getAccount(ChainIdEnum[key]).evmosHexAddress;
      } else {
        accounts[ChainIdEnum[key]] = defaultAddress;
      }
    });

    handleFetchAmounts(accounts);
  }, []);

  useEffect(() => {
    delayedFunction();
  }, []);

  // useEffect(() => {
  //   if (isFocused) {
  //     handleFetchAmounts(accounts);
  //   }
  // }, [isFocused]);

  // This section is for PnL display
  useEffect(() => {
    if (Object.keys(universalSwapStore.getAmount).length > 0) {
      appInitStore.updatePriceFeed(
        accountOrai.bech32Address,
        getTokenInfos({ tokens: universalSwapStore.getAmount, prices })
      );
    }
  }, [universalSwapStore.getAmount, accountOrai.bech32Address, prices]);

  const subAmountFrom = toSubAmount(universalSwapStore.getAmount, originalFromToken);
  const subAmountTo = toSubAmount(universalSwapStore.getAmount, originalToToken);
  const fromTokenBalance = originalFromToken
    ? BigInt(universalSwapStore.getAmount?.[originalFromToken.denom] ?? '0') + subAmountFrom
    : BigInt(0);

  const toTokenBalance = originalToToken
    ? BigInt(universalSwapStore.getAmount?.[originalToToken.denom] ?? '0') + subAmountTo
    : BigInt(0);

  useEffect(() => {
    const filteredToTokens = filterNonPoolEvmTokens(
      originalFromToken.chainId,
      originalFromToken.coinGeckoId,
      originalFromToken.denom,
      searchTokenName,
      SwapDirection.To
    );
    setFilteredToTokens(filteredToTokens);

    const filteredFromTokens = filterNonPoolEvmTokens(
      originalToToken.chainId,
      originalToToken.coinGeckoId,
      originalToToken.denom,
      searchTokenName,
      SwapDirection.From
    );
    setFilteredFromTokens(filteredFromTokens);

    // TODO: need to automatically update from / to token to the correct swappable one when clicking the swap button
  }, [fromToken, toToken, toTokenDenom, fromTokenDenom]);

  // TODO: use this constant so we can temporary simulate for all pair (specifically AIRI/USDC, ORAIX/USDC), update later after migrate contract
  const isFromAiriToUsdc = originalFromToken.coinGeckoId === 'airight' && originalToToken.coinGeckoId === 'usd-coin';
  const isFromOraixToUsdc = originalFromToken.coinGeckoId === 'oraidex' && originalToToken.coinGeckoId === 'usd-coin';
  const isFromUsdc = originalFromToken.coinGeckoId === 'usd-coin';

  const INIT_SIMULATE_AIRI_TO_USDC = 1000;
  const INIT_SIMULATE_FROM_USDC = 10;
  const INIT_AMOUNT =
    isFromAiriToUsdc || isFromOraixToUsdc ? INIT_SIMULATE_AIRI_TO_USDC : isFromUsdc ? INIT_SIMULATE_FROM_USDC : 1;

  const getSimulateSwap = async (initAmount?) => {
    if (client) {
      const routerClient = new OraiswapRouterQueryClient(client, network.router);
      let simulateAmount = INIT_AMOUNT;
      if (fromAmountToken > 0) {
        simulateAmount = fromAmountToken;
      }

      const data = await handleSimulateSwap({
        originalFromInfo: originalFromToken,
        originalToInfo: originalToToken,
        originalAmount: initAmount ?? simulateAmount,
        routerClient
      });

      setAmountLoading(false);

      return data;
    }
  };

  const convertRelayerFee = async () => {
    if (client && relayerFeeToken) {
      const routerClient = new OraiswapRouterQueryClient(client, network.router);
      const oraiToken = oraichainTokens.find(token => token.coinGeckoId === 'oraichain-token');

      const data = await handleSimulateSwap({
        originalFromInfo: oraiToken,
        originalToInfo: originalToToken,
        originalAmount: toDisplay(relayerFeeToken.toString()),
        routerClient
      });

      setRelayerFeeAmount(data.displayAmount);
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

  const estimateSwapAmount = async fromAmountBalance => {
    setAmountLoading(true);
    try {
      const data = await getSimulateSwap();
      const minimumReceive = Number(data.displayAmount - (data.displayAmount * userSlippage) / 100 - relayerFeeAmount);

      const fromAmountTokenBalance = fromTokenInfoData && toAmount(fromAmountToken, fromTokenInfoData!.decimals);
      const warningMinimumReceive =
        ratio && ratio.amount
          ? calculateMinReceive(
              // @ts-ignore
              Math.trunc(new BigDecimal(ratio.amount) / INIT_AMOUNT).toString(),
              fromAmountTokenBalance.toString(),
              userSlippage,
              originalFromToken.decimals
            )
          : '0';

      setMininumReceive(Number(minimumReceive.toFixed(6)));
      if (data) {
        const isWarningSlippage = +warningMinimumReceive > +data.amount;

        setIsWarningSlippage(isWarningSlippage);
        setToAmountToken(data.amount);
        setSwapAmount([fromAmountBalance, Number(data.displayAmount)]);
      }
      setAmountLoading(false);
    } catch (error) {
      console.log('error', error);
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
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, fromAmountToken]);

  useEffect(() => {
    estimateAverageRatio();
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, client]);

  const handleBalanceActive = (item: BalanceType) => {
    setBalanceActive(item);
  };

  const handleSubmit = async () => {
    if (fromAmountToken <= 0) {
      showToast({
        message: 'From amount should be higher than 0!',
        type: 'danger'
      });
      return;
    }

    setSwapLoading(true);
    try {
      const cosmosWallet = new SwapCosmosWallet(client);
      const cosmosAddress = originalFromToken.cosmosBased
        ? accounts[originalFromToken.chainId]
        : accountOrai.bech32Address;

      const isTron = Number(originalFromToken.chainId) === Networks.tron;

      const evmWallet = new SwapEvmWallet(isTron);

      const relayerFee = relayerFeeToken && {
        relayerAmount: relayerFeeToken.toString(),
        relayerDecimals: RELAYER_DECIMAL
      };

      const universalSwapData: UniversalSwapData = {
        sender: {
          cosmos: cosmosAddress,
          evm: accounts[ChainIdEnum.Ethereum],
          tron: accounts[ChainIdEnum.TRON]
        },
        originalFromToken: originalFromToken,
        originalToToken: originalToToken,
        simulateAmount: toAmountTokenString,
        // @ts-ignore
        simulatePrice: ratio?.amount && Math.trunc(new BigDecimal(ratio.amount) / INIT_AMOUNT).toString(),
        userSlippage: userSlippage,
        fromAmount: fromAmountToken,
        relayerFee
      };

      const universalSwapHandler = new UniversalSwapHandler(
        {
          ...universalSwapData
        },
        {
          cosmosWallet,
          //@ts-ignore
          evmWallet
        }
      );

      const result = await universalSwapHandler.processUniversalSwap();

      if (result) {
        const { transactionHash } = result;
        setSwapLoading(false);
        showToast({
          message: 'Successful transaction. View on scan',
          type: 'success',
          onPress: async () => {
            if (chainInfo.raw.txExplorer && transactionHash) {
              await openLink(getTransactionUrl(originalFromToken.chainId, transactionHash));
            }
          }
        });
        await handleFetchAmounts(accounts);
      }
    } catch (error) {
      setSwapLoading(false);
      console.log('error', error);
      handleErrorSwap(error?.message ?? error?.ex?.message);
    } finally {
      setSwapLoading(false);
      setSwapAmount([0, 0]);
    }
  };

  const onRefresh = async () => {
    setLoadingRefresh(true);
    await handleFetchAmounts(accounts);
    setLoadingRefresh(false);
  };

  const handleReverseDirection = () => {
    if (isSupportedNoPoolSwapEvm(fromToken.coinGeckoId) && !isEvmNetworkNativeSwapSupported(toToken.chainId)) return;
    setSwapTokens([toTokenDenom, fromTokenDenom]);
    setSwapAmount([0, 0]);
    setBalanceActive(null);
  };

  const handleActiveAmount = item => {
    handleBalanceActive(item);
    onMaxFromAmount((fromTokenBalance * BigInt(item.value)) / BigInt(MAX), item.value);
  };

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={colors['plain-background']}
      style={[styles.container, styles.pt30]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loadingRefresh} onRefresh={onRefresh} />}
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
          snapPoints: ['50%', '90%'],
          index: 1
        }}
        prices={prices}
        data={filteredFromTokens}
        close={() => {
          setIsSelectFromTokenModal(false);
          setChainFilter(null);
        }}
        onNetworkModal={() => {
          setIsNetworkModal(true);
        }}
        selectedChainFilter={selectedChainFilter}
        setToken={denom => {
          setSwapTokens([denom, toTokenDenom]);
          setSwapAmount([0, 0]);
          setBalanceActive(null);
        }}
        setSearchTokenName={setSearchTokenName}
        isOpen={isSelectFromTokenModal}
      />
      <SelectTokenModal
        bottomSheetModalConfig={{
          snapPoints: ['50%', '90%'],
          index: 1
        }}
        prices={prices}
        data={filteredToTokens}
        selectedChainFilter={selectedChainFilter}
        close={() => {
          setIsSelectToTokenModal(false);
          setChainFilter(null);
        }}
        onNetworkModal={() => {
          setIsNetworkModal(true);
        }}
        setToken={denom => {
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
          <Text color={colors['text-title-login']} variant="h3" weight="700">
            Universal Swap
          </Text>
          <View style={styles.buttonGroup}>
            <OWButtonIcon
              fullWidth={false}
              style={[styles.btnTitleRight]}
              sizeIcon={24}
              colorIcon={'#7C8397'}
              name="round_refresh"
              onPress={onRefresh}
            />
            <OWButtonIcon
              fullWidth={false}
              style={[styles.btnTitleRight]}
              sizeIcon={24}
              colorIcon={'#7C8397'}
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
              amount={fromAmountToken?.toString() ?? '0'}
              balanceValue={toDisplay(fromTokenBalance, originalFromToken?.decimals)}
              onChangeAmount={onChangeFromAmount}
              tokenActive={originalFromToken}
              onOpenTokenModal={() => setIsSelectFromTokenModal(true)}
              tokenFee={fromTokenFee}
            />
            <SwapBox
              amount={toAmountToken.toString() ?? '0'}
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
                colorIcon={'#7C8397'}
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
                style={balanceActive?.id === item.id ? styles.btnBalanceActive : styles.btnBalanceInactive}
                textStyle={balanceActive?.id === item.id ? styles.textBtnBalanceAtive : styles.textBtnBalanceInActive}
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
          disabled={amountLoading || swapLoading}
          loading={swapLoading}
          textStyle={styles.textBtnSwap}
          onPress={handleSubmit}
        />
        <View style={styles.containerInfoToken}>
          <View style={styles.itemBottom}>
            <BalanceText>Quote</BalanceText>
            <BalanceText>
              {`1 ${originalFromToken.name} ≈ ${ratio ? Number((ratio.displayAmount / INIT_AMOUNT).toFixed(6)) : '0'} ${
                originalToToken.name
              }`}
            </BalanceText>
          </View>
          {!swapLoading && (!fromAmountToken || !toAmountToken) && fromToken.denom === TRON_DENOM ? (
            <View style={styles.itemBottom}>
              <BalanceText>Minimum Amount</BalanceText>
              <BalanceText>{(fromToken.minAmountSwap || '0') + ' ' + fromToken.name}</BalanceText>
            </View>
          ) : null}

          <View style={styles.itemBottom}>
            <BalanceText>Minimum Received</BalanceText>
            <BalanceText>{(minimumReceive || '0') + ' ' + toToken.name}</BalanceText>
          </View>
          {(!fromTokenFee && !toTokenFee) || (fromTokenFee === 0 && toTokenFee === 0) ? (
            <View style={styles.itemBottom}>
              <BalanceText>Tax rate</BalanceText>
              <BalanceText>{Number(taxRate) * 100}%</BalanceText>
            </View>
          ) : null}
          {!!relayerFeeToken && (
            <View style={styles.itemBottom}>
              <BalanceText>Relayer Fee</BalanceText>
              <BalanceText>
                {toDisplay(relayerFeeToken.toString(), RELAYER_DECIMAL)} ORAI ≈ {relayerFeeAmount}{' '}
                {originalToToken.name}
              </BalanceText>
            </View>
          )}
          {minimumReceive < 0 && (
            <View style={styles.itemBottom}>
              <BalanceText color={colors['danger']}>Current swap amount is too small</BalanceText>
            </View>
          )}
          {!fromTokenFee && !toTokenFee && isWarningSlippage && (
            <View style={styles.itemBottom}>
              <BalanceText color={colors['danger']}>Current slippage exceed configuration!</BalanceText>
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
