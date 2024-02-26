import React, { FunctionComponent, useEffect, useState } from 'react';
import { AddressInput, FeeButtons, CoinInput, MemoInput } from '../../components/form';
import { useStore } from '../../stores';



import { observer } from 'mobx-react-lite';

import style from './style.module.scss';
import { useNotification } from '../../components/notification';

import { useIntl } from 'react-intl';
import { Button } from 'reactstrap';

import { useHistory, useLocation } from 'react-router';
import queryString from 'querystring';

import { useSendTxConfig } from '@owallet/hooks';
import { fitPopupWindow,  } from '@owallet/popup';
import { EthereumEndpoint } from '@owallet/common';

export const SendPage: FunctionComponent<{
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
  const inputRef = React.useRef(null);
  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [coinMinimalDenom]);
  const intl = useIntl();

  const notification = useNotification();

  const { chainStore, accountStore, priceStore, queriesStore, analyticsStore } = useStore();
  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    current.chainId,
    accountInfo.msgOpts.send,
    accountInfo.bech32Address,
    queriesStore.get(current.chainId).queryBalances,
    EthereumEndpoint,
    chainStore.current.networkType === 'evm' && queriesStore.get(current.chainId).evm.queryEvmBalance,
    chainStore.current.networkType === 'evm' && accountInfo.evmosHexAddress
  );

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

  return (
    <>
      <form
        className={style.formContainer}
        onSubmit={async (e: any) => {
          e.preventDefault();
          if (accountInfo.isReadyToSendMsgs && txStateIsValid) {
            try {
              const stdFee = sendConfigs.feeConfig.toStdFee();
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
                  networkType: chainStore.current.networkType,
                  chainId: chainStore.current.chainId
                },
                {
                  onBroadcasted: () => {
                    analyticsStore.logEvent('Send token tx broadcasted', {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      feeType: sendConfigs.feeConfig.feeType
                    });
                  },
                  onFulfill: (tx) => {
                    notification.push({
                      placement: 'top-center',
                      type: tx?.data ? 'success' : 'danger',
                      duration: 5,
                      content: tx?.data
                        ? `Transaction successful with tx: ${tx?.hash}`
                        : `Transaction failed with tx: ${tx?.hash}`,
                      canDelete: true,
                      transition: {
                        duration: 0.25
                      }
                    });
                  }
                }
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
              console.log(e.message, 'Catch Error on send!!!');
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
            <CoinInput
              amountConfig={sendConfigs.amountConfig}
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
            <FeeButtons
              feeConfig={sendConfigs.feeConfig}
              gasConfig={sendConfigs.gasConfig}
              priceStore={priceStore}
              label={intl.formatMessage({ id: 'send.input.fee' })}
              feeSelectLabels={{
                low: intl.formatMessage({ id: 'fee-buttons.select.slow' }),
                average: intl.formatMessage({
                  id: 'fee-buttons.select.average'
                }),
                high: intl.formatMessage({ id: 'fee-buttons.select.fast' })
              }}
              gasLabel={intl.formatMessage({ id: 'send.input.gas' })}
            />
          </div>
          <div style={{ flex: 1 }} />
          <Button
            type="submit"
            block
            data-loading={accountInfo.isSendingMsg === 'send'}
            disabled={!accountInfo.isReadyToSendMsgs || !txStateIsValid}
            className={style.sendBtn}
            style={{
              cursor: accountInfo.isReadyToSendMsgs || !txStateIsValid ? '' : 'pointer'
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
    </>
  );
});
