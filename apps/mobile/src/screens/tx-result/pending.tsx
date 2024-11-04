import React, { FunctionComponent, useEffect, useRef } from 'react';
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { Text, View, StyleSheet } from 'react-native';
import { useStyle } from '../../styles';
import { TendermintTxTracer } from '@owallet/cosmos';
import { Buffer } from 'buffer/';
import LottieView from 'lottie-react-native';
// import {SimpleGradient} from '../../components/svg';
// import {ArrowRightIcon} from '../../components/icon/arrow-right';
// import {StackNavProp} from '../../navigation';
import { Box } from '../../components/box';
// import {TextButton} from '../../components/text-button';
// import {useNotification} from '../../hooks/notification';
import { FormattedMessage, useIntl } from 'react-intl';
// import {EthTxReceipt, EthTxStatus} from '@owallet/types';
import { simpleFetch } from '@owallet/simple-fetch';
import { Network, retry, urlTxHistory } from '@owallet/common';
import { navigate, resetTo } from '@src/router/root';
import { SCREENS } from '@common/constants';
import { OWButton } from '@components/button';
import OWIcon from '@components/ow-icon/ow-icon';
import { EthTxReceipt, EthTxStatus, ResDetailAllTx } from '@owallet/types';
import { notification } from '@stores/notification';
import { API } from '@common/api';

