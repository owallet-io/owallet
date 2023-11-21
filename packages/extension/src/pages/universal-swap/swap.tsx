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
  oraichainNetwork,
  TokenItemType,
  getEvmAddress
} from '@owallet/common';
import { SwapInput } from './components/input-swap';
import { Button } from 'reactstrap';
import { useIntl } from 'react-intl';
import { useRelayerFee, useTaxRate, useLoadTokens, useCoinGeckoPrices } from '@owallet/hooks';
import { fetchTokenInfos, toSubAmount } from '@owallet/common';

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

      console.log('loadTokenParams', loadTokenParams);

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

  console.log('universalSwapStore.getAmount', universalSwapStore.getAmount);
  console.log('universalSwapStore.prices', prices);

  return (
    <div>
      <SwapInput tokens={[1, 2, 3, 4, 5]} selectedToken={1} />
      <SwapInput tokens={[1, 2, 3, 4, 5]} selectedToken={3} />
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
        <span className={style.sendBtnText}>
          {intl.formatMessage({
            id: 'send.button.send'
          })}
        </span>
      </Button>
    </div>
  );
});
