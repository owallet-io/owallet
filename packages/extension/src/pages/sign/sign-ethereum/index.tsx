import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'reactstrap';

import { HeaderLayout } from '../../../layouts';

import style from '../style.module.scss';
import Big from 'big.js';

import { useStore } from '../../../stores';

import classnames from 'classnames';
import { EthereumDataTab } from './ethereum-data-tab';
import { EthereumDetailsTab } from './ethereum-details-tab';
import { FormattedMessage, useIntl } from 'react-intl';

import { useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';
import {
  useInteractionInfo,
  useSignDocHelper,
  useGasConfig,
  useFeeConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useFeeEthereumConfig,
  useGasEthereumConfig
} from '@owallet/hooks';
import { ADR36SignDocDetailsTab } from '../adr-36';
import { ChainIdHelper } from '@owallet/cosmos';

enum Tab {
  Details,
  Data
}

export const SignEthereumPage: FunctionComponent = observer(() => {
  const history = useHistory();

  const [tab, setTab] = useState<Tab>(Tab.Details);

  const intl = useIntl();

  const { chainStore, keyRingStore, signInteractionStore } = useStore();

  useEffect(() => {
    return () => {
      signInteractionStore.reject();
    };
  }, []);

  const [signer, setSigner] = useState('');
  const [origin, setOrigin] = useState<string | undefined>();
  const [isADR36WithString, setIsADR36WithString] = useState<boolean | undefined>();

  const current = chainStore.current;
  // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
  const [dataSign, setDataSign] = useState(null);
  const [gasPrice, setGasPrice] = useState('0');
  const gasConfig = useGasEthereumConfig(
    chainStore,
    current.chainId,
    parseInt(dataSign?.data?.data?.data?.estimatedGasLimit, 16)
  );
  const feeConfig = useFeeEthereumConfig(chainStore, current.chainId);
  const decimals = useRef(chainStore.current.feeCurrencies[0].coinDecimals);

  useEffect(() => {
    try {
      if (dataSign) {
        decimals.current = dataSign?.data?.data?.data?.decimals;
        let chainIdSign = dataSign?.data?.chainId;
        // if (!chainIdSign?.toString()?.startsWith('0x'))
        //   chainIdSign = '0x' + Number(chainIdSign).toString(16);

        chainStore.selectChain(chainIdSign);

        const estimatedGasLimit = parseInt(dataSign?.data?.data?.data?.estimatedGasLimit, 16);
        const estimatedGasPrice = new Big(parseInt(dataSign?.data?.data?.data?.estimatedGasPrice, 16))
          .div(new Big(10).pow(decimals.current))
          .toFixed(decimals.current);

        if (!isNaN(estimatedGasLimit) && estimatedGasPrice !== 'NaN') {
          setGasPrice(estimatedGasPrice);
          gasConfig.setGas(estimatedGasLimit);
          feeConfig.setFee(new Big(estimatedGasLimit).mul(estimatedGasPrice).toFixed(decimals.current));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [dataSign]);

  const memoConfig = useMemoConfig(chainStore, current.chainId);

  useEffect(() => {
    if (signInteractionStore.waitingEthereumData) {
      setDataSign(signInteractionStore.waitingEthereumData);
    }
  }, [signInteractionStore.waitingEthereumData]);

  // If the preferNoSetFee or preferNoSetMemo in sign options is true,
  // don't show the fee buttons/memo input by default
  // But, the sign options would be removed right after the users click the approve/reject button.
  // Thus, without this state, the fee buttons/memo input would be shown after clicking the approve buttion.
  const [isProcessing, setIsProcessing] = useState(false);

  const needSetIsProcessing = false;
  const preferNoSetFee = false;
  const preferNoSetMemo = false;

  const interactionInfo = useInteractionInfo(() => {
    if (needSetIsProcessing) {
      setIsProcessing(true);
    }

    signInteractionStore.rejectAll();
  });

  // Check that the request is delivered
  // and the chain is selected properly.
  // The chain store loads the saved chain infos including the suggested chain asynchronously on init.
  // So, it can be different the current chain and the expected selected chain for a moment.
  const isLoaded = useMemo(() => {
    // if (!signDocHelper.signDocWrapper) {
    //   return false;
    // }

    return (
      ChainIdHelper.parse(chainStore.current.chainId).identifier ===
      ChainIdHelper.parse(chainStore.selectedChainId).identifier
    );
  }, [
    // signDocHelper.signDocWrapper,
    chainStore.current.chainId,
    chainStore.selectedChainId
  ]);

  // If this is undefined, show the chain name on the header.
  // If not, show the alternative title.
  const alternativeTitle = (() => {
    if (!isLoaded) {
      return '';
    }

    // if (
    //   signDocHelper.signDocWrapper &&
    //   signDocHelper.signDocWrapper.isADR36SignDoc
    // ) {
    //   return 'Prove Ownership';
    // }

    return undefined;
  })();

  const approveIsDisabled = (() => {
    // if (!isLoaded) {
    //   return true;
    // }

    // if (!signDocHelper.signDocWrapper) {
    //   return true;
    // }

    // // If the sign doc is for ADR-36,
    // // there is no error related to the fee or memo...
    // if (signDocHelper.signDocWrapper.isADR36SignDoc) {
    //   return false;
    // }

    return feeConfig.getError() != null;
  })();
  const gasPriceToBig = () => {
    if (parseFloat(feeConfig.feeRaw) <= 0 || parseFloat(gasConfig.gasRaw) <= 0) return '0';
    return parseInt(
      new Big(parseFloat(feeConfig.feeRaw))
        .mul(new Big(10).pow(decimals.current))
        .div(parseFloat(gasConfig.gasRaw))
        .toFixed(decimals.current)
    ).toString(16);
  };
  return (
    // <HeaderLayout
    //   showChainName={alternativeTitle == null}
    //   alternativeTitle={alternativeTitle != null ? alternativeTitle : undefined}
    //   canChangeChainInfo={false}
    //   onBackButton={
    //     interactionInfo.interactionInternal
    //       ? () => {
    //           history.goBack();
    //         }
    //       : undefined
    //   }
    // >
    <div
      style={{
        padding: 20,
        backgroundColor: '#FFFFFF',
        height: '100%',
        overflowX: 'auto'
      }}
    >
      {
        /*
         Show the informations of tx when the sign data is delivered.
         If sign data not delivered yet, show the spinner alternatively.
         */
        isLoaded ? (
          <div className={style.container}>
            <div
              style={{
                color: '#353945',
                fontSize: 24,
                fontWeight: 500,
                textAlign: 'center',
                paddingBottom: 24
              }}
            >
              {chainStore?.current?.raw?.chainName || 'Oraichain'}
            </div>
            <div className={classnames(style.tabs)}>
              <ul>
                <li className={classnames({ activeTabs: tab === Tab.Details })}>
                  <a
                    className={classnames(style.tab, {
                      activeText: tab === Tab.Details
                    })}
                    onClick={() => {
                      setTab(Tab.Details);
                    }}
                  >
                    {intl.formatMessage({
                      id: 'sign.tab.details'
                    })}
                  </a>
                </li>
                <li className={classnames({ activeTabs: tab === Tab.Data })}>
                  <a
                    className={classnames(style.tab, {
                      activeText: tab === Tab.Data
                    })}
                    onClick={() => {
                      setTab(Tab.Data);
                    }}
                  >
                    {intl.formatMessage({
                      id: 'sign.tab.data'
                    })}
                  </a>
                </li>
              </ul>
            </div>
            <div
              className={classnames(style.tabContainer, {
                [style.dataTab]: tab === Tab.Data
              })}
            >
              {tab === Tab.Data ? <EthereumDataTab data={dataSign} /> : null}
              {
                tab === Tab.Details && (
                  // signDocHelper.signDocWrapper?.isADR36SignDoc ? (
                  // <ADR36SignDocDetailsTab
                  //   signDocWrapper={signDocHelper.signDocWrapper}
                  //   isADR36WithString={isADR36WithString}
                  //   origin={origin}
                  // />
                  // ) : (
                  <EthereumDetailsTab
                    dataSign={dataSign}
                    gasPrice={gasPrice}
                    decimals={decimals.current}
                    // signDocHelper={signDocHelper}
                    memoConfig={memoConfig}
                    feeConfig={feeConfig}
                    gasConfig={gasConfig}
                    isInternal={interactionInfo.interaction && interactionInfo.interactionInternal}
                    preferNoSetFee={preferNoSetFee}
                    preferNoSetMemo={preferNoSetMemo}
                  />
                )
                // ) : null}
              }
            </div>
            <div style={{ flex: 1 }} />
            <div className={style.buttons}>
              {keyRingStore.keyRingType === 'ledger' && signInteractionStore.isLoading ? (
                <Button className={style.button} disabled={true} outline>
                  <FormattedMessage id="sign.button.confirm-ledger" /> <i className="fa fa-spinner fa-spin fa-fw" />
                </Button>
              ) : (
                <React.Fragment>
                  <Button
                    className={classnames(style.button, style.rejectBtn)}
                    color=""
                    // disabled={}
                    // data-loading={signInteractionStore.isLoading}
                    onClick={async (e) => {
                      e.preventDefault();

                      if (needSetIsProcessing) {
                        setIsProcessing(true);
                      }
                      await signInteractionStore.reject();
                      if (interactionInfo.interaction && !interactionInfo.interactionInternal) {
                        window.close();
                      }
                      history.goBack();
                    }}
                    outline
                  >
                    {intl.formatMessage({
                      id: 'sign.button.reject'
                    })}
                  </Button>
                  <Button
                    className={classnames(style.button, style.approveBtn)}
                    color=""
                    disabled={approveIsDisabled}
                    data-loading={signInteractionStore.isLoading}
                    onClick={async (e) => {
                      e.preventDefault();

                      if (needSetIsProcessing) {
                        setIsProcessing(true);
                      }

                      // if (signDocHelper.signDocWrapper) {
                      const gasPrice = '0x' + gasPriceToBig();
                      await signInteractionStore.approveEthereumAndWaitEnd({
                        gasPrice,
                        gasLimit: `0x${parseFloat(gasConfig.gasRaw).toString(16)}`
                        // fees: `0x${parseFloat(feeConfig.feeRaw).toString(16)}`
                      });
                      // }

                      if (interactionInfo.interaction && !interactionInfo.interactionInternal) {
                        window.close();
                      } else {
                        history.goBack();
                      }
                    }}
                  >
                    {intl.formatMessage({
                      id: 'sign.button.approve'
                    })}
                  </Button>
                </React.Fragment>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <i className="fas fa-spinner fa-spin fa-2x text-gray" />
          </div>
        )
      }
      {/* </HeaderLayout> */}
    </div>
  );
});
