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
  getTokenOnOraichain,
  getTokenOnSpecificChainId,
  feeEstimate,
  getTransferTokenFee
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
import { useNotification } from '../../components/notification';
import { SwapCosmosWallet, SwapEvmWallet } from '@owallet/common';

const ONE_QUARTER = '25';
const HALF = '50';
const THREE_QUARTERS = '75';
export const MAX = '100';
const RELAYER_DECIMAL = 6; // TODO: hardcode decimal relayerFee

export const UniversalSwapPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, universalSwapStore } = useStore();
  const { chainId } = chainStore.current;
  const [client, setClient] = useState(null);
  const notification = useNotification();

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
  const relayerFee = useRelayerFee(client);
  const relayerFeeToken = relayerFee.reduce((acc, cur) => {
    if (
      originalFromToken &&
      originalToToken &&
      originalFromToken.chainId !== originalToToken.chainId &&
      (cur.prefix === originalFromToken.prefix || cur.prefix === originalToToken.prefix)
    ) {
      return +cur.amount + acc;
    }
    return acc;
  }, 0);

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

  useEffect(() => {
    getTokenFee(originalToToken.prefix + originalToToken.contractAddress, fromToken.chainId, toToken.chainId, 'to');
  }, [originalToToken, fromToken, toToken, originalToToken]);

  useEffect(() => {
    getTokenFee(
      originalFromToken.prefix + originalFromToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      'from'
    );
  }, [originalToToken, fromToken, toToken, originalToToken]);

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

  const handleSubmit = async () => {
    // account.handleUniversalSwap(chainId, { key: 'value' });
    if (fromAmountToken <= 0) {
      notification.push({
        placement: 'top-center',
        type: 'danger',
        duration: 5,
        content: 'From amount should be higher than 0!',
        canDelete: true,
        transition: {
          duration: 0.25
        }
      });
      return;
    }

    setSwapLoading(true);
    try {
      //@ts-ignore
      const cosmosWallet = new SwapCosmosWallet({ client, owallet: window.owallet });

      const isTron = Number(originalFromToken.chainId) === Networks.tron;
      //@ts-ignore
      const evmWallet = new SwapEvmWallet({ isTronToken: isTron, tronWeb: window.tronWeb, ethereum: window.ethereum });

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
        notification.push({
          placement: 'top-center',
          type: 'success',
          duration: 5,
          content: 'Transaction successful',
          canDelete: true,
          transition: {
            duration: 0.25
          }
        });
        await handleFetchAmounts();
      }
    } catch (error) {
      setSwapLoading(false);
      console.log('error', error);

      notification.push({
        placement: 'top-center',
        type: 'danger',
        duration: 5,
        content: 'Transaction failed',
        canDelete: true,
        transition: {
          duration: 0.25
        }
      });
    } finally {
      setSwapLoading(false);
    }
  };

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
        editable={false}
        onChangeAmount={onChangeFromAmount}
        balanceValue={toDisplay(toTokenBalance, originalToToken?.decimals)}
        setToken={denom => {
          setSwapTokens([fromTokenDenom, denom]);
          setSwapAmount([0, 0]);
        }}
      />
      <div className={style.legend}>
        <div className={style.label}>Quote :</div>
        <div style={{ minWidth: '16px' }} />
        <div className={style.value}>
          {`1 ${originalFromToken?.name} ≈ ${toDisplay(
            ratio?.amount,
            fromTokenInfoData?.decimals,
            toTokenInfoData?.decimals
          )} ${originalToToken?.name}`}
        </div>
      </div>
      <div className={style.legend}>
        <div className={style.label}>Minimum Receive :</div>
        <div style={{ minWidth: '16px' }} />
        <div className={style.value}>{(minimumReceive || '0') + ' ' + toToken.name}</div>
      </div>

      {(!fromTokenFee && !toTokenFee) || (fromTokenFee === 0 && toTokenFee === 0) ? (
        <div className={style.legend}>
          <div className={style.label}>Tax rate :</div>
          <div style={{ minWidth: '16px' }} />
          <div className={style.value}>{Number(taxRate) * 100}%</div>
        </div>
      ) : null}
      {!!relayerFeeToken && (
        <div className={style.legend}>
          <div className={style.label}>Relayer Fee :</div>
          <div style={{ minWidth: '16px' }} />
          <div className={style.value}>{toAmount(relayerFeeToken, RELAYER_DECIMAL)} ORAI</div>
        </div>
      )}
      <Button
        type="submit"
        block
        data-loading={accountOrai.isSendingMsg === 'send'}
        disabled={!accountOrai.isReadyToSendMsgs}
        className={style.sendBtn}
        style={{
          cursor: accountOrai.isReadyToSendMsgs ? '' : 'pointer'
        }}
        onClick={async e => {
          handleSubmit();
        }}
      >
        <span className={style.sendBtnText}>Swap</span>
      </Button>
    </div>
  );
});
