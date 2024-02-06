import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  AddressInput,
  FeeButtons,
  // CoinInput,
  MemoInput,
  CoinInputEvm
} from '../../components/form';
import * as oasis from '@oasisprotocol/client';
import { ContextSigner, Signer } from '@oasisprotocol/client/dist/signature';
import { useStore } from '../../stores';
import bigInteger from 'big-integer';
import Big from 'big.js';
import ERC20_ABI from './erc20.json';

import { HeaderLayout } from '../../layouts';

import { observer } from 'mobx-react-lite';

import style from './style.module.scss';
import { useNotification } from '../../components/notification';

import { useIntl } from 'react-intl';
import { Button } from 'reactstrap';

import { useHistory, useLocation } from 'react-router';
import queryString from 'querystring';
import Web3 from 'web3';
import { useFeeEthereumConfig, useGasEthereumConfig, useSendTxConfig } from '@owallet/hooks';
import { fitPopupWindow, openPopupWindow, PopupSize } from '@owallet/popup';
import {
  ChainIdEnum,
  EthereumEndpoint,
  OasisTransaction,
  getOasisNic,
  hex2uint,
  parseRoseStringToBigNumber,
  signerFromPrivateKey,
  uint2hex
} from '@owallet/common';
import classNames from 'classnames';
import { GasEthereumInput } from '../../components/form/gas-ethereum-input';
import { FeeInput } from '../../components/form/fee-input';
import axios from 'axios';

