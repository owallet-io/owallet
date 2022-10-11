import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSendTxConfig } from '@owallet/hooks';
import { useStore } from '../../stores';
import { EthereumEndpoint } from '@owallet/common';
import { PageWithScrollView } from '../../components/page';
import { StyleSheet, View } from 'react-native';
import { Dec } from '@owallet/unit';

import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
  TextInput
} from '../../components/input';
import { Button } from '../../components/button';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSmartNavigation } from '../../navigation.provider';
import { Buffer } from 'buffer';
import { colors, spacing } from '../../themes';
import { CText as Text } from '../../components/text';
import { Toggle } from '../../components/toggle';

const styles = StyleSheet.create({
  sendInputRoot: {
    paddingHorizontal: spacing['20'],
    paddingVertical: spacing['24'],
    backgroundColor: colors['white'],
    borderRadius: 24
  },
  sendlabelInput: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: colors['gray-900'],
    marginBottom: spacing['8']
  }
});

export const SendScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

  const [customFee, setCustomFee] = useState(false);

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
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(cur => {
        if (cur.type === 'cw20') {
          return cur.coinDenom == route.params.currency;
        }
        if (cur.coinDenom === route.params.currency) {
          return cur.coinDenom === route.params.currency;
        }
        return cur.coinMinimalDenom == route.params.currency;
      });

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
    sendConfigs.gasConfig.getError();
  // ?? sendConfigs.feeConfig.getError();
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
            placeholder="Enter receiving address"
            label="Send to"
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <AmountInput
            placeholder="ex. 1000 ORAI"
            label="Amount"
            allowMax={chainStore.current.networkType !== 'evm' ? true : false}
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
          />
          <View
            style={{
              flexDirection: 'row',
              paddingBottom: 24,
              alignItems: 'center'
            }}
          >
            <Toggle
              on={customFee}
              onChange={value => {
                setCustomFee(value);
                if (!value) {
                  if (
                    sendConfigs.feeConfig.feeCurrency &&
                    !sendConfigs.feeConfig.fee
                  ) {
                    sendConfigs.feeConfig.setFeeType('average');
                  }
                }
              }}
            />
            <Text
              style={{
                fontWeight: '700',
                fontSize: 16,
                lineHeight: 34,
                paddingHorizontal: 8
              }}
            >
              Custom Fee
            </Text>
          </View>

          {customFee && chainStore.current.networkType !== 'evm' ? (
            <TextInput
              label="Fee"
              placeholder="Type your Fee here"
              keyboardType={'numeric'}
              labelStyle={styles.sendlabelInput}
              onChangeText={text => {
                const fee = new Dec(
                  Number(text.replace(/,/g, '.')) * Math.pow(10, 6)
                );

                sendConfigs.feeConfig.setManualFee({
                  amount: fee.roundUp().toString(),
                  denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom
                });
              }}
            />
          ) : chainStore.current.networkType !== 'evm' ? (
            <FeeButtons
              label="Transaction Fee"
              gasLabel="gas"
              feeConfig={sendConfigs.feeConfig}
              gasConfig={sendConfigs.gasConfig}
              labelStyle={styles.sendlabelInput}
            />
          ) : null}

          <MemoInput
            label="Memo (Optional)"
            placeholder="Type your memo here"
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <Button
            text="Send"
            size="large"
            disabled={!account.isReadyToSendMsgs || !txStateIsValid}
            loading={account.isSendingMsg === 'send'}
            style={{
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
                      preferNoSetMemo: true,
                      networkType: chainStore.current.networkType
                    },
                    {
                      onFulfill: tx => {
                        console.log(
                          tx,
                          'TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!'
                        );
                      },
                      onBroadcasted: txHash => {
                        analyticsStore.logEvent('Send token tx broadcasted', {
                          chainId: chainStore.current.chainId,
                          chainName: chainStore.current.chainName,
                          feeType: sendConfigs.feeConfig.feeType
                        });
                        smartNavigation.pushSmart('TxPendingResult', {
                          txHash: Buffer.from(txHash).toString('hex')
                        });
                      }
                    },
                    // In case send erc20 in evm network
                    sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.startsWith(
                      'erc20'
                    )
                      ? {
                          type: 'erc20',
                          from: account.evmosHexAddress,
                          contract_addr:
                            sendConfigs.amountConfig.sendCurrency.coinMinimalDenom.split(
                              ':'
                            )[1],
                          recipient: sendConfigs.recipientConfig.recipient,
                          amount: sendConfigs.amountConfig.amount
                        }
                      : null
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
              }
            }}
          />
        </View>
      </View>
    </PageWithScrollView>
  );
});