export const TxPendingResultScreen: FunctionComponent = observer(() => {
  const { chainStore, allAccountStore } = useStore();
  const intl = useIntl();

  const isPendingGoToResult = useRef(false);
  const isPendingGotoHome = useRef(false);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId: string;
          txHash: string;
          isEvmTx?: boolean;
        }
      >,
      string
    >
  >();

  const chainId = route.params.chainId;
  const account = allAccountStore.getAccount(chainId);
  const style = useStyle();
  const navigation = useNavigation();

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const txHash = route.params.txHash;
      const isEvmTx = route.params.isEvmTx;
      const chainInfo = chainStore.getChain(chainId);
      if (chainInfo.features.includes('tron') && txHash) {
        retry(
          () => {
            return new Promise<void>(async (resolve, reject) => {
              try {
                const { status, data } = await simpleFetch(`https://tronscan.org/#/transaction/${txHash}`);
                if (data && status === 200) {
                  isPendingGoToResult.current = true;
                  navigate(SCREENS.TxSuccessResult, { chainId, txHash, isEvmTx });
                  resolve();
                }
              } catch (error) {
                reject();
                console.log('error', error);
                isPendingGoToResult.current = true;
                navigate(SCREENS.TxFailedResult, { chainId, txHash, isEvmTx });
              }
              reject();
            });
          },
          {
            maxRetries: 10,
            waitMsAfterError: 500,
            maxWaitMsAfterError: 4000
          }
        );
      }
      if (chainInfo.features.includes('oasis') && txHash) {
        simpleFetch(
          `https://www.oasisscan.com/v2/mainnet/chain/transactions?page=1&size=5&height=&address=${account.addressDisplay}`
        )
          .then(({ data }) => {
            if (!data.data?.list) return;
            for (const itemList of data.data?.list) {
              if (!itemList?.txHash) return;
              if (itemList?.txHash === txHash && itemList.status) {
                isPendingGoToResult.current = true;
                navigate(SCREENS.TxSuccessResult, { chainId, txHash, isEvmTx });
                return;
              } else {
                isPendingGoToResult.current = true;
                navigate(SCREENS.TxFailedResult, { chainId, txHash, isEvmTx });
                return;
              }
            }
          })
          .catch(err => console.error(err, 'Err oasis'));
        return;
      }

      if (isEvmTx) {
        retry(
          () => {
            return new Promise<void>(async (resolve, reject) => {
              if (chainInfo.evm === undefined) {
                return reject();
              }

              const txReceiptResponse = await simpleFetch<{
                result: EthTxReceipt | null;
                error?: Error;
              }>(chainInfo.evm.rpc, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getTransactionReceipt',
                  params: [txHash],
                  id: 1
                })
              });

              if (txReceiptResponse.data.error) {
                console.error(txReceiptResponse.data.error);
                resolve();
              }

              const txReceipt = txReceiptResponse.data.result;
              if (txReceipt) {
                if (isPendingGotoHome.current) {
                  return resolve();
                }

                if (txReceipt.status === EthTxStatus.Success) {
                  isPendingGoToResult.current = true;
                  navigate(SCREENS.TxSuccessResult, {
                    chainId,
                    txHash,
                    isEvmTx
                  });
                } else {
                  isPendingGoToResult.current = true;
                  navigate(SCREENS.TxFailedResult, {
                    chainId,
                    txHash,
                    isEvmTx
                  });
                }
                resolve();
              }

              reject();
            });
          },
          {
            maxRetries: 10,
            waitMsAfterError: 500,
            maxWaitMsAfterError: 4000
          }
        );
      } else {
        const txTracer = new TendermintTxTracer(chainInfo.rpc, '/websocket');
        txTracer
          .traceTx(Buffer.from(txHash, 'hex'))
          .then(tx => {
            if (isPendingGotoHome.current) {
              return;
            }

            if (tx.code == null || tx.code === 0) {
              isPendingGoToResult.current = true;
              navigate(SCREENS.TxSuccessResult, { chainId, txHash, isEvmTx });
            } else {
              isPendingGoToResult.current = true;
              navigate(SCREENS.TxFailedResult, { chainId, txHash, isEvmTx });
            }
          })
          .catch(e => {
            console.log(`Failed to trace the tx (${txHash})`, e);
          });

        return () => {
          txTracer.close();
        };
      }
    }
  }, [chainId, chainStore, isFocused, navigation, route.params.txHash, route.params.isEvmTx]);

  return (
    <Box style={style.flatten(['flex-grow-1', 'items-center'])}>
      <View style={style.flatten(['absolute-fill'])}>
        {/*<SimpleGradient*/}
        {/*  degree={*/}
        {/*    style.get('tx-result-screen-pending-gradient-background').degree*/}
        {/*  }*/}
        {/*  stops={*/}
        {/*    style.get('tx-result-screen-pending-gradient-background').stops*/}
        {/*  }*/}
        {/*  fallbackAndroidImage={*/}
        {/*    style.get('tx-result-screen-pending-gradient-background')*/}
        {/*      .fallbackAndroidImage*/}
        {/*  }*/}
        {/*/>*/}
      </View>
      <View style={style.flatten(['flex-2'])} />
      <View
        style={style.flatten([
          'width-122',
          'height-122',
          'border-width-8',
          'border-color-blue-300',
          'border-radius-64'
        ])}
      >
        <Box
          alignX="center"
          alignY="center"
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 10,
            ...style.flatten(['absolute'])
          }}
        >
          <LottieView
            source={require('@assets/animations/loading_owallet.json')}
            colorFilters={[
              {
                keypath: '#dot01',
                color: style.flatten(['color-blue-300']).color
              },
              {
                keypath: '#dot02',
                color: style.flatten(['color-blue-300']).color
              },
              {
                keypath: '#dot03',
                color: style.flatten(['color-blue-300']).color
              }
            ]}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </Box>
      </View>

      <Text style={style.flatten(['mobile-h3', 'color-text-high', 'margin-top-82', 'margin-bottom-32'])}>
        <FormattedMessage id="page.tx-result-pending.title" />
      </Text>

      {/* To match the height of text with other tx result screens,
         set the explicit height to upper view*/}
      <View
        style={StyleSheet.flatten([
          style.flatten(['padding-x-66']),
          {
            overflow: 'visible'
          }
        ])}
      >
        <Text style={style.flatten(['subtitle2', 'text-center', 'color-text-middle'])}>
          <FormattedMessage id="page.tx-result-pending.paragraph" />
        </Text>
      </View>

      <Box paddingX={48} height={116} marginTop={58} alignX="center">
        <OWButton
          type={'link'}
          style={style.flatten(['flex-1'])}
          size="large"
          label={intl.formatMessage({
            id: 'page.tx-result-pending.go-to-home-button'
          })}
          iconRight={color => (
            <View style={style.flatten(['margin-left-8'])}>
              {/*<ArrowRightIcon color={color} size={18} />*/}
              <OWIcon name={'tdesignarrow-right'} size={18} color={color} />
            </View>
          )}
          onPress={() => {
            isPendingGotoHome.current = true;
            // navigate(SCREENS.Home);
            resetTo(SCREENS.STACK.MainTab);
          }}
        />
      </Box>

      <View style={style.flatten(['flex-2'])} />
    </Box>
  );
});
