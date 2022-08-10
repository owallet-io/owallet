import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  AddressInput,
  FeeButtons,
  CoinInput,
  MemoInput
} from '../../components/form';
import { useStore } from '../../stores';

import { HeaderLayout, LayoutSpace, LayoutHidePage } from '../../layouts';

import { observer } from 'mobx-react-lite';

import style from './style.module.scss';
import { useNotification } from '../../components/notification';

import { useIntl } from 'react-intl';
import { Button } from 'reactstrap';

import { useHistory, useLocation } from 'react-router';
import queryString from 'querystring';

import { useSendTxConfig } from '@owallet/hooks';
import { fitPopupWindow, openPopupWindow, PopupSize } from '@owallet/popup';
import { EthereumEndpoint } from '@owallet/common';
import classNames from 'classnames';

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
  };

  useEffect(() => {
    // Scroll to top on page mounted.
    if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  const intl = useIntl();

  const notification = useNotification();

  const { chainStore, accountStore, priceStore, queriesStore, analyticsStore } =
    useStore();
  const current = chainStore.current;

  const accountInfo = accountStore.getAccount(current.chainId);
  const accountEthInfo = accountStore.getAccount(current.chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    current.chainId,
    accountInfo.msgOpts.send,
    accountInfo.bech32Address,
    queriesStore.get(current.chainId).queryBalances,
    EthereumEndpoint,
    chainStore.current.networkType === 'evm' &&
      queriesStore.get(current.chainId).evm.queryEvmBalance,
    chainStore.current.networkType === 'evm' && accountInfo.evmosHexAddress
  );

  useEffect(() => {
    if (query.defaultDenom) {
      const currency = current.currencies.find(
        (cur) => cur.coinMinimalDenom === query.defaultDenom
      );

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
    // <HeaderLayout
    //   showChainName={false}
    //   canChangeChainInfo={false}
    //   onBackButton={
    //     isDetachedPage
    //       ? undefined
    //       : () => {
    //           history.goBack();
    //         }
    //   }
    //   rightRenderer={
    //     isDetachedPage ? undefined : (
    //       <div
    //         style={{
    //           height: '64px',
    //           display: 'flex',
    //           flexDirection: 'row',
    //           alignItems: 'center',
    //           paddingRight: '20px'
    //         }}
    //       >
    //         <i
    //           className="fas fa-external-link-alt"
    //           style={{
    //             cursor: 'pointer',
    //             padding: '4px',
    //             color: '#ffffff'
    //           }}
    //           onClick={async (e) => {
    //             e.preventDefault();

    //             const windowInfo = await browser.windows.getCurrent();

    //             let queryString = `?detached=true&defaultDenom=${sendConfigs.amountConfig.sendCurrency.coinMinimalDenom}`;
    //             if (sendConfigs.recipientConfig.rawRecipient) {
    //               queryString += `&defaultRecipient=${sendConfigs.recipientConfig.rawRecipient}`;
    //             }
    //             if (sendConfigs.amountConfig.amount) {
    //               queryString += `&defaultAmount=${sendConfigs.amountConfig.amount}`;
    //             }
    //             if (sendConfigs.memoConfig.memo) {
    //               queryString += `&defaultMemo=${sendConfigs.memoConfig.memo}`;
    //             }

    //             await openPopupWindow(
    //               browser.runtime.getURL(`/popup.html#/send${queryString}`),
    //               undefined,
    //               {
    //                 top: (windowInfo.top || 0) + 80,
    //                 left:
    //                   (windowInfo.left || 0) +
    //                   (windowInfo.width || 0) -
    //                   PopupSize.width -
    //                   20
    //               }
    //             );
    //             window.close();
    //           }}
    //         />
    //       </div>
    //     )
    //   }
    // >
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
                  onFulfill: (tx) => {
                    console.log(
                      tx,
                      'TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!'
                    );
                    notification.push({
                      placement: 'top-center',
                      // type: tx?.status === '0x1' ? 'success' : 'danger',
                      type: 'info',
                      duration: 5,
                      // content:
                      //   tx?.status === '0x1'
                      //     ? `Transaction successful with tx: ${tx?.transactionHash}`
                      //     : `Transaction failed with tx: ${tx?.transactionHash}`,
                      content: 'Transaction succeeded!',
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
            }
          }
        }}
      >
        <div className={style.formInnerContainer}>
          <div>
            <AddressInput
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
              cursor:
                accountInfo.isReadyToSendMsgs || !txStateIsValid
                  ? ''
                  : 'pointer'
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
    // {/* </HeaderLayout> */}
  );
});
