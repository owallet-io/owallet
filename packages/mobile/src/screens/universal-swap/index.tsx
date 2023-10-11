import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { Text } from '@src/components/text';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { Platform, StyleSheet, View } from 'react-native';
import { useStore } from '../../stores';
import { metrics, typography } from '../../themes';
import { SwapBox } from './components/SwapBox';
import { OWButton } from '@src/components/button';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { BalanceText } from './components/BalanceText';
import { SelectNetworkModal, SelectTokenModal, SlippageModal } from './modals/';
import {
  ETH_ID,
  KAWAII_ID,
  ORAICHAIN_ID,
  TRON_ID,
  isAndroid
} from '@src/utils/helper';
import { useCoinGeckoPrices } from '@src/hooks/use-coingecko';
import {
  DEFAULT_SLIPPAGE,
  GAS_ESTIMATION_SWAP_DEFAULT,
  ORAI
} from '@owallet/common';
import { Address } from '@owallet/crypto';
import useLoadTokens from '@src/hooks/use-load-tokens';
import { NetworkChainId, oraichainNetwork } from '@owallet/common';
import { TokenItemType, evmTokens, tokenMap } from '@owallet/common';
import {
  SwapDirection,
  calculateMinimum,
  feeEstimate,
  fetchTaxRate,
  filterTokens,
  getTokenOnOraichain,
  getTokenOnSpecificChainId,
  getTransferTokenFee,
  handleSimulateSwap
} from '@owallet/common';
import { fetchTokenInfos } from '@owallet/common';
import { CWStargate } from '@src/common/cw-stargate';
import { toDisplay, toSubAmount } from '@owallet/common';

