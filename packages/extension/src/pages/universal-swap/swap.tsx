import React, { FunctionComponent, useEffect, useState } from 'react';
import style from './swap.module.scss';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import {
  DEFAULT_SLIPPAGE,
  GAS_ESTIMATION_SWAP_DEFAULT,
  ORAI,
  TRON_ID,
  ETH_ID,
  ORAICHAIN_ID,
  toDisplay,
  getBase58Address,
  CWStargate,
  getEvmAddress,
  getTokenOnOraichain,
  getTokenOnSpecificChainId,
  feeEstimate
} from '@owallet/common';
import { SwapInput } from './components/input-swap';
import { Button } from 'reactstrap';
import { useIntl } from 'react-intl';
import { useRelayerFee, useTaxRate, useLoadTokens, useCoinGeckoPrices } from '@owallet/hooks';
import { fetchTokenInfos, toSubAmount } from '@owallet/common';
import { evmTokens, filterNonPoolEvmTokens, SwapDirection } from '@owallet/common';
import {
  isEvmNetworkNativeSwapSupported,
  isEvmSwappable,
  isSupportedNoPoolSwapEvm,
  UniversalSwapData,
  UniversalSwapHandler
} from '@oraichain/oraidex-universal-swap';
import { handleSimulateSwap } from '@oraichain/oraidex-universal-swap';
import {
  TokenItemType,
  NetworkChainId,
  oraichainNetwork,
  tokenMap,
  toAmount,
  network,
  Networks,
  calculateMinReceive
} from '@oraichain/oraidex-common';
import { OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';

const ONE_QUARTER = '25';
const HALF = '50';
const THREE_QUARTERS = '75';
export const MAX = '100';

export const UniversalSwapPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, universalSwapStore } = useStore();
  const { chainId } = chainStore.current;
  const [client, setClient] = useState(null);

  const getClient = async () => {
    const cwClient = await CWStargate.init(accountOrai, ORAICHAIN_ID, oraichainNetwork.rpc);
    setClient(cwClient);
  };

  useEffect(() => {
    getClient();
  }, []);
  const accountEvm = accountStore.getAccount(ETH_ID);
  const accountTron = accountStore.getAccount(TRON_ID);
  const accountOrai = accountStore.getAccount(ORAICHAIN_ID);

  const intl = useIntl();
  const { data: prices } = useCoinGeckoPrices();
  const taxRate = useTaxRate(client);

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
    }
  };

  useEffect(() => {
    setTimeout(() => {
      handleFetchAmounts();
    }, 2000);
  }, []);

  const getTokenInfos = async () => {
    const data = await fetchTokenInfos([fromToken!, toToken!], client);
    setTokenInfoData(data);
  };

  useEffect(() => {
    getTokenInfos();
  }, [toTokenDenom, fromTokenDenom]);

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
    : getTokenOnOraichain(tokenMap[fromTokenDenom].coinGeckoId) ?? tokenMap[fromTokenDenom];
  const toToken = isEvmSwap
    ? tokenMap[toTokenDenom]
    : getTokenOnOraichain(tokenMap[toTokenDenom].coinGeckoId) ?? tokenMap[toTokenDenom];

  useEffect(() => {
    const filteredToTokens = filterNonPoolEvmTokens(
      fromToken.chainId,
      fromToken.coinGeckoId,
      fromTokenDenom,
      searchTokenName,
      SwapDirection.To
    );
    setFilteredToTokens(filteredToTokens);

    const filteredFromTokens = filterNonPoolEvmTokens(
      toToken.chainId,
      toToken.coinGeckoId,
      toTokenDenom,
      searchTokenName,
      SwapDirection.From
    );
    setFilteredFromTokens(filteredFromTokens);

    // TODO: need to automatically update from / to token to the correct swappable one when clicking the swap button
  }, [fromToken, toToken, toTokenDenom, fromTokenDenom]);

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

  const subAmountFrom = toSubAmount(universalSwapStore.getAmount, originalFromToken);
  const subAmountTo = toSubAmount(universalSwapStore.getAmount, originalToToken);
  const fromTokenBalance = originalFromToken
    ? BigInt(universalSwapStore.getAmount?.[originalFromToken.denom] ?? '0') + subAmountFrom
    : BigInt(0);

  const toTokenBalance = originalToToken
    ? BigInt(universalSwapStore.getAmount?.[originalToToken.denom] ?? '0') + subAmountTo
    : BigInt(0);

  const onChangeFromAmount = (amount: string | undefined) => {
    if (!amount) return setSwapAmount([undefined, toAmountToken]);
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

  const [ratio, setRatio] = useState(null);

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
            originalFromToken.decimals
          )
        : '0';

      setMininumReceive(toDisplay(minimumReceive));
      if (data) {
        const isWarningSlippage = +minimumReceive > +data.amount;
        setIsWarningSlippage(isWarningSlippage);
        setSwapAmount([fromAmountBalance, Number(data.amount)]);
      }
      setAmountLoading(false);
    } catch (error) {
      console.log('error', error);

      setAmountLoading(false);
    }
  };

  useEffect(() => {
    estimateSwapAmount(fromAmountToken);
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, fromAmountToken]);

  useEffect(() => {
    estimateAverageRatio();
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, client]);

  return (
    <div>
      <SwapInput
        amount={fromAmountToken?.toString() ?? '0'}
        tokens={filteredFromTokens}
        selectedToken={originalFromToken}
        prices={prices}
        onChangeAmount={onChangeFromAmount}
        balanceValue={toDisplay(fromTokenBalance, originalFromToken?.decimals)}
        setToken={denom => {
          setSwapTokens([denom, toTokenDenom]);
          setSwapAmount([0, 0]);
        }}
      />
      <SwapInput
        amount={toDisplay(toAmountToken.toString()).toString() ?? '0'}
        tokens={filteredToTokens}
        selectedToken={originalToToken}
        prices={prices}
        onChangeAmount={onChangeFromAmount}
        balanceValue={toDisplay(toTokenBalance, originalToToken?.decimals)}
        setToken={denom => {
          setSwapTokens([fromTokenDenom, denom]);
          setSwapAmount([0, 0]);
        }}
      />
      <Button
        type="submit"
        block
        data-loading={accountOrai.isSendingMsg === 'send'}
        disabled={!accountOrai.isReadyToSendMsgs}
        className={style.sendBtn}
        style={{
          cursor: accountOrai.isReadyToSendMsgs ? '' : 'pointer'
        }}
      >
        <span className={style.sendBtnText}>Swap</span>
      </Button>
    </div>
  );
});
