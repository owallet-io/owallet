import React, { FunctionComponent, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSendTxConfig } from '@owallet/hooks';
import { useStore } from '../../stores';
import { EthereumEndpoint } from '@owallet/common';
import { PageWithScrollView } from '../../components/page';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons
} from '../../components/input';
import { Button } from '../../components/button';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSmartNavigation } from '../../navigation.provider';
import { Buffer } from 'buffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, metrics, spacing, typography } from '../../themes';
import { CText as Text } from '../../components/text';

const styles = StyleSheet.create({
  'padding-x-page': {
    paddingLeft: 20,
    paddingRight: 20
  },
  'flex-grow': {
    flexGrow: 1
  },
  'height-page-pad': {
    height: 20
  },
  'flex-1': {
    display: 'flex',
    flex: 1
  },
  'margin-bottom-102': {
    marginBottom: 102
  }
});

export const SendScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const safeAreaInsets = useSafeAreaInsets();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();

  const smartNavigation = useSmartNavigation();

  const chainId = route?.params?.chainId
    ? route?.params?.chainId
    : chainStore?.current?.chainId;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts['send'],
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  useEffect(() => {
    if (route?.params?.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === route.params.currency
      );
      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route?.params?.currency, sendConfigs.amountConfig]);

  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithScrollView>
      <View style={{ marginBottom: 99 }}>
        <View style={{ alignItems: 'center', marginVertical: spacing['16'] }}>
          <Text
            style={{
              fontWeight: '700',
              fontSize: 24,
              lineHeight: 34
            }}
          >
            Send
          </Text>
        </View>
        <View style={styles.sendInputRoot}>
          <CurrencySelector
            label="Select a token"
            placeHolder="Select Token"
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
          />
          <AddressInput
            placeholder="Type the receiver"
            label="Send to"
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <AmountInput
            placeholder="Type the receiver"
            label="Amount"
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
          />
          <FeeButtons
            label="Transaction Fee"
            gasLabel="gas"
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
            labelStyle={styles.sendlabelInput}
          />
          <MemoInput
            label="Memo (Optional)"
            placeholder="Type your memo here"
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <TouchableOpacity
            style={{
              marginBottom: 24,
              backgroundColor: colors['purple-900'],
              borderRadius: 8
            }}
            onPress={async () => {
              if (account.isReadyToSendMsgs && txStateIsValid) {
                try {
                  await account.sendToken(
                    sendConfigs.amountConfig.amount,
                    sendConfigs.amountConfig.sendCurrency,
                    sendConfigs.recipientConfig.recipient,
                    sendConfigs.memoConfig.memo,
                    sendConfigs.feeConfig.toStdFee(),
                    {
                      preferNoSetFee: true,
                      preferNoSetMemo: true
                    },
                    {
                      onBroadcasted: (txHash) => {
                        analyticsStore.logEvent('Send token tx broadcasted', {
                          chainId: chainStore.current.chainId,
                          chainName: chainStore.current.chainName,
                          feeType: sendConfigs.feeConfig.feeType
                        });
                        smartNavigation.pushSmart('TxPendingResult', {
                          txHash: Buffer.from(txHash).toString('hex')
                        });
                      }
                    }
                  );
                } catch (e) {
                  if (e?.message === 'Request rejected') {
                    return;
                  }
                  if (
                    e?.message.includes('Cannot read properties of undefined')
                  ) {
                    return;
                  }
                  console.log('send error', e);
                  if (smartNavigation.canGoBack) {
                    smartNavigation.goBack();
                  } else {
                    smartNavigation.navigateSmart('Home', {});
                  }
                }
              );
            } catch (e) {
              if (e?.message === 'Request rejected') {
                return;
              }
              console.log('send error', e);
              smartNavigation.navigateSmart('Home', {});
            }
          }
        }}
      >
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            padding: 16
          }}
        >
          Send
        </Text>
      </TouchableOpacity>
      <View style={[styles['height-page-pad'], styles['margin-bottom-102']]} />
    </PageWithScrollView>
  );
});
