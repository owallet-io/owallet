import { StyleSheet, Text, View } from 'react-native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import {
  AddressInput,
  AmountInput,
  CurrencySelector,
  MemoInput,
  TextInput
} from '@src/components/input';
import { OWButton } from '@src/components/button';
import { PageWithScrollView } from '@src/components/page';
import {
  createTransaction,
  calculatorFee,
  formatBalance,
  BtcToSats,
  validateAddress
} from '@owallet/bitcoin';
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
import { delay } from '@src/utils/helper';

export const SendBtcScreen: FunctionComponent = observer(({}) => {
  const { chainStore, accountStore, queriesStore, analyticsStore, sendStore } =
    useStore();
  const chainId = chainStore?.current?.chainId;
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts['send'],
    account.legacyAddress,
    queries.queryBalances,
    null,
    null,
    null,
    queries.bitcoin.queryBitcoinBalance
  );
  const data = queries.bitcoin.queryBitcoinBalance.getQueryBalance(
    account.legacyAddress
  )?.response?.data;
  const utxos = data?.utxos;
  const confirmedBalance = data?.balance;
  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError();
  // ?? sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;
  const { colors } = useTheme();

  // console.log();
  const totalFee = useMemo(() => {
    const feeAmount = calculatorFee({
      changeAddress: sendConfigs.amountConfig.sender,
      utxos: utxos,
      message: sendConfigs.memoConfig.memo
    });
    sendConfigs.feeConfig.setManualFee({
      amount: feeAmount.toString(),
      denom: sendConfigs.feeConfig.feeCurrency.coinMinimalDenom
    });
    const feeDisplay = formatBalance({
      balance: Number(feeAmount),
      cryptoUnit: 'BTC',
      coin: chainStore.current.chainId
    });
    return {
      feeAmount,
      feeDisplay
    };
  }, [
    sendConfigs.amountConfig.sender,
    sendConfigs.memoConfig.memo,
    utxos,
    chainStore.current.chainId
  ]);
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
          chainId: chainStore.current.chainId
        },

        {
          onFulfill: async (tx) => {
            console.log('🚀 ~ file: send-btc.tsx:109 ~ onSend ~ tx:', tx);
            // await delay(1000);
            await queries.bitcoin.queryBitcoinBalance
              .getQueryBalance(account.legacyAddress)
              .waitFreshResponse();
            if (tx) {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.TxSuccessResult,
                params: {
                  txHash: tx,
                  chainId: chainStore.current.chainId
                }
              });
            }

            return;
          },
          onBroadcasted: async (txHash) => {
            console.log(
              '🚀 ~ file: send-btc.tsx:126 ~ onBroadcasted: ~ txHash:',
              txHash
            );
            analyticsStore.logEvent('Send Btc tx broadcasted', {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
              feeType: sendConfigs.feeConfig.feeType
            });

            return;
          }
        },
        {
          confirmedBalance: confirmedBalance,
          utxos: utxos,
          blacklistedUtxos: [],
          amount: BtcToSats(Number(sendConfigs.amountConfig.amount))
        }
      );
    } catch (error) {
      console.log('🚀 ~ file: send-btc.tsx:146 ~ onSend ~ error:', error);
    }
  }, [
    chainStore.current.networkType,
    chainStore.current.chainId,
    utxos,
    account.legacyAddress,
    confirmedBalance
  ]);
  const validate = validateAddress(
    'miugoiPNShxYhj5f849Y2FaynjBTGd4eKW',
    'bitcoinTestnet'
  );
  console.log(
    '🚀 ~ file: send-btc.tsx:160 ~ constSendBtcScreen:FunctionComponent=observer ~ validate:',
    validate
  );
  console.log('🚀 ~ file: send-btc.tsx:59 ~ useEffect ~ totalFee:', totalFee);
  const styles = styling(colors);
  return (
    <PageWithScrollView backgroundColor={colors['background']}>
      <View style={{ marginBottom: 99 }}>
        <OWSubTitleHeader title="Send" />
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
            label="Memo (Optional)"
            placeholder="Type your memo here"
            inputContainerStyle={{
              backgroundColor: colors['background-box']
            }}
            memoConfig={sendConfigs.memoConfig}
            labelStyle={styles.sendlabelInput}
          />
          <TextInput
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
          />
          <OWButton
            disabled={!account.isReadyToSendMsgs || !txStateIsValid}
            label="Send"
            onPress={onSend}
          />
        </OWBox>
      </View>
    </PageWithScrollView>
  );
});

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
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