export const SendEvmPage: FunctionComponent<{
  coinMinimalDenom?: string;
}> = observer(({ coinMinimalDenom }) => {
  const history = useHistory();
  let search = useLocation().search || coinMinimalDenom || '';
  if (search.startsWith('?')) {
    search = search.slice(1);
  }
  const query = queryString.parse(search) as {
    defaultDenom: string | undefined;
    defaultRecipient: string | undefined;
    defaultAmount: string | undefined;
    defaultMemo: string | undefined;
    detached: string | undefined;
  };

  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  const intl = useIntl();
  const inputRef = React.useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [coinMinimalDenom]);

  const notification = useNotification();

  const { chainStore, accountStore, queriesStore, analyticsStore, keyRingStore } = useStore();
  const current = chainStore.current;
  const decimals = chainStore.current.feeCurrencies[0].coinDecimals;
  console.log('🚀 ~ decimals:', decimals);

  const accountInfo = accountStore.getAccount(current.chainId);
  const [gasPrice, setGasPrice] = useState('0');
  const address = accountInfo.getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);

  const sendConfigs = useSendTxConfig(
    chainStore,
    current.chainId,
    accountInfo.msgOpts.send,
    address,
    queriesStore.get(current.chainId).queryBalances,
    EthereumEndpoint,
    chainStore.current.networkType === 'evm' && queriesStore.get(current.chainId).evm.queryEvmBalance,
    address
  );
  const initGasDefault = current.chainId !== ChainIdEnum.OasisNative ? 21000 : 1;
  const gasConfig = useGasEthereumConfig(
    chainStore,
    current.chainId,
    // Hard code gas limit of evm
    initGasDefault
  );
  const feeConfig = useFeeEthereumConfig(chainStore, current.chainId);

  useEffect(() => {
    // Get gas price
    (async () => {
      await getFee();
    })();
  }, [coinMinimalDenom]);

  const getFee = async () => {
    try {
      const response = await axios.post(chainStore.current.rest, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_gasPrice',
        headers: {
          'x-api-key': ''
        },
        params: []
      });
      setGasPrice(new Big(parseInt(response.data.result, 16)).div(new Big(10).pow(decimals)).toFixed(decimals));
    } catch (error) {
      console.log(error);
    }
  };
  const estimateGas = async () => {
    try {
      const web3 = new Web3(chainStore.current.rest);
      let estimate = 21000;
      if (coinMinimalDenom) {
        const tokenInfo = new web3.eth.Contract(
          // @ts-ignore
          ERC20_ABI,
          query?.defaultDenom?.split(':')?.[1]
        );
        estimate = await tokenInfo.methods
          .transfer(
            address,
            '0x' +
              parseFloat(new Big(sendConfigs.amountConfig.amount).mul(new Big(10).pow(decimals)).toString()).toString(
                16
              )
          )
          .estimateGas({
            from: query?.defaultDenom?.split(':')?.[1]
          });
      } else {
        estimate = await web3.eth.estimateGas({
          to: address,
          from: query?.defaultDenom?.split(':')?.[1]
        });
      }
      gasConfig.setGas(estimate ?? 21000);
      feeConfig.setFee(new Big(estimate ?? 21000).mul(new Big(gasPrice)).toFixed(decimals));
    } catch (error) {
      gasConfig.setGas(50000);
      feeConfig.setFee(new Big(50000).mul(new Big(gasPrice)).toFixed(decimals));
    }
  };
  useEffect(() => {
    if (chainStore.current.chainId !== ChainIdEnum.OasisNative) {
      estimateGas();
    }
  }, [gasPrice, sendConfigs.amountConfig.amount]);

  useEffect(() => {
    if (query.defaultDenom) {
      const currency = current.currencies.find((cur) => cur.coinMinimalDenom === query.defaultDenom);

      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [current.currencies, query.defaultDenom, sendConfigs.amountConfig]);

  const isDetachedPage = query.detached === 'true';

  useEffect(() => {
    if (isDetachedPage) {
      fitPopupWindow();
    }
  }, [isDetachedPage]);

  useEffect(() => {
    if (query.defaultRecipient) {
      sendConfigs.recipientConfig.setRawRecipient(query.defaultRecipient);
    }
    if (query.defaultAmount) {
      sendConfigs.amountConfig.setAmount(query.defaultAmount);
    }
    if (query.defaultMemo) {
      sendConfigs.memoConfig.setMemo(query.defaultMemo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.defaultAmount, query.defaultMemo, query.defaultRecipient]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
  const submitSignOasis = async (tx) => {
    const { bytes, amount, to } = tx;
    const signer = signerFromPrivateKey(bytes);

    const bigIntAmount = BigInt(parseRoseStringToBigNumber(amount).toString());
    const nic = getOasisNic(chainStore.current.raw.grpc);
    const chainContext = await nic.consensusGetChainContext();

    const tw = await OasisTransaction.buildTransfer(nic, signer as Signer, to, bigIntAmount);

    await OasisTransaction.sign(chainContext, signer as Signer, tw);

    await OasisTransaction.submit(nic, tw);

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
  };
  return (
    <>
      <form
        className={style.formContainer}
        onSubmit={async (e: any) => {
          e.preventDefault();

          if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
            try {
              const gasPrice =
                '0x' +
                parseInt(
                  new Big(parseFloat(feeConfig.feeRaw))
                    .mul(new Big(10).pow(decimals))
                    .div(parseFloat(gasConfig.gasRaw))
                    .toFixed(decimals)
                ).toString(16);

              const stdFee = {
                gas: '0x' + parseFloat(gasConfig.gasRaw).toString(16),
                gasPrice
              };
              (window as any).accountInfo = accountInfo;
              await accountInfo.sendToken(
                sendConfigs.amountConfig.amount,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                sendConfigs.amountConfig.sendCurrency!,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo,
                stdFee,
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: true,
                  networkType: chainStore.current.networkType
                },
                {
                  onBroadcasted: () => {
                    analyticsStore.logEvent('Send token tx broadcasted', {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      feeType: sendConfigs.feeConfig.feeType
                    });
                  },
                  onFulfill: async (tx) => {
                    console.log('🚀 ~ onSubmit={ ~ tx:', tx);
                    if (chainStore.current.chainId === ChainIdEnum.OasisNative) {
                      submitSignOasis(tx);
                      return;
                    }
                    if (tx?.status) {
                      notification.push({
                        placement: 'top-center',
                        type: tx?.status === '0x1' ? 'success' : 'danger',
                        duration: 5,
                        content:
                          tx?.status === '0x1'
                            ? `Transaction successful with tx: ${tx?.transactionHash}`
                            : `Transaction failed with tx: ${tx?.transactionHash}`,
                        canDelete: true,
                        transition: {
                          duration: 0.25
                        }
                      });
                    }
                  }
                },
                sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.startsWith('erc20')
                  ? {
                      type: 'erc20',
                      from: address,
                      contract_addr: sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.split(':')[1],
                      recipient: sendConfigs.recipientConfig.recipient,
                      amount: sendConfigs.amountConfig.amount
                    }
                  : null
              );
              if (!isDetachedPage) {
                history.replace('/');
              }
              notification.push({
                placement: 'top-center',
                type: 'success',
                duration: 5,
                content: 'Transaction submitted!',
                canDelete: true,
                transition: {
                  duration: 0.25
                }
              });
            } catch (e: any) {
              if (!isDetachedPage) {
                history.replace('/');
              }

              notification.push({
                type: 'warning',
                placement: 'top-center',
                duration: 5,
                content: `Fail to send token: ${e.message}`,
                canDelete: true,
                transition: {
                  duration: 0.25
                }
              });
            } finally {
              // XXX: If the page is in detached state,
              // close the window without waiting for tx to commit. analytics won't work.
              if (isDetachedPage) {
                window.close();
              }
            }
          }
        }}
      >
        <div className={style.formInnerContainer}>
          <div>
            <AddressInput
              inputRef={inputRef}
              recipientConfig={sendConfigs.recipientConfig}
              memoConfig={sendConfigs.memoConfig}
              label={intl.formatMessage({ id: 'send.input.recipient' })}
              placeholder="Enter recipient address"
            />
            <CoinInputEvm
              amountConfig={sendConfigs.amountConfig}
              feeConfig={feeConfig.feeRaw}
              label={intl.formatMessage({ id: 'send.input.amount' })}
              balanceText={intl.formatMessage({
                id: 'send.input-button.balance'
              })}
              placeholder="Enter your amount"
            />
            <MemoInput
              memoConfig={sendConfigs.memoConfig}
              label={intl.formatMessage({ id: 'send.input.memo' })}
              placeholder="Enter your memo message"
            />
            <GasEthereumInput
              label={intl.formatMessage({ id: 'sign.info.gas' })}
              gasConfig={gasConfig}
              // defaultValue={
              //   parseInt(dataSign?.data?.data?.data?.estimatedGasLimit) || 0
              // }
            />
            <FeeInput
              label={intl.formatMessage({ id: 'sign.info.fee' })}
              gasConfig={gasConfig}
              feeConfig={feeConfig}
              gasPrice={gasPrice}
              decimals={decimals}
              denom={sendConfigs.feeConfig}
              classNameInput={style.input}
              classNameInputGroup={style.inputGroup}
            />
            {/* <FeeButtons
              feeConfig={sendConfigs.feeConfig}
              gasConfig={sendConfigs.gasConfig}
              priceStore={priceStore}
              label={intl.formatMessage({ id: 'send.input.fee' })}
              feeSelectLabels={{
                low: intl.formatMessage({ id: 'fee-buttons.select.low' }),
                average: intl.formatMessage({
                  id: 'fee-buttons.select.average'
                }),
                high: intl.formatMessage({ id: 'fee-buttons.select.high' })
              }}
              gasLabel={intl.formatMessage({ id: 'send.input.gas' })}
            /> */}
          </div>
          <div style={{ flex: 1 }} />
          <Button
            type="submit"
            block
            data-loading={accountInfo.isSendingMsg === 'send'}
            disabled={!accountInfo.isReadyToSendMsgs || !txStateIsValid}
            className={style.sendBtn}
            style={{
              cursor: accountInfo.isReadyToSendMsgs || !txStateIsValid ? 'default' : 'pointer'
            }}
          >
            <span className={style.sendBtnText}>
              {intl.formatMessage({
                id: 'send.button.send'
              })}
            </span>
          </Button>
        </div>
      </form>
      {/* </HeaderLayout> */}
    </>
  );
});
