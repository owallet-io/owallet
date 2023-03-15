import React, { FunctionComponent, useEffect, useState } from 'react';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import {
  PageWithScrollView,
  PageWithScrollViewInBottomTabView,
  PageWithView
} from '../../components/page';
import { View, StyleSheet, Image } from 'react-native';
import { CText as Text } from '../../components/text';
import { Button } from '../../components/button';
import { useSmartNavigation } from '../../navigation.provider';
import { HomeOutlineIcon, RightArrowIcon } from '../../components/icon';
import { TendermintTxTracer } from '@owallet/cosmos';
import { Buffer } from 'buffer';
import { colors, metrics } from '../../themes';
import { Card, CardBody } from '../../components/card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { SUCCESS, TRON_ID } from '../../utils/helper';

export const TxPendingResultScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const [retry, setRetry] = useState(3);

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash: string;
          tronWeb?: any;
        }
      >,
      string
    >
  >();
  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

  const smartNavigation = useSmartNavigation();

  const isFocused = useIsFocused();
  const { bottom } = useSafeAreaInsets();

  const getTronTx = async txHash => {
    const transaction = await route.params.tronWeb?.trx.getTransactionInfo(
      txHash
    );
    setRetry(retry - 1);

    return transaction;
  };

  useEffect(() => {
    const txHash = route.params.txHash;
    const chainInfo = chainStore.getChain(chainId);
    let txTracer: TendermintTxTracer | undefined;

    if (isFocused) {
      if (chainId === TRON_ID) {
        // It may take a while to confirm transaction in TRON, show we make retry few times until it is done
        if (retry > 0) {
          let txResult;
          setTimeout(() => {
            getTronTx(txHash).then(transaction => {
              txResult = transaction;
            });
          }, 65000);
          if (txResult && Object.keys(txResult).length > 0 && retry > 0) {
            if (txResult.result === SUCCESS) {
              smartNavigation.pushSmart('TxSuccessResult', {
                txHash: txResult.id
              });
            } else {
              smartNavigation.pushSmart('TxFailedResult', {
                chainId: chainStore.current.chainId,
                txHash: txResult.id
              });
            }
          }
          if (retry < 0) {
            smartNavigation.pushSmart('TxFailedResult', {
              chainId: chainStore.current.chainId,
              txHash: txHash
            });
          }
        } else {
          smartNavigation.pushSmart('TxFailedResult', {
            chainId: chainStore.current.chainId,
            txHash: txHash
          });
        }
      } else {
        txTracer = new TendermintTxTracer(chainInfo.rpc, '/websocket');
        txTracer
          .traceTx(Buffer.from(txHash, 'hex'))
          .then(tx => {
            if (tx.code == null || tx.code === 0) {
              smartNavigation.replaceSmart('TxSuccessResult', {
                chainId,
                txHash
              });
            } else {
              smartNavigation.replaceSmart('TxFailedResult', {
                chainId,
                txHash
              });
            }
          })
          .catch(e => {
            console.log(`Failed to trace the tx (${txHash})`, e);
          });
      }
    }

    return () => {
      if (txTracer) {
        txTracer.close();
      }
    };
  }, [
    chainId,
    chainStore,
    isFocused,
    route.params.txHash,
    smartNavigation,
    retry
  ]);

  return (
    <View>
      <Card
        style={{
          backgroundColor: colors['white'],
          marginTop: 78,
          borderRadius: 24
        }}
      >
        <View
          style={{
            height: metrics.screenHeight - bottom - 74,
            paddingTop: 80
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Image
              style={{
                width: 24,
                height: 2
              }}
              fadeDuration={0}
              resizeMode="stretch"
              source={require('../../assets/image/transactions/line_pending_short.png')}
            />
            <Image
              style={{
                width: 144,
                height: 32,
                marginLeft: 8,
                marginRight: 9
              }}
              fadeDuration={0}
              resizeMode="stretch"
              source={require('../../assets/image/transactions/pending.png')}
            />
            <Image
              style={{
                width: metrics.screenWidth - 185,
                height: 2
              }}
              fadeDuration={0}
              resizeMode="stretch"
              source={require('../../assets/image/transactions/line_pending_short.png')}
            />
          </View>
          <View
            style={{
              paddingLeft: 32,
              paddingRight: 72
            }}
          >
            <Text
              style={{
                fontWeight: '700',
                fontSize: 24,
                lineHeight: 34,
                paddingTop: 44,
                paddingBottom: 16
              }}
            >
              Transaction Processing...
            </Text>
            <Text
              style={{
                fontWeight: '400',
                fontSize: 14,
                lineHeight: 20,
                color: colors['gray-150']
              }}
            >
              Hang on as the process might take some time to complete.
            </Text>
            <Image
              style={{
                width: metrics.screenWidth - 104,
                height: 12
              }}
              fadeDuration={0}
              resizeMode="stretch"
              source={require('../../assets/image/transactions/process_pedding.gif')}
            />
            <View
              style={{
                paddingTop: 32,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <HomeOutlineIcon />
              <Text
                style={{
                  paddingLeft: 6,
                  color: colors['purple-900'],
                  fontWeight: '400',
                  fontSize: 16,
                  lineHeight: 22
                }}
                onPress={() => {
                  smartNavigation.dispatch(
                    CommonActions.reset({
                      index: 1,
                      routes: [{ name: 'MainTab' }]
                    })
                  );
                }}
              >
                Return to home screen
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
});
