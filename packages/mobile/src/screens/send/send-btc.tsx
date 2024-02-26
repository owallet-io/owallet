import { InteractionManager, StyleSheet, Text, View } from 'react-native';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { AddressInput, AmountInput, CurrencySelector, FeeButtons, MemoInput, TextInput } from '@src/components/input';
import { OWButton } from '@src/components/button';
import { PageWithScrollView } from '@src/components/page';
import { createTransaction, calculatorFee, formatBalance, BtcToSats, validateAddress } from '@owallet/bitcoin';
import { OWSubTitleHeader } from '@src/components/header';
import { OWBox } from '@src/components/card';
import { useSendTxConfig } from '@owallet/hooks';
import { useStore } from '@src/stores';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { spacing } from '@src/themes';
import { Dec, DecUtils } from '@owallet/unit';
import { observer } from 'mobx-react-lite';
import { useSmartNavigation } from '@src/navigation.provider';
import { navigate } from '@src/router/root';
import { SCREENS } from '@src/common/constants';
import { showToast } from '@src/utils/helper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { EthereumEndpoint } from '@owallet/common';

export const SendBtcScreen: FunctionComponent = observer(({}) => {
  const { chainStore, accountStore, keyRingStore, queriesStore, analyticsStore, sendStore } = useStore();
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();
  const chainId = route?.params?.chainId ? route?.params?.chainId : chainStore.current.chainId;
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const address = account.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts['send'],
    address,
    queries.queryBalances,
    EthereumEndpoint,
    queriesStore.get(chainStore.current.chainId).evm.queryEvmBalance,
    address,
    queries.bitcoin.queryBitcoinBalance
  );

  const data = queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.response?.data;
  const utxos = data?.utxos;
  const confirmedBalance = data?.balance;
  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError();

  const txStateIsValid = sendConfigError == null;
  const { colors } = useTheme();
  const refreshBalance = async (address) => {
    try {
      await queries.bitcoin.queryBitcoinBalance.getQueryBalance(address)?.waitFreshResponse();
    } catch (error) {
      console.log('🚀 ~ file: send-btc.tsx:112 ~ refreshBalance ~ error:', error);
    }
  };
  useEffect(() => {
    if (address) {
      refreshBalance(address);
      return;
    }

    return () => {};
  }, [address]);
  useEffect(() => {
    if (route?.params?.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient, sendConfigs.recipientConfig]);
  const onSend = useCallback(async () => {
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
          networkType: chainStore.current.networkType,
          chainId: chainId
        },

        {
          onFulfill: async (tx) => {
            console.log('🚀 ~ file: send-btc.tsx:109 ~ onSend ~ tx:', tx);

            if (tx) {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.TxSuccessResult,
                params: {
                  txHash: tx,
                  chainId: chainId
                }
              });
            }

            return;
          },
          onBroadcasted: async (txHash) => {
            try {
              analyticsStore.logEvent('Send Btc tx broadcasted', {
                chainId: chainId,
                chainName: chainStore.current.chainName,
                feeType: sendConfigs.feeConfig.feeType
              });

              return;
            } catch (error) {
              console.log('🚀 ~ file: send-btc.tsx:149 ~ onBroadcasted: ~ error:', error);
            }
          }
        },
        {
          confirmedBalance: confirmedBalance,
          utxos: utxos,
          blacklistedUtxos: [],
          amount: BtcToSats(Number(sendConfigs.amountConfig.amount)),
          feeRate: sendConfigs.feeConfig.feeRate[sendConfigs.feeConfig.feeType]
        }
      );
    } catch (error) {
      if (error?.message) {
        showToast({
          message: error?.message,
          type: 'danger'
        });
        return;
      }
      showToast({
        type: 'danger',
        message: JSON.stringify(error)
      });
      console.log('🚀 ~ file: send-btc.tsx:146 ~ onSend ~ error:', error);
    }
  }, [chainStore.current.networkType, chainId, utxos, address, confirmedBalance]);

  const styles = styling(colors);
  return (
    <PageWithScrollView backgroundColor={colors['background']}>
      <View style={{ marginBottom: 99 }}>
        {/* <OWSubTitleHeader title="Send" /> */}
        <OWBox>
          <CurrencySelector
            label="Select a token"
            placeHolder="Select Token"
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
            containerStyle={styles.containerStyle}
            selectorContainerStyle={{
              backgroundColor: colors['background-box']
            }}
          />
          <AddressInput
            placeholder="Enter receiving address"
            label="Send to"
            recipientConfig={sendConfigs.recipientConfig}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors['background-box']
            }}
          />
          <AmountInput
            placeholder="ex. 1000 BTC"
            label="Amount"
            allowMax={true}
            amountConfig={sendConfigs.amountConfig}
            labelStyle={styles.sendlabelInput}
            inputContainerStyle={{
              backgroundColor: colors['background-box']
            }}
          />

          <MemoInput
            label="Message (Optional)"
            placeholder="Type your message here"
            inputContainerStyle={{
              backgroundColor: colors['background-box']
            }}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          {/* <View style={styles.containerToggle}>
            <Toggle
              on={customFee}
              onChange={(value) => {
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
            <Text style={styles.txtFee}>Custom Fee</Text>
          </View>
           */}
          <FeeButtons
            label="Transaction Fee"
            gasLabel="gas"
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
            labelStyle={styles.sendlabelInput}
          />

          {/* <TextInput
            label="Fee"
            inputContainerStyle={{
              backgroundColor: colors['background-box']
            }}
            placeholder="Type your Fee here"
            keyboardType={'numeric'}
            labelStyle={styles.sendlabelInput}
            editable={false}
            selectTextOnFocus={false}
            value={totalFee.feeDisplay || '0'}
          /> */}
          <OWButton disabled={!account.isReadyToSendMsgs || !txStateIsValid} label="Send" onPress={onSend} />
        </OWBox>
      </View>
    </PageWithScrollView>
  );
});

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    txtFee: {
      fontWeight: '700',
      fontSize: 16,
      lineHeight: 34,
      paddingHorizontal: 8,
      color: colors['primary-text']
    },
    containerToggle: {
      flexDirection: 'row',
      paddingBottom: 24,
      alignItems: 'center'
    },
    sendInputRoot: {
      paddingHorizontal: spacing['20'],
      paddingVertical: spacing['24'],
      backgroundColor: colors['primary'],
      borderRadius: 24
    },
    sendlabelInput: {
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 22,
      color: colors['sub-primary-text'],
      marginBottom: spacing['8']
    },
    containerStyle: {
      backgroundColor: colors['background-box']
    }
  });
