import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
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
import { showToast } from '@src/utils/helper';
import {
  DEFAULT_SLIPPAGE,
  GAS_ESTIMATION_SWAP_DEFAULT,
  ORAI,
  TRON_ID,
  ETH_ID,
  ORAICHAIN_ID,
  toDisplay,
  getBase58Address
} from '@owallet/common';
import { evmTokens, filterNonPoolEvmTokens } from '@owallet/common';
import {
  TokenItemType,
  NetworkChainId,
  oraichainNetwork,
  tokenMap,
  toAmount,
  network,
  Networks,
  TRON_DENOM
} from '@oraichain/oraidex-common';
import { SwapDirection, feeEstimate, getTokenOnSpecificChainId, getTransferTokenFee } from '@owallet/common';
import { handleSimulateSwap } from '@oraichain/oraidex-universal-swap';
import { fetchTokenInfos, toSubAmount } from '@owallet/common';
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
const RELAYER_DECIMAL = 6; // TODO: hardcode decimal relayerFee

export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const { accountStore, universalSwapStore } = useStore();
  const { colors } = useTheme();
  const { data: prices } = useCoinGeckoPrices();

  const accountEvm = accountStore.getAccount(ETH_ID);
  const accountTron = accountStore.getAccount(TRON_ID);
  const accountOrai = accountStore.getAccount(ORAICHAIN_ID);

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

  const [[fromTokenInfoData, toTokenInfoData], setTokenInfoData] = useState<TokenItemType[]>([]);

  const [fromTokenFee, setFromTokenFee] = useState<number>(0);
  const [toTokenFee, setToTokenFee] = useState<number>(0);

  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([0, 0]);

  const [ratio, setRatio] = useState(null);

  const [balanceActive, setBalanceActive] = useState<BalanceType>(null);

  const client = useClient(accountOrai);
  const relayerFee = useRelayerFee(accountOrai);
  const taxRate = useTaxRate(accountOrai);

  const onChangeFromAmount = (amount: string | undefined) => {
    if (!amount) return setSwapAmount([0, toAmountToken]);
    setSwapAmount([parseFloat(amount), toAmountToken]);
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

  const getTokenInfos = async () => {
    const data = await fetchTokenInfos([fromToken!, toToken!], client);
    setTokenInfoData(data);
  };

  useEffect(() => {
    getTokenInfos();
  }, [toTokenDenom, fromTokenDenom, client]);

  const [isSelectFromTokenModal, setIsSelectFromTokenModal] = useState(false);
  const [isSelectToTokenModal, setIsSelectToTokenModal] = useState(false);
  const [isNetworkModal, setIsNetworkModal] = useState(false);
  const styles = styling(colors);

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async () => {
    let loadTokenParams = {};
    try {
      const cwStargate = {
        account: accountOrai,
        chainId: ORAICHAIN_ID,
        rpc: oraichainNetwork.rpc
      };

      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: accountOrai.bech32Address,
        cwStargate
      };
      loadTokenParams = {
        ...loadTokenParams,
        metamaskAddress: accountEvm.evmosHexAddress
      };
      loadTokenParams = {
        ...loadTokenParams,
        kwtAddress: accountOrai.bech32Address
      };
      if (accountTron) {
        loadTokenParams = {
          ...loadTokenParams,
          tronAddress: getBase58Address(accountTron.evmosHexAddress)
        };
      }

      loadTokenAmounts(loadTokenParams);
    } catch (error) {
      console.log('error loadTokenAmounts', error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: 'danger'
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      handleFetchAmounts();
    }, 2000);
  }, []);

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

  const getSimulateSwap = async (initAmount?) => {
    if (client) {
      const routerClient = new OraiswapRouterQueryClient(client, network.router);

      const data = await handleSimulateSwap({
        originalFromInfo: originalFromToken,
        originalToInfo: originalToToken,
        originalAmount: initAmount ?? fromAmountToken,
        routerClient
      });
      setAmountLoading(false);

      return data;
    }
  };

  const estimateAverageRatio = async () => {
    const data = await getSimulateSwap(1);
    setRatio(data);
  };

  const estimateSwapAmount = async fromAmountBalance => {
    setAmountLoading(true);
    try {
      const data = await getSimulateSwap();
      const minimumReceive = ratio?.amount
        ? calculateMinReceive(
            ratio.amount,
            toAmount(fromAmountToken, fromTokenInfoData!.decimals).toString(),
            userSlippage,
            toTokenInfoData?.decimals
          )
        : '0';

      setMininumReceive(toDisplay(minimumReceive, toTokenInfoData?.decimals));
      if (data) {
        const isWarningSlippage = +minimumReceive > +data.amount;
        setIsWarningSlippage(isWarningSlippage);
        setSwapAmount([fromAmountBalance, Number(data.amount)]);
      }
      setAmountLoading(false);
    } catch (error) {
      console.log('error', error);

      setAmountLoading(false);
      showToast({
        message: error?.message ?? error?.ex?.message ?? 'Something went wrong',
        type: 'danger'
      });
    }
  };

  useEffect(() => {
    estimateSwapAmount(fromAmountToken);
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, fromAmountToken]);

  useEffect(() => {
    estimateAverageRatio();
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, client]);

  useEffect(() => {
    // special case for tokens having no pools on Oraichain. When original from token is not swappable, then we switch to an alternative token on the same chain as to token
    if (isSupportedNoPoolSwapEvm(toToken.coinGeckoId) && !isSupportedNoPoolSwapEvm(fromToken.coinGeckoId)) {
      const fromTokenSameToChainId = getTokenOnSpecificChainId(fromToken.coinGeckoId, toToken.chainId);
      if (!fromTokenSameToChainId) {
        const sameChainIdTokens = evmTokens.find(t => t.chainId === toToken.chainId);
        if (!sameChainIdTokens) throw Error('Impossible case! An EVM chain should at least have one token');
        setSwapTokens([sameChainIdTokens.denom, toToken.denom]);
        return;
      }
      setSwapTokens([fromTokenSameToChainId.denom, toToken.denom]);
    }
  }, [fromToken]);

  const handleBalanceActive = (item: BalanceType) => {
    setBalanceActive(item);
  };

  const handleSubmit = async () => {
    // account.handleUniversalSwap(chainId, { key: 'value' });
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

      const isTron = Number(originalFromToken.chainId) === Networks.tron;

      const evmWallet = new SwapEvmWallet(isTron);

      const relayerFee = relayerFeeToken && {
        relayerAmount: relayerFeeToken.toString(),
        relayerDecimals: RELAYER_DECIMAL
      };

      const universalSwapData: UniversalSwapData = {
        sender: {
          cosmos: accountOrai.bech32Address,
          evm: accountEvm.evmosHexAddress,
          tron: getBase58Address(accountTron.evmosHexAddress)
        },
        originalFromToken: originalFromToken,
        originalToToken: originalToToken,
        simulateAmount: toAmountToken.toString(),
        simulatePrice: ratio.amount,
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
        setSwapLoading(false);
        showToast({
          message: 'Success',
          type: 'success'
        });
        await handleFetchAmounts();
      }
    } catch (error) {
      setSwapLoading(false);
      console.log('error', error);
      showToast({
        message: error?.message ?? error?.ex?.message ?? 'Something went wrong',
        type: 'danger'
      });
    } finally {
      setSwapLoading(false);
    }
  };

  const onRefresh = async () => {
    setLoadingRefresh(true);
    await handleFetchAmounts();
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
              amount={toDisplay(toAmountToken.toString(), originalToToken?.decimals).toString() ?? '0'}
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
              {`1 ${originalFromToken?.name} ≈ ${toDisplay(
                ratio?.amount,
                fromTokenInfoData?.decimals,
                toTokenInfoData?.decimals
              )} ${originalToToken?.name}`}
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
              <BalanceText>{toDisplay(relayerFeeToken.toString(), RELAYER_DECIMAL)} ORAI</BalanceText>
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