import {
  combineReceiver,
  isEvmNetworkNativeSwapSupported,
  isEvmSwappable,
  isSupportedNoPoolSwapEvm,
  UniversalSwapData,
  UniversalSwapHandler
} from '@oraichain/oraidex-universal-swap';
import { OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';
import { CwIcs20LatestQueryClient } from '@oraichain/common-contracts-sdk';
import { IBC_WASM_CONTRACT, toAmount } from '@oraichain/oraidex-common';
import { SwapCosmosWallet, SwapEvmWallet } from './wallet';

const oraidexURL = 'https://oraidex.io';

type BalanceType = {
  id: string;
  value: string;
};

const ONE_QUARTER = '25';
const HALF = '50';
const THREE_QUARTERS = '75';
const MAX = '100';

const balances: BalanceType[] = [
  {
    id: '1',
    value: ONE_QUARTER
  },
  { id: '2', value: HALF },
  { id: '3', value: THREE_QUARTERS },
  { id: '4', value: MAX }
];
export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const { accountStore, chainStore, universalSwapStore } = useStore();
  const accountEvm = accountStore.getAccount(ETH_ID);
  const accountTron = accountStore.getAccount(TRON_ID);
  const accountOrai = accountStore.getAccount(ORAICHAIN_ID);
  const { colors } = useTheme();
  const [isSlippageModal, setIsSlippageModal] = useState(false);
  const [minimumReceive, setMininumReceive] = useState(0);
  const [userSlippage, setUserSlippage] = useState(DEFAULT_SLIPPAGE);
  const [swapLoading, setSwapLoading] = useState(false);
  const [amountLoading, setAmountLoading] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [searchTokenName, setSearchTokenName] = useState('');
  const [filteredToTokens, setFilteredToTokens] = useState(
    [] as TokenItemType[]
  );
  const [filteredFromTokens, setFilteredFromTokens] = useState(
    [] as TokenItemType[]
  );

  const [[fromTokenDenom, toTokenDenom], setSwapTokens] = useState<
    [string, string]
  >(['orai', 'usdt']);

  const [[fromTokenInfoData, toTokenInfoData], setTokenInfoData] = useState<
    TokenItemType[]
  >([]);

  const [fromTokenFee, setFromTokenFee] = useState<number>(0);
  const [toTokenFee, setToTokenFee] = useState<number>(0);

  const { data: prices } = useCoinGeckoPrices();

  useEffect(() => {
    handleFetchAmounts();
    setTimeout(() => {
      handleFetchAmounts();
    }, 2000);
  }, []);

  const onChangeFromAmount = (amount: string | undefined) => {
    if (!amount) return setSwapAmount([undefined, toAmountToken]);
    setSwapAmount([parseFloat(amount), toAmountToken]);
  };

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

  // get token on oraichain to simulate swap amount.
  const originalFromToken = tokenMap[fromTokenDenom];
  const originalToToken = tokenMap[toTokenDenom];
  const isEvmSwap = isEvmSwappable({
    fromChainId: originalFromToken.chainId,
    toChainId: originalToToken.chainId,
    fromContractAddr: originalFromToken.contractAddress,
    toContractAddr: originalToToken.contractAddress
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
    type: 'from' | 'to'
  ) => {
    const client = await CWStargate.init(
      accountOrai,
      ORAICHAIN_ID,
      oraichainNetwork.rpc
    );

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

      if (type === 'from') {
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
      'to'
    );
  }, [originalToToken, fromToken, toToken, originalToToken]);

  useEffect(() => {
    getTokenFee(
      originalFromToken.prefix + originalFromToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      'from'
    );
  }, [originalToToken, fromToken, toToken, originalToToken]);

  const getTokenInfos = async () => {
    const client = await CWStargate.init(
      accountOrai,
      ORAICHAIN_ID,
      oraichainNetwork.rpc
    );

    const data = await fetchTokenInfos([fromToken!, toToken!], client);
    setTokenInfoData(data);
    return;
  };

  useEffect(() => {
    getTokenInfos();
  }, [toTokenDenom, fromTokenDenom]);

  const [isSelectFromTokenModal, setIsSelectFromTokenModal] = useState(false);
  const [isSelectToTokenModal, setIsSelectToTokenModal] = useState(false);
  const [isNetworkModal, setIsNetworkModal] = useState(false);
  const styles = styling(colors);
  const chainId = chainStore?.current?.chainId;

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async () => {
    const accounts = await Promise.all([
      accountStore.getAccount(ETH_ID),
      accountStore.getAccount(TRON_ID),
      accountStore.getAccount(KAWAII_ID)
    ]);
    let loadTokenParams = {};
    try {
      const cwStargate = {
        account: accountOrai,
        chainId: accountOrai.chainId,
        rpc: oraichainNetwork.rpc
      };

      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: accountOrai.bech32Address,
        cwStargate
      };
      accounts.map(async account => {
        if (account.chainId === ETH_ID) {
          loadTokenParams = {
            ...loadTokenParams,
            metamaskAddress: account.evmosHexAddress
          };
        }
        if (account.chainId === TRON_ID) {
          loadTokenParams = {
            ...loadTokenParams,
            tronAddress: Address.getBase58Address(account.evmosHexAddress)
          };
        }
        if (account.chainId === KAWAII_ID) {
          loadTokenParams = {
            ...loadTokenParams,
            kwtAddress: account.bech32Address
          };
        }
      });

      loadTokenAmounts(loadTokenParams);
    } catch (error) {
      console.log('error loadTokenAmounts', error);
    }
  };

  const subAmountFrom = toSubAmount(
    universalSwapStore.getAmount,
    originalFromToken
  );
  const subAmountTo = toSubAmount(
    universalSwapStore.getAmount,
    originalToToken
  );
  const fromTokenBalance = originalFromToken
    ? BigInt(universalSwapStore.getAmount?.[originalFromToken.denom] ?? '0') +
      subAmountFrom
    : BigInt(0);

  const toTokenBalance = originalToToken
    ? BigInt(universalSwapStore.getAmount?.[originalToToken.denom] ?? '0') +
      subAmountTo
    : BigInt(0);

  // process filter from & to tokens
  useEffect(() => {
    const filteredToTokens = filterTokens(
      fromToken.chainId,
      fromToken.coinGeckoId,
      fromTokenDenom,
      searchTokenName,
      SwapDirection.To
    );
    setFilteredToTokens(filteredToTokens);

    const filteredFromTokens = filterTokens(
      toToken.chainId,
      toToken.coinGeckoId,
      toTokenDenom,
      searchTokenName,
      SwapDirection.From
    );
    setFilteredFromTokens(filteredFromTokens);

    // TODO: need to automatically update from / to token to the correct swappable one when clicking the swap button
  }, [fromToken, toToken]);

  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([0, 0]);

  const [ratio, setRatio] = useState(0);

  const getSimulateSwap = async (initAmount?) => {
    setAmountLoading(true);
    const client = await CWStargate.init(
      accountOrai,
      ORAICHAIN_ID,
      oraichainNetwork.rpc
    );

    const data = await handleSimulateSwap(
      {
        fromInfo: fromTokenInfoData!,
        toInfo: toTokenInfoData!,
        originalFromInfo: originalFromToken,
        originalToInfo: originalToToken,
        amount: toAmount(
          initAmount ?? fromAmountToken,
          fromTokenInfoData!.decimals
        ).toString()
      },
      client
    );
    setAmountLoading(false);
    return data;
  };

  const estimateAverageRatio = async () => {
    const data = await getSimulateSwap(1);
    setRatio(
      toDisplay(
        data?.amount,
        fromTokenInfoData?.decimals,
        toTokenInfoData?.decimals
      )
    );
  };

  const estimateSwapAmount = async () => {
    const data = await getSimulateSwap();
    const minimumReceive = data?.amount
      ? calculateMinimum(data?.amount, userSlippage)
      : '0';
    setMininumReceive(toDisplay(minimumReceive));
    setSwapAmount([
      fromAmountToken,
      toDisplay(
        data?.amount,
        fromTokenInfoData?.decimals,
        toTokenInfoData?.decimals
      )
    ]);
  };

  const [taxRate, setTaxRate] = useState('');

  const queryTaxRate = async () => {
    const client = await CWStargate.init(
      accountOrai,
      ORAICHAIN_ID,
      oraichainNetwork.rpc
    );
    const data = await fetchTaxRate(client);
    setTaxRate(data?.rate);
  };

  useEffect(() => {
    queryTaxRate();
  }, []);

  useEffect(() => {
    estimateSwapAmount();
  }, [
    originalFromToken,
    toTokenInfoData,
    fromTokenInfoData,
    originalToToken,
    fromAmountToken
  ]);

  useEffect(() => {
    estimateAverageRatio();
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken]);

  useEffect(() => {
    // special case for tokens having no pools on Oraichain. When original from token is not swappable, then we switch to an alternative token on the same chain as to token
    if (
      isSupportedNoPoolSwapEvm(toToken.coinGeckoId) &&
      !isSupportedNoPoolSwapEvm(fromToken.coinGeckoId)
    ) {
      const fromTokenSameToChainId = getTokenOnSpecificChainId(
        fromToken.coinGeckoId,
        toToken.chainId
      );
      if (!fromTokenSameToChainId) {
        const sameChainIdTokens = evmTokens.find(
          t => t.chainId === toToken.chainId
        );
        if (!sameChainIdTokens)
          throw Error(
            'Impossible case! An EVM chain should at least have one token'
          );
        setSwapTokens([sameChainIdTokens.denom, toToken.denom]);
        return;
      }
      setSwapTokens([fromTokenSameToChainId.denom, toToken.denom]);
    }
  }, [fromToken]);

  const [balanceActive, setBalanceActive] = useState<BalanceType>(null);

  const handleBalanceActive = useCallback(
    (item: BalanceType) => {
      setBalanceActive(item);
    },
    [balanceActive]
  );
  const handleOpenTokensFromModal = useCallback(() => {
    setIsSelectFromTokenModal(true);
  }, []);
  const handleOpenTokensToModal = useCallback(() => {
    setIsSelectToTokenModal(true);
  }, []);

  console.log('accountEvm', accountEvm, accountEvm.evmosHexAddress);

  if (accountTron.evmosHexAddress) {
    console.log(
      'accountTron',
      accountTron,
      Address.getBase58Address(accountTron.evmosHexAddress)
    );
  }

  const handleSubmit = async () => {
    // account.handleUniversalSwap(chainId, { key: 'value' });
    if (fromAmountToken <= 0) {
      return;
    }
    // return displayToast(TToastType.TX_FAILED, {
    //   message: 'From amount should be higher than 0!'
    // });

    setSwapLoading(true);
    // displayToast(TToastType.TX_BROADCASTING);
    try {
      const client = await CWStargate.init(
        accountOrai,
        ORAICHAIN_ID,
        oraichainNetwork.rpc
      );
      const ics20Contract = new CwIcs20LatestQueryClient(
        client,
        IBC_WASM_CONTRACT
      );

      const cosmosWallet = new SwapCosmosWallet(client);
      const evmWallet = new SwapEvmWallet(originalFromToken.rpc);

      const universalSwapData: UniversalSwapData = {
        cosmosSender: accountOrai.bech32Address,
        originalFromToken: originalFromToken,
        originalToToken: originalToToken,
        simulateAmount: Number(
          toAmount(toAmountToken.toString(), originalToToken.decimals)
        ).toString(),
        simulateAverage: '0',
        userSlippage: userSlippage,
        fromAmount: Number(
          toAmount(fromAmountToken.toString(), originalFromToken.decimals)
        )
      };

      console.log('universalSwapData', universalSwapData);

      const univeralSwapHandler = new UniversalSwapHandler(
        {
          ...universalSwapData
        },
        {
          cosmosWallet,
          evmWallet,
          cwIcs20LatestClient: ics20Contract
        }
      );

      console.log('univeralSwapHandler', univeralSwapHandler);
      const toAddress = await univeralSwapHandler.getUniversalSwapToAddress(
        originalToToken.chainId,
        {
          metamaskAddress: accountEvm.evmosHexAddress,
          tronAddress: Address.getBase58Address(accountTron.evmosHexAddress)
        }
      );
      const { combinedReceiver, universalSwapType } = combineReceiver(
        accountOrai.bech32Address,
        originalFromToken,
        originalToToken,
        toAddress
      );

      console.log('combinedReceiver', combinedReceiver);
      console.log('universalSwapType', universalSwapType);

      const result = await univeralSwapHandler.processUniversalSwap(
        combinedReceiver,
        universalSwapType,
        {
          metamaskAddress: accountEvm.evmosHexAddress,
          tronAddress: Address.getBase58Address(accountTron.evmosHexAddress)
        }
      );

      console.log('result', result);

      // const oraiAddress = await handleCheckAddress();
      // const univeralSwapHandler = new UniversalSwapHandler(
      //   oraiAddress,
      //   originalFromToken,
      //   originalToToken,
      //   fromAmountToken,
      //   simulateData.amount,
      //   userSlippage,
      //   averageRatio.amount
      // );
      // const toAddress = await univeralSwapHandler.getUniversalSwapToAddress(
      //   originalToToken.chainId,
      //   {
      //     metamaskAddress,
      //     tronAddress
      //   }
      // );
      // const { combinedReceiver, universalSwapType } = combineReceiver(
      //   oraiAddress,
      //   originalFromToken,
      //   originalToToken,
      //   toAddress
      // );
      // checkEvmAddress(originalFromToken.chainId, metamaskAddress, tronAddress);
      // checkEvmAddress(originalToToken.chainId, metamaskAddress, tronAddress);
      // const checksumMetamaskAddress =
      //   window.Metamask.toCheckSumEthAddress(metamaskAddress);
      // const transactionHash = await univeralSwapHandler.processUniversalSwap(
      //   combinedReceiver,
      //   universalSwapType,
      //   {
      //     metamaskAddress: checksumMetamaskAddress,
      //     tronAddress
      //   }
      // );
      // if (transactionHash) {
      // displayToast(TToastType.TX_SUCCESSFUL, {
      //   customLink: getTransactionUrl(
      //     originalFromToken.chainId,
      //     transactionHash
      //   )
      // });
      // loadTokenAmounts({ oraiAddress, metamaskAddress, tronAddress });
      setSwapLoading(false);
      // }
    } catch (error) {
      console.log({ error });
      // handleErrorTransaction(error);
    } finally {
      setSwapLoading(false);
    }
  };

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={colors['plain-background']}
      style={[styles.container, isAndroid ? styles.pt30 : {}]}
      disableSafeArea={false}
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
      <SelectTokenModal
        bottomSheetModalConfig={{
          snapPoints: ['50%', '90%'],
          index: 1
        }}
        prices={prices}
        data={filteredFromTokens}
        close={() => {
          setIsSelectFromTokenModal(false);
        }}
        onNetworkModal={() => {
          setIsNetworkModal(true);
        }}
        setToken={denom => {
          setSwapTokens([denom, toTokenDenom]);
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
        close={() => {
          setIsSelectToTokenModal(false);
        }}
        onNetworkModal={() => {
          setIsNetworkModal(true);
        }}
        setToken={denom => {
          setSwapTokens([fromTokenDenom, denom]);
        }}
        setSearchTokenName={setSearchTokenName}
        isOpen={isSelectToTokenModal}
      />
      <SelectNetworkModal
        close={() => {
          setIsNetworkModal(false);
        }}
        isOpen={isNetworkModal}
      />
      <View>
        <View style={styles.boxTop}>
          <Text color={colors['text-title-login']} variant="h3" weight="700">
            Universal Swap
          </Text>
          <OWButtonIcon
            isBottomSheet
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

        <View>
          <SwapBox
            amount={fromAmountToken?.toString() ?? '0'}
            balanceValue={toDisplay(
              fromTokenBalance,
              originalFromToken?.decimals
            )}
            onChangeAmount={onChangeFromAmount}
            tokenActive={originalFromToken}
            onOpenTokenModal={handleOpenTokensFromModal}
            tokenFee={fromTokenFee}
          />
          <SwapBox
            amount={toAmountToken?.toString() ?? '0'}
            balanceValue={toDisplay(toTokenBalance, originalToToken?.decimals)}
            tokenActive={originalToToken}
            onOpenTokenModal={handleOpenTokensToModal}
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
            />
          </View>
        </View>
        <View style={styles.containerBtnBalance}>
          {balances.map((item, index) => {
            return (
              <OWButton
                key={item?.id}
                disabled={amountLoading}
                size="small"
                style={
                  balanceActive?.id === item?.id
                    ? styles.btnBalanceActive
                    : styles.btnBalanceInactive
                }
                textStyle={
                  balanceActive?.id === item?.id
                    ? styles.textBtnBalanceAtive
                    : styles.textBtnBalanceInActive
                }
                label={`${item?.value}%`}
                fullWidth={false}
                onPress={() => {
                  handleBalanceActive(item);
                  onMaxFromAmount(
                    (fromTokenBalance * BigInt(Number(item.value))) /
                      BigInt(Number(100)),
                    item.value
                  );
                }}
              />
            );
          })}
        </View>
        <OWButton
          label="Swap"
          style={styles.btnSwap}
          loading={false}
          disabled={amountLoading}
          textStyle={styles.textBtnSwap}
          onPress={handleSubmit}
        />
        <View style={styles.containerInfoToken}>
          <View style={styles.itemBottom}>
            <BalanceText>Quote</BalanceText>
            <BalanceText>
              {`1 ${originalFromToken?.name} ≈ ${ratio} ${originalToToken?.name}`}
            </BalanceText>
          </View>
          <View style={styles.itemBottom}>
            <BalanceText>Minimum Amount</BalanceText>
            <BalanceText>
              {(fromToken.minAmountSwap || '0') + ' ' + fromToken.name}
            </BalanceText>
          </View>
          <View style={styles.itemBottom}>
            <BalanceText>Minimum Receive</BalanceText>
            <BalanceText>
              {(minimumReceive || '0') + ' ' + toToken.name}
            </BalanceText>
          </View>
          {(!fromTokenFee && !toTokenFee) ||
          (fromTokenFee === 0 && toTokenFee === 0) ? (
            <View style={styles.itemBottom}>
              <BalanceText>Tax rate</BalanceText>
              <BalanceText>{Number(taxRate) * 100}%</BalanceText>
            </View>
          ) : null}
          <View style={styles.itemBottom}>
            <BalanceText>Slippage</BalanceText>
            <BalanceText>{userSlippage}%</BalanceText>
          </View>
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    textBtnBalanceAtive: {
      color: colors['purple-700']
    },
    textBtnBalanceInActive: {
      color: '#7C8397'
    },
    containerInfoToken: {
      backgroundColor: colors['bg-swap-box'],
      paddingHorizontal: 16,
      borderRadius: 8,
      paddingVertical: 11
    },
    btnBalanceActive: {
      width: metrics.screenWidth / 4 - 16,
      backgroundColor: colors['bg-swap-box'],
      height: 40,
      borderWidth: 1,
      borderColor: colors['purple-700']
    },
    btnBalanceInactive: {
      width: metrics.screenWidth / 4 - 16,
      backgroundColor: colors['bg-swap-box'],
      height: 40
    },
    containerBtnBalance: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16
    },
    btnSwapBox: {
      backgroundColor: colors['bg-swap-box'],
      borderRadius: 20,
      width: 40,
      height: 40,
      borderWidth: 4,
      borderColor: colors['plain-background']
    },
    pt30: {
      paddingTop: 30
    },
    boxTop: {
      paddingTop: 10,
      paddingBottom: 20,
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    textBtnSwap: {
      fontWeight: '700',
      fontSize: 16
    },
    itemBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 5
    },
    theFirstLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 10
    },
    ts10: {
      fontSize: 10
    },
    fDr: {
      flexDirection: 'row'
    },
    mr8: {
      marginRight: 8
    },
    btnTitleRight: {
      height: 30,
      width: 30
    },
    containerBtnLabelInputRight: {
      flexDirection: 'row'
    },
    btnLabelInputRight: {
      backgroundColor: colors['bg-tonner'],
      borderRadius: 2,
      height: 22,
      borderWidth: 0
    },
    btnSwap: {
      marginVertical: 16,
      borderRadius: 8
    },
    container: {
      marginHorizontal: 16
    },
    containerBtnCenter: {
      position: 'absolute',
      top: '50%',
      alignSelf: 'center',
      marginTop: -16
    },
    shadowBox: {
      shadowColor: colors['splash-background'],
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowRadius: 5,
      shadowOpacity: 1.0
    },
    containerScreen: {
      padding: 24,
      paddingTop: 76,
      borderTopLeftRadius: Platform.OS === 'ios' ? 32 : 0,
      borderTopRightRadius: Platform.OS === 'ios' ? 32 : 0
    },
    contentBlock: {
      padding: 12,
      backgroundColor: colors['content-background'],
      borderRadius: 4
    },

    title: {
      ...typography.h1,
      color: colors['icon'],
      textAlign: 'center',
      fontWeight: '700'
    }
  });
