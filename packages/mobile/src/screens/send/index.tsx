import React, { FunctionComponent, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSendTxConfig } from '@owallet/hooks';
import { useStore } from '../../stores';
import { EthereumEndpoint } from '@owallet/common';
import { PageWithScrollView } from '../../components/page';
import { StyleSheet, View } from 'react-native';
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

const styles = StyleSheet.create({
  'padding-x-page': {
    paddingLeft: 20,
    paddingRight: 20,
  },
  'flex-grow': {
    flexGrow: 1,
  },
  'height-page-pad': {
    height: 20,
  },
  'flex-1': {
    flex: 1,
  },
  'margin-bottom-102': {
    marginBottom: 102,
  },
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

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

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
    if (route.params.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === route.params.currency
      );
      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route.params.currency, sendConfigs.amountConfig]);

  useEffect(() => {
    if (route.params.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route.params.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithScrollView
      contentContainerStyle={styles['flex-grow']}
      style={styles['padding-x-page']}
    >
      <View
        style={{
          marginTop: safeAreaInsets.top
        }}
      />
      <View style={styles['height-page-pad']} />
      <AddressInput
        label="Recipient"
        recipientConfig={sendConfigs.recipientConfig}
        memoConfig={sendConfigs.memoConfig}
      />
      <CurrencySelector
        label="Token"
        placeHolder="Select Token"
        amountConfig={sendConfigs.amountConfig}
      />
      <AmountInput label="Amount" amountConfig={sendConfigs.amountConfig} />
      <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      />
      <View style={styles['flex-1']} />
      <Button
        text="Send"
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === 'send'}
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
              console.log('send error', e);
              smartNavigation.navigateSmart('Home', {});
            }
          }
        }}
      />
      <View style={[styles['height-page-pad'], styles['margin-bottom-102']]} />
    </PageWithScrollView>
  );
});
